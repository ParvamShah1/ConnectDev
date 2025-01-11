import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

interface DeveloperProfile {
  displayName: string;
  email: string;
  expertise: string[];
  experience: string;
  hourlyRate: number;
  about: string;
  walletAddress: string;
}

const defaultProfile: DeveloperProfile = {
  displayName: '',
  email: '',
  expertise: [],
  experience: '',
  hourlyRate: 0,
  about: '',
  walletAddress: '',
};

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<DeveloperProfile>(defaultProfile);
  const [newExpertise, setNewExpertise] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'developers', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            displayName: data.displayName || user.displayName || '',
            email: data.email || user.email || '',
            expertise: data.expertise || [],
            experience: data.experience || '',
            hourlyRate: data.hourlyRate || 0,
            about: data.about || '',
            walletAddress: data.walletAddress || '',
          });
        } else {
          // Create initial profile if it doesn't exist
          const initialProfile = {
            ...defaultProfile,
            displayName: user.displayName || '',
            email: user.email || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(docRef, initialProfile);
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'developers', user.uid);
      const data = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, data);

      // Update the user's isNewUser status in the users collection
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isNewUser: false
      });
      
      setShowSuccess(true);
      // Force navigation to developer dashboard
      window.location.href = '/developer-dashboard';
    } catch (error) {
      console.error('Error saving profile:', error);
      setShowSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const addExpertise = () => {
    if (newExpertise && !profile.expertise.includes(newExpertise)) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, newExpertise],
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (skill: string) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter((s) => s !== skill),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191E29] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01C38D]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#191E29] flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#01C38D] mb-2">Access Denied</h2>
          <p className="text-gray-400">Please sign in to view this page.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-[#01C38D] text-white rounded-md hover:bg-[#01C38D]/90"
          >
            Go to Sign In
          </button>
        </div>
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

      <div className="relative min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section with Animation */}
          <div className="mb-12 text-center">
            <TypeAnimation
              sequence={[
                'Complete Your Profile',
                1000,
                'Showcase Your Expertise',
                1000,
                'Join Our Developer Community',
                1000,
              ]}
              wrapper="h1"
              speed={50}
              className="text-4xl font-bold text-[#01C38D]"
              repeat={Infinity}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-white text-xl"
            >
              Let clients discover your blockchain development expertise
            </motion.p>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/10 to-[#132046]/10 rounded-3xl blur-xl" />
            <div className="relative bg-[#132046]/80 backdrop-blur-sm rounded-3xl p-8 border border-[#01C38D]/20">
              {showSuccess && (
                <div className="mb-6 p-4 bg-[#01C38D]/10 text-[#01C38D] rounded-xl border border-[#01C38D]/20">
                  Profile saved successfully!
                </div>
              )}

              <div className="space-y-8 ">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[#01C38D]">Name</label>
                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        className="mt-1 block w-full px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#01C38D]">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="mt-1 block w-full px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-gray-400"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Expertise */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Expertise</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        placeholder="Add a skill (e.g., Smart Contracts, DeFi)"
                        className="flex-1 px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addExpertise}
                        className="px-6 py-3 bg-[#01C38D] text-white rounded-xl hover:bg-[#01C38D]/90"
                      >
                        Add
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((skill) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#01C38D]/10 text-[#01C38D] border border-[#01C38D]/20"
                        >
                          {skill}
                          <button
                            onClick={() => removeExpertise(skill)}
                            className="ml-2 text-[#01C38D] hover:text-[#01C38D]/80"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Experience */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Experience</h2>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    rows={4}
                    placeholder="Describe your blockchain development experience..."
                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                  />
                </motion.div>

                {/* Hourly Rate */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Hourly Rate</h2>
                  <div className="flex items-center">
                    <span className="text-[#01C38D] mr-2">$</span>
                    <input
                      type="number"
                      value={profile.hourlyRate}
                      onChange={(e) => setProfile({ ...profile, hourlyRate: Number(e.target.value) })}
                      min="0"
                      className="w-32 px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                    />
                    <span className="text-[#01C39D] ml-2">per hour</span>
                  </div>
                </motion.div>

                {/* About */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">About</h2>
                  <textarea
                    value={profile.about}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                    rows={4}
                    placeholder="Tell clients about yourself..."
                    className="mt-1 block w-full px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                  />
                </motion.div>

                {/* Wallet Address */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-4">Wallet Address</h2>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={profile.walletAddress}
                      onChange={(e) => setProfile({ ...profile, walletAddress: e.target.value })}
                      placeholder="e.g., 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                      className="flex-1 px-4 py-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 font-mono text-sm focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                    />
                    {profile.walletAddress && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigator.clipboard.writeText(profile.walletAddress)}
                        className="p-3 rounded-xl bg-[#191E29]/50 border border-[#01C38D]/20 text-[#01C38D] hover:bg-[#01C38D]/10 hover:border-[#01C38D]/40 transition-all duration-200"
                        title="Copy to clipboard"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                          />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#01C38D]/60">
                    This address will be used to receive payments from clients
                  </p>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex justify-end space-x-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-[#01C38D]/20 rounded-xl text-[#01C38D] hover:bg-[#01C38D]/10"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-3 bg-[#01C38D] text-white rounded-xl hover:bg-[#01C38D]/90 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
