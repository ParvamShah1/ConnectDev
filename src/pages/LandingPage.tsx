import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('developer');

  React.useEffect(() => {
    if (user && userRole) {
      navigate(`/${userRole}-dashboard`);
    }
  }, [user, userRole, navigate]);

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Hero Section */}
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
           

            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#132046] via-[#01C38D] to-[#01C38D]">
                DevConnect
              </span>
            </h1>
        
            <p className="mt-8 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              The next generation of development collaboration. Connect, build, and deploy in the decentralized world.
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/20 to-[#132046]/20 rounded-3xl blur-xl" />
              <div className="relative bg-[#132046]/90 backdrop-blur-sm rounded-3xl p-12 border border-[#01C38D]/20">
                <h2 className="text-4xl font-bold mb-6 text-center text-white">Ready to Build the Future?</h2>
                <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl mx-auto">
                  Join our decentralized network of developers and start building the next generation of applications.
                </p>
                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup?role=developer')}
                    className="px-8 py-4 bg-[#01C38D] text-white rounded-xl font-semibold text-lg hover:bg-[#01C38D]/90 transition-all duration-300"
                  >
                    Join as Developer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup?role=client')}
                    className="px-8 py-4 bg-[#132046] text-white rounded-xl font-semibold text-lg border border-[#01C38D] hover:bg-[#132046]/80 transition-all duration-300"
                  >
                    Join as Client
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Hexagons */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/20 to-[#132046]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative p-8 bg-[#132046]/90 backdrop-blur-sm rounded-2xl border border-[#01C38D]/20">
                  <div className="hexagon-icon w-16 h-16 bg-[#01C38D]/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Project Showcase Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01C38D] to-[#132046]">
                Why Choose DevConnect?
              </span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Blockchain Features */}
              <div className="space-y-8">
                {blockchainFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#132046] rounded-xl flex items-center justify-center border border-[#01C38D]/20">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Technology Stack Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/10 to-[#132046]/10 rounded-3xl blur-xl" />
                <div className="relative bg-[#132046]/80 backdrop-blur-sm rounded-3xl p-8 border border-[#01C38D]/20">
                  <h3 className="text-2xl font-bold text-white mb-6">Our Technology Stack</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {techStackFeatures.map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className="p-4 bg-[#191E29]/50 rounded-xl border border-[#01C38D]/10"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#01C38D]/10 flex items-center justify-center">
                            {item.icon}
                          </div>
                          <h4 className="text-[#01C38D] font-semibold">{item.title}</h4>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Section */}
          <footer className="mt-32 border-t border-[#132046] pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <h3 className="text-[#01C38D] font-bold text-lg mb-4">DevConnect</h3>
                <p className="text-gray-400">Building the future of decentralized development collaboration.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>How it Works</li>
                  <li>Security</li>
                  <li>Pricing</li>
                  <li>FAQ</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentation</li>
                  <li>API Reference</li>
                  <li>Blog</li>
                  <li>Community</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Twitter</li>
                  <li>Discord</li>
                  <li>GitHub</li>
                  <li>LinkedIn</li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm">
              <p>© 2024 DevConnect. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

// Features data remains the same
const features = [
  {
    title: "Real-time Video Calls",
    description: "Connect face-to-face with developers through high-quality video calls.",
    icon: <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  },
  {
    title: "Expert Developers",
    description: "Access a network of skilled developers across various technologies.",
    icon: <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  },
  {
    title: "Secure Platform",
    description: "Your data and communications are protected with enterprise-grade security.",
    icon: <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  }
];

// Add these new data arrays
const blockchainFeatures = [
  {
    title: "Smart Contract Integration",
    description: "Secure payment and contract management through blockchain technology.",
    icon: <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  },
  {
    title: "Decentralized Identity",
    description: "Verify and manage developer credentials using blockchain technology.",
    icon: <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  },
  {
    title: "Transparent Reputation System",
    description: "Build and verify your reputation through immutable blockchain records.",
    icon: <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  },
  {
    title: "Decentralized Storage",
    description: "Store project files and documentation using IPFS technology.",
    icon: <svg className="w-6 h-6 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  }
];

const techStackFeatures = [
  {
    title: "Smart Contracts",
    description: "Ethereum-based contracts for secure transactions and automated agreements between parties",
    icon: <svg className="w-4 h-4 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  },
  {
    title: "IPFS Storage",
    description: "Decentralized storage for project files and documentation ensuring data permanence",
    icon: <svg className="w-4 h-4 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  },
  {
    title: "Web3 Integration",
    description: "Seamless blockchain wallet integration for secure authentication and transactions",
    icon: <svg className="w-4 h-4 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  },
  {
    title: "React Framework",
    description: "Modern frontend architecture for a responsive and interactive user experience",
    icon: <svg className="w-4 h-4 text-[#01C38D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  },
 
];

export default LandingPage;