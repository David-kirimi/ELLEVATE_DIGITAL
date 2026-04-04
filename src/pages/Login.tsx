import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle, Chrome, Loader2 } from 'lucide-react';
import { loginWithEmail, signInWithGoogle } from '../firebase';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);
    const loadingToast = toast.loading("Signing in...");
    try {
      // Special check for superadmin bootstrap
      if (email === 'superadmin@eliax.com' && password === '123456') {
        try {
          const user = await loginWithEmail(email, password);
          // Ensure profile exists even if login was successful
          const { createUserProfile } = await import('../firebase');
          await createUserProfile(user, { role: 'admin' });
        } catch (err: any) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
            // Bootstrap superadmin
            const { signupWithEmail } = await import('../firebase');
            await signupWithEmail(email, password, 'Super Admin', 'admin');
          } else {
            throw err;
          }
        }
      } else {
        await loginWithEmail(email, password);
      }
      toast.success("Welcome back!", { id: loadingToast });
      navigate('/');
    } catch (err: any) {
      console.error("Login error details:", err);
      let msg = err.message;
      if (err.code === 'auth/network-request-failed') {
        msg = "Network error: Please check your internet connection or disable any ad-blockers that might be blocking Firebase.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password. Please try again.";
      } else if (err.message?.includes('Missing or insufficient permissions')) {
        msg = "Database permission error. Please contact support or try again later.";
      }
      setError(msg);
      toast.error(msg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const loadingToast = toast.loading("Connecting to Google...");
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!", { id: loadingToast });
      navigate('/');
    } catch (err: any) {
      let msg = err.message;
      if (err.code === 'auth/network-request-failed') {
        msg = "Network error: Please check your internet connection or disable any ad-blockers that might be blocking Firebase.";
      }
      setError(msg);
      toast.error(msg, { id: loadingToast });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-sm border border-gray-100"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your Eliax account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn className="w-5 h-5 mr-2" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="mt-8 w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Chrome className="w-5 h-5 mr-2 text-blue-500" /> Sign in with Google
            </>
          )}
        </button>

        <p className="mt-10 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-orange font-bold hover:underline">Sign up for free</Link>
        </p>
      </motion.div>
    </div>
  );
}
