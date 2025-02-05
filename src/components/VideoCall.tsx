import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CallParticipant {
  uid: string;
  agoraUid: number;
  role: 'client' | 'developer';
}

interface CallData {
  clientId: string;
  developerId: string;
  status: string;
  participants: Record<string, CallParticipant>;
}

const VideoCall = () => {
  const { callId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [localTracks, setLocalTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(
    null
  );
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [error, setError] = useState<string>('');
  const [callData, setCallData] = useState<CallData | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'developer' | null>(null);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [localAgoraUid, setLocalAgoraUid] = useState<number | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const generateUID = () => {
    return Math.floor(Math.random() * 999999) + 1;
  };

  const cleanupLocalVideo = () => {
    if (localTracks) {
      localTracks[0].close();
      localTracks[1].close();
      setLocalTracks(null);
    }
  };

  const cleanupRemoteVideo = () => {
    if (remoteUser) {
      if (remoteUser.videoTrack) {
        remoteUser.videoTrack.stop();
      }
      if (remoteUser.audioTrack) {
        remoteUser.audioTrack.stop();
      }
      setRemoteUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeCall = async () => {
      if (!callId || !user) return;

      try {
        const callDoc = await getDoc(doc(db, 'calls', callId));
        if (!callDoc.exists()) {
          throw new Error('Call not found');
        }

        const data = callDoc.data() as CallData;
        setCallData(data);

        if (user.uid !== data.clientId && user.uid !== data.developerId) {
          throw new Error('You are not authorized to join this call');
        }

        const role = user.uid === data.clientId ? 'client' : 'developer';
        setUserRole(role);

        const appId = import.meta.env.VITE_AGORA_APP_ID;
        if (!appId) {
          throw new Error('Agora App ID not found');
        }

        const agoraClient = AgoraRTC.createClient({ 
          mode: 'rtc', 
          codec: 'vp8',
          retry: {
            maxRetryCount: 3,
            maxRetryDuration: 1000,
            timeout: 15000
          }
        });

        agoraClient.on('connection-state-change', (curState, prevState, reason) => {
          console.log('Connection state changed:', prevState, '=>', curState, 'reason:', reason);
          if (curState === 'DISCONNECTED' && reason !== 'LEAVE') {
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Attempting reconnection (${retryCount}/${maxRetries})...`);
              setTimeout(() => {
                if (mounted) initializeCall();
              }, 2000 * retryCount);
            }
          }
        });

        if (mounted) {
          setClient(agoraClient);
        }

        const agoraUid = generateUID();
        setLocalAgoraUid(agoraUid);

        await agoraClient.join(appId, callId, null, agoraUid);
        console.log('Successfully joined channel');

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          {
            encoderConfig: {
              width: 640,
              height: 360,
              frameRate: 30,
              bitrateMin: 400,
              bitrateMax: 800,
            }
          },
          {
            AEC: true,
            AGC: true,
            ANS: true
          }
        );
        
        if (mounted) {
          setLocalTracks([audioTrack, videoTrack]);
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
        }

        await agoraClient.publish([audioTrack, videoTrack]);
        console.log('Successfully published local tracks');

        await updateDoc(doc(db, 'calls', callId), {
          status: 'active',
          [`participants.${user.uid}`]: {
            uid: user.uid,
            agoraUid,
            role,
          },
        });

        agoraClient.on('user-published', async (user, mediaType) => {
          console.log('Remote user published:', user.uid, mediaType);
          try {
            await agoraClient.subscribe(user, mediaType);
            console.log('Successfully subscribed to remote user:', user.uid);

            if (mediaType === 'video') {
              setRemoteUser(user);
              if (remoteVideoRef.current && user.videoTrack) {
                await user.videoTrack.play(remoteVideoRef.current);
                console.log('Remote video track playing');
              }
            }

            if (mediaType === 'audio' && user.audioTrack) {
              await user.audioTrack.play();
              console.log('Remote audio track playing');
            }
          } catch (error) {
            console.error('Error subscribing to remote user:', error);
            // Attempt to recover from subscription error
            setTimeout(async () => {
              try {
                await agoraClient.subscribe(user, mediaType);
                console.log('Successfully resubscribed to remote user:', user.uid);
              } catch (retryError) {
                console.error('Retry subscription failed:', retryError);
              }
            }, 2000);
          }
        });

        agoraClient.on('user-unpublished', async (user, mediaType) => {
          console.log('Remote user unpublished:', user.uid, mediaType);
          try {
            await agoraClient.unsubscribe(user, mediaType);
            
            if (mediaType === 'video') {
              setRemoteUser(prev => prev?.uid === user.uid ? null : prev);
            }
          } catch (error) {
            console.error('Error unsubscribing from remote user:', error);
          }
        });

        agoraClient.on('user-left', async (user) => {
          console.log('Remote user left:', user.uid);
          try {
            await agoraClient.unsubscribe(user);
            setRemoteUser(prev => prev?.uid === user.uid ? null : prev);
          } catch (error) {
            console.error('Error handling user left:', error);
          }
        });

      } catch (err) {
        console.error('Error setting up call:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to set up call');
        }
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      if (localTracks) {
        localTracks[0].close();
        localTracks[1].close();
      }
      if (remoteUser) {
        if (remoteUser.videoTrack) {
          remoteUser.videoTrack.stop();
        }
        if (remoteUser.audioTrack) {
          remoteUser.audioTrack.stop();
        }
      }
      client?.removeAllListeners();
      client?.leave();
    };
  }, [callId, user]);

  // Get the other participant's role
  const getOtherParticipantRole = () => {
    if (!callData || !user) return null;
    return user.uid === callData.clientId ? 'Developer' : 'Client';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local video */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <div 
            ref={localVideoRef}
            className="w-full h-full"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            You ({userRole === 'client' ? 'Client' : 'Developer'})
          </div>
        </div>

        {/* Remote video */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <div 
            ref={remoteVideoRef}
            className="w-full h-full"
          />
          {remoteUser ? (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {getOtherParticipantRole()}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Waiting for {getOtherParticipantRole()} to join...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full px-6 py-3 space-x-4">
          <button
            onClick={() => {
              if (localTracks) {
                localTracks[0].setEnabled(!localTracks[0].enabled);
              }
            }}
            className="text-white hover:text-indigo-400"
          >
            {localTracks && !localTracks[0].enabled ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              if (localTracks) {
                localTracks[1].setEnabled(!localTracks[1].enabled);
              }
            }}
            className="text-white hover:text-indigo-400"
          >
            {localTracks && !localTracks[1].enabled ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={async () => {
              if (localTracks) {
                localTracks[0].close();
                localTracks[1].close();
              }
              await client?.leave();
              navigate(-1);
            }}
            className="text-red-500 hover:text-red-400"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
