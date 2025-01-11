import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import axios from 'axios';

const appId = import.meta.env.VITE_AGORA_APP_ID;
const appCertificate = import.meta.env.VITE_AGORA_APP_CERTIFICATE;

if (!appId) throw new Error('Agora App ID is required');
if (!appCertificate) throw new Error('Agora App Certificate is required');

export const createAgoraClient = (): IAgoraRTCClient => {
  return AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8'
  });
};

export const getAgoraToken = async (channelName: string, uid: string): Promise<string> => {
  try {
    const response = await axios.post('http://localhost:3001/token', {
      channelName,
      uid,
      role: 'publisher'
    });

    if (response.data && response.data.token) {
      return response.data.token;
    }
    throw new Error('Failed to generate token');
  } catch (error) {
    console.error('Error generating Agora token:', error);
    throw new Error('Failed to generate Agora token');
  }
};
