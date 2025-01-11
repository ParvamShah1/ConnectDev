import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Developers</h1>

          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Expertise
              </label>
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Skills</option>
                {allExpertise.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Hourly Rate ($)
              </label>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Developer List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevelopers.map((developer) => (
              <div
                key={developer.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {developer.displayName || developer.email}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${developer.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                    <p className="text-lg font-semibold text-indigo-600">${developer.hourlyRate}/hr</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {developer.expertise?.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Experience</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{developer.experience}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">About</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{developer.about}</p>
                  </div>

                  <button
                    onClick={() => initiateCall(developer)}
                    disabled={activeCall !== null}
                    className={`w-full px-4 py-2 rounded-md text-white ${
                      activeCall
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {activeCall?.developerId === developer.id
                      ? 'Call Pending...'
                      : activeCall
                      ? 'In Another Call'
                      : 'Start Video Call'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDevelopers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No developers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Call Request Modal */}
      {activeCall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Call Request Pending</h2>
            <p className="text-gray-600 mb-4">
              Waiting for the developer to accept your call request...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
