import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DeveloperStatus {
  isOnline: boolean;
  hourlyRate: number;
}

interface CallRequest {
  id: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const DeveloperDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DeveloperStatus>({ isOnline: false, hourlyRate: 0 });
  const [showRatePrompt, setShowRatePrompt] = useState(false);
  const [newRate, setNewRate] = useState<number>(0);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Real-time listener for developer status
    const developerRef = doc(db, 'developers', user.uid);
    const unsubscribe = onSnapshot(developerRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setStatus({
            isOnline: data.isOnline || false,
            hourlyRate: data.hourlyRate || 0
          });
          setNewRate(data.hourlyRate || 0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching developer status:', error);
        setLoading(false);
      }
    );

    // Listen for call requests
    const callsRef = collection(db, 'calls');
    const callsQuery = query(
      callsRef,
      where('developerId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const callsUnsubscribe = onSnapshot(callsQuery, (snapshot) => {
      const requests: CallRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          clientId: data.clientId,
          clientName: data.clientName,
          timestamp: data.timestamp,
          status: data.status
        });
      });
      setCallRequests(requests);
    });

    return () => {
      unsubscribe();
      callsUnsubscribe();
    };
  }, [user, navigate]);

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const developerRef = doc(db, 'developers', user.uid);
      const developerDoc = await getDoc(developerRef);

      if (developerDoc.exists()) {
        if (isOnline) {
          setShowRatePrompt(true);
          return;
        }

        await updateDoc(developerRef, {
          isOnline,
          lastStatusUpdate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const handleRateSubmit = async () => {
    if (!user || newRate <= 0) return;

    try {
      const developerRef = doc(db, 'developers', user.uid);
      await updateDoc(developerRef, {
        hourlyRate: newRate,
        isOnline: true,
        lastStatusUpdate: new Date().toISOString()
      });
      setShowRatePrompt(false);
    } catch (error) {
      console.error('Error updating hourly rate:', error);
    }
  };

  const handleAcceptCall = async (callId: string) => {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      });
      navigate(`/video-call/${callId}`);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleDeclineCall = async (callId: string) => {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191E29] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01C38D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191E29] overflow-hidden relative">
      {/* Animated Grid Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#132046_1px,transparent_1px),linear-gradient(to_bottom,#132046_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#01C38D]/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen p-8">
        {/* Add Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-8 z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-[#01C38D] hover:bg-[#01C38D] hover:text-white hover:border-none transition-all duration-200 flex items-center space-x-2"
          >
            <span>{loading ? 'Logging out...' : 'Logout'}</span>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </motion.button>
        </motion.div>

        {/* Header Section */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-[#01C38D] mb-4"
          >
            Developer Dashboard
          </motion.h1>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Status and Profile Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="px-6 py-2 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-[#01C38D] hover:bg-[#01C38D] hover:text-white hover:border-none transition-all duration-200"
            >
              Edit Profile
            </motion.button>
            <div className="flex items-center space-x-4">
              <span className="text-[#01C38D]">Status:</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateOnlineStatus(!status.isOnline)}
                className={`px-6 py-2 rounded-xl transition-colors duration-200 ${
                  status.isOnline
                    ? 'bg-[#01C38D] text-white'
                    : 'bg-[#191E29]/50 border border-[#01C38D]/20 text-[#01C38D]'
                }`}
              >
                {status.isOnline ? 'Online' : 'Offline'}
              </motion.button>
            </div>
          </motion.div>

          {/* Current Rate Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#01C38D] mb-2">Current Hourly Rate</h2>
                <p className="text-2xl font-bold text-white">${status.hourlyRate}/hr</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRatePrompt(true)}
                className="px-6 py-2 rounded-xl bg-[#01C38D] text-white hover:bg-[#01C38D]/90 transition-colors duration-200"
              >
                Change Rate
              </motion.button>
            </div>
          </motion.div>

          {/* Call Requests */}
          {callRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-[#01C38D] mb-4">Incoming Call Requests</h2>
              {callRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/10 to-[#132046]/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative bg-[#191E29]/50 backdrop-blur-sm rounded-xl p-6 border border-[#01C38D]/20 hover:border-[#01C38D]/40 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{request.clientName}</p>
                        <p className="text-sm text-[#01C38D]/80">
                          {new Date(request.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcceptCall(request.id)}
                          className="px-6 py-2 rounded-xl bg-[#01C38D] text-white hover:bg-[#01C38D]/90 transition-colors duration-200"
                        >
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeclineCall(request.id)}
                          className="px-6 py-2 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-[#01C38D] hover:bg-[#01C38D]/10 hover:border-[#01C38D]/40 transition-all duration-200"
                        >
                          Decline
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Rate Prompt Modal */}
          {showRatePrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#132046]/90 rounded-2xl p-8 max-w-md w-full mx-4 border border-[#01C38D]/20"
              >
                <h2 className="text-xl font-semibold text-[#01C38D] mb-4">
                  {status.isOnline ? 'Update Your Hourly Rate' : 'Set Your Hourly Rate'}
                </h2>
                <p className="text-gray-300 mb-4">
                  {status.isOnline
                    ? 'Update your hourly rate. This will be visible to clients.'
                    : 'Please set your hourly rate before going online. You can change this later.'}
                </p>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-[#01C38D]">$</span>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    min="0"
                    className="flex-1 px-4 py-2 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D]"
                  />
                  <span className="text-[#01C38D]">/hr</span>
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRatePrompt(false)}
                    className="px-6 py-2 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-[#01C38D] hover:bg-[#01C38D]/10 hover:border-[#01C38D]/40 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRateSubmit}
                    disabled={newRate <= 0}
                    className="px-6 py-2 rounded-xl bg-[#01C38D] text-white hover:bg-[#01C38D]/90 transition-colors duration-200 disabled:opacity-50"
                  >
                    {status.isOnline ? 'Update Rate' : 'Save & Go Online'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
