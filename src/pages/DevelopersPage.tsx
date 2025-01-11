import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoCall from '../components/VideoCall';

interface Developer {
  id: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  experience?: string;
  skills?: string[];
  university?: string;
  degree?: string;
  github?: string;
  photoURL?: string;
  userId?: string;
  available?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const DevelopersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        console.log('Starting to fetch developers...');
        const querySnapshot = await getDocs(collection(db, 'developers'));
        console.log('Got query snapshot:', querySnapshot.size, 'documents');
        const devsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Document data:', data);
          
          // Parse skills from string to array if it exists
          const skills = data.skills ? 
            (typeof data.skills === 'string' ? 
              data.skills.split(',').map(s => s.trim()) : 
              Array.isArray(data.skills) ? data.skills : []
            ) : [];

          return {
            id: doc.id,
            ...data,
            skills,
            available: true // Setting default as true for now
          } as Developer;
        });
        console.log('Processed developers data:', devsData);
        setDevelopers(devsData);
      } catch (error) {
        console.error('Error fetching developers:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  const handleContact = (developer: Developer) => {
    if (!user) {
      alert('Please log in to contact developers');
      return;
    }
    setSelectedDeveloper(developer);
    setShowVideoCall(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Developers</h1>
        <button
          onClick={() => navigate('/join-developer')}
          className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2"
        >
          Join as Developer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((developer) => (
          <div key={developer.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={developer.photoURL || 'https://via.placeholder.com/150'}
                  alt={`${developer.firstName || ''} ${developer.lastName || ''}`}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {`${developer.firstName || ''} ${developer.lastName || ''}`}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {developer.university && developer.degree && 
                      `${developer.degree} at ${developer.university}`
                    }
                  </div>
                </div>
              </div>

              {developer.bio && (
                <p className="mt-4 text-gray-600">{developer.bio}</p>
              )}

              {developer.skills && developer.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(developer.skills) && developer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 font-semibold">
                    {developer.experience || '0-1'} years
                  </span>
                </div>
                <button
                  onClick={() => handleContact(developer)}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showVideoCall && selectedDeveloper && user && (
        <VideoCall
          developerId={selectedDeveloper.userId || selectedDeveloper.id}
          userId={user.uid}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default DevelopersPage;