import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/client-dashboard');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle('client');
      navigate('/client-dashboard');
    } catch (error) {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="relative min-h-screen flex items-center">
        {/* Left side with typing animation */}
        <div className="w-3/5 pl-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <TypeAnimation
              sequence={[
                'Welcome Back to DevConnect',
                1000,
                'Continue Your Journey',
                1000,
                'Build With Us',
                1000,
              ]}
              wrapper="h1"
              speed={50}
              className="text-6xl font-bold text-[#01C38D]"
              style={{ color: '#01C38D' }}
              repeat={Infinity}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-xl max-w-xl"
            >
              Resume your blockchain journey. Connect, build, and innovate with the best in Web3.
            </motion.p>
          </motion.div>
        </div>

        {/* Right side with form */}
        <div className="w-2/5 p-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-sm mx-20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#01C38D]/10 to-[#132046]/10 rounded-2xl blur-xl" />
              <div className="relative bg-[#132046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#01C38D]/20">
                <h2 className="text-2xl font-bold mb-6 text-[#01C38D]">Sign In</h2>

                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#01C38D]">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm rounded-lg bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#01C38D]">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm rounded-lg bg-[#191E29]/50 border border-[#01C38D]/20 text-white placeholder-gray-400 focus:border-[#01C38D] focus:ring-[#01C38D] focus:ring-opacity-50"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 text-sm rounded-lg font-medium text-white bg-[#01C38D] hover:bg-[#01C38D]/90 transition-colors duration-200"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </motion.button>
                </form>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#01C38D]/20" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-[#132046] text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="mt-4 w-full flex justify-center items-center px-4 py-2 text-sm rounded-lg bg-[#191E29]/50 hover:bg-[#191E29]/70 border border-[#01C38D]/20 text-white transition-colors duration-200"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="w-4 h-4 mr-2"
                    />
                    <span>Sign in with Google</span>
                  </motion.button>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-medium text-[#01C38D] hover:text-[#01C38D]/80"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
