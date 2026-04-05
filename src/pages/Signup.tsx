import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, AlertCircle, Chrome, Trophy, ChevronRight } from 'lucide-react';
import { signupWithEmail, signInWithGoogle } from '../firebase';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fan');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);
    const loadingToast = toast.loading("Creating your account...");
    try {
      await signupWithEmail(email, password, name, role);
      toast.success("Account created! Welcome to Eliax.", { id: loadingToast });
      
      if (role === 'fan') {
        navigate('/');
      } else {
        navigate(`/apply?role=${role}`);
      }
    } catch (err: any) {
      console.error("Signup error details:", err);
      let msg = err.message;
      if (err.code === 'auth/network-request-failed') {
        msg = "Network error: Please check your internet connection or disable any ad-blockers that might be blocking Firebase.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "This email is already registered. Please login instead.";
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
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500">Join the Eliax community today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Account Type</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
              >
                <option value="fan">Fan (Skip Questionnaire)</option>
                <option value="contestant">Contestant (Requires Application)</option>
                <option value="creator">Creator (Requires Application)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Creating account...' : (
              <>
                <UserPlus className="w-5 h-5 mr-2" /> Create Account
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
              <Chrome className="w-5 h-5 mr-2 text-blue-500" /> Sign up with Google
            </>
          )}
        </button>

        <div className="mt-10 p-6 bg-orange-50 rounded-3xl border border-orange-100">
          <div className="flex items-start">
            <Trophy className="w-5 h-5 text-brand-orange mr-3 mt-1" />
            <div>
              <p className="text-sm font-bold text-brand-orange mb-1">Want to be a contestant?</p>
              <p className="text-xs text-orange-600/70 mb-3">Sign up as a fan first, then apply to become a contestant.</p>
              <Link to="/apply" className="text-xs font-bold text-brand-orange hover:underline flex items-center">
                Learn more about applications <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-orange font-bold hover:underline">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
