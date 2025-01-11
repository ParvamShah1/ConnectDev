import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Developer {
  id: string;
  displayName: string;
  email: string;
  expertise: string[];
  experience: string;
  hourlyRate: number;
  about: string;
  isOnline: boolean;
}

interface CallStatus {
  id: string;
  developerId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');
  const [maxRate, setMaxRate] = useState<number>(1000);
  const [activeCall, setActiveCall] = useState<CallStatus | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Real-time listener for online developers
    const developersRef = collection(db, 'developers');
    const q = query(developersRef, where('isOnline', '==', true));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const devs: Developer[] = [];
        snapshot.forEach((doc) => {
          // Only add developers who are not the current user
          if (doc.id !== user.uid) {
            devs.push({ id: doc.id, ...doc.data() } as Developer);
          }
        });
        setDevelopers(devs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching developers:', error);
        setLoading(false);
      }
    );

    // Listen for call status updates
    if (activeCall) {
      const callRef = collection(db, 'calls');
      const callQuery = query(
        callRef,
        where('clientId', '==', user.uid),
        where('status', 'in', ['pending', 'accepted'])
      );

      const callUnsubscribe = onSnapshot(callQuery, (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'accepted') {
            navigate(`/video-call/${doc.id}`);
          }
        });
      });

      return () => {
        unsubscribe();
        callUnsubscribe();
      };
    }

    return () => unsubscribe();
  }, [user, navigate, activeCall]);

  const initiateCall = async (developer: Developer) => {
    if (!user) return;

    try {
      const callDoc = await addDoc(collection(db, 'calls'), {
        clientId: user.uid,
        clientName: user.displayName || user.email,
        developerId: developer.id,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      setActiveCall({
        id: callDoc.id,
        developerId: developer.id,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const filteredDevelopers = developers.filter((dev) => {
    const matchesExpertise = !selectedExpertise || 
      dev.expertise?.some(skill => 
        skill.toLowerCase().includes(selectedExpertise.toLowerCase())
      );
    const matchesRate = !maxRate || (dev.hourlyRate || 0) <= maxRate;
    return matchesExpertise && matchesRate;
  });

  const allExpertise = Array.from(
    new Set(
      developers.flatMap((dev) => dev.expertise || [])
    )
  ).sort();

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

  if (!user) {
    navigate('/');
    return null;
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
        {/* Logout Button */}
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
            Developer Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white text-xl"
          >
            Connect with top blockchain developers in real-time
          </motion.p>
        </div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#191E29] border border-[#01C38D]/20 text-white appearance-none hover:border-[#01C38D]/40 focus:border-[#01C38D] focus:ring-1 focus:ring-[#01C38D] transition-colors"
              >
                <option value="">All Skills</option>
                {allExpertise.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                min="0"
                placeholder="Max hourly rate ($)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 hover:border-[#01C38D]/40 focus:border-[#01C38D] focus:ring-1 focus:ring-[#01C38D] transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-[#01C38D] mr-5">$</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Developer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredDevelopers.map((developer, index) => (
            <motion.div
              key={developer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/10 to-[#132046]/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
              <div className="relative bg-[#191E29]/50 backdrop-blur-sm rounded-xl p-6 border border-[#01C38D]/20 hover:border-[#01C38D]/40 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {developer.displayName || developer.email}
                  </h3>
                  <div className={`w-3 h-3 rounded-full ${developer.isOnline ? 'bg-[#01C38D]' : 'bg-gray-400'}`} />
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-[#01C38D]">Hourly Rate</p>
                  <p className="text-lg font-semibold text-white">${developer.hourlyRate}/hr</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-[#01C38D] mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {developer.expertise?.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#01C38D]/10 text-[#01C38D] border border-[#01C38D]/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-[#01C38D] mb-1">Experience</p>
                  <p className="text-sm text-gray-300 line-clamp-3">{developer.experience}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-[#01C38D] mb-1">About</p>
                  <p className="text-sm text-gray-300 line-clamp-3">{developer.about}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => initiateCall(developer)}
                  disabled={activeCall !== null}
                  className={`w-full px-4 py-3 rounded-xl text-white ${
                    activeCall
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#01C38D] hover:bg-[#01C38D]/90'
                  } transition-colors duration-200`}
                >
                  {activeCall?.developerId === developer.id
                    ? 'Call Pending...'
                    : activeCall
                    ? 'In Another Call'
                    : 'Start Video Call'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-[#01C38D]/80">No developers found matching your criteria.</p>
          </motion.div>
        )}
      </div>

      {/* Call Request Modal */}
      {activeCall && (
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
            <h2 className="text-2xl font-semibold text-[#01C38D] mb-4">Call Request Pending</h2>
            <p className="text-gray-300 mb-6">
              Waiting for the developer to accept your call request...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01C38D]"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ClientDashboard;
