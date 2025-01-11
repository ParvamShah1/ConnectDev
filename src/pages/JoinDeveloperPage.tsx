import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const JoinDeveloperPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    experience: '',
    skills: '',
    university: '',
    degree: '',
    github: '',
    photoURL: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Auth State:', { user });
    
    // Only redirect if explicitly null (not undefined or loading)
    if (user === null) {
      alert('Please log in to join as a developer');
      navigate('/developers');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting with user:', user);
    
    if (!user) {
      alert('Please log in to join as a developer');
      return;
    }

    setLoading(true);

    try {
      // Add timestamp fields and user ID
      const developerData = {
        ...formData,
        userId: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Saving developer data:', developerData);

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'developers'), developerData);
      console.log('Document written with ID:', docRef.id);
      
      // Redirect to developers page
      navigate('/developers');
    } catch (error) {
      console.error('Error adding developer:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      alert('Error adding developer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Join as Developer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            required
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            required
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, TypeScript, Node.js"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700">
              University
            </label>
            <input
              type="text"
              id="university"
              name="university"
              required
              value={formData.university}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
              Degree
            </label>
            <input
              type="text"
              id="degree"
              name="degree"
              required
              value={formData.degree}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <input
            type="text"
            id="experience"
            name="experience"
            required
            value={formData.experience}
            onChange={handleChange}
            placeholder="0-1, 1-3, 3-5, 5+"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700">
            GitHub Profile URL
          </label>
          <input
            type="url"
            id="github"
            name="github"
            required
            value={formData.github}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
            Profile Photo URL
          </label>
          <input
            type="url"
            id="photoURL"
            name="photoURL"
            required
            value={formData.photoURL}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/developers')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinDeveloperPage;
