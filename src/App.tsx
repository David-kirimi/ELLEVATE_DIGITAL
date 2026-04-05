import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail,
  Phone,
  MapPin,
  Shield,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contestants from './pages/Contestants';
import Points from './pages/Points';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ContestantApplication from './pages/ContestantApplication';
import ContestantDashboard from './pages/ContestantDashboard';

export default function App() {
  const location = useLocation();
  const { isAdmin, loading: authLoading } = useAuth();
  const [siteContent, setSiteContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(true);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const unsubContent = onSnapshot(doc(db, 'siteSettings', 'content'), (doc) => {
      if (doc.exists()) {
        setSiteContent(doc.data());
      }
      setContentLoading(false);
    }, (error) => {
      console.error("App.tsx siteSettings error:", error);
      setContentLoading(false);
    });

    return () => unsubContent();
  }, []);

  if (authLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold animate-pulse">Initializing Eliax...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      
      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${siteContent?.whatsappNumber?.replace(/\D/g, '') || '254794415006'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold text-sm whitespace-nowrap">
          Chat with us
        </span>
      </a>
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contestants" element={<Contestants />} />
          <Route path="/points" element={<Points />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/creator" element={<CreatorDashboard />} />
          <Route 
            path="/admin" 
            element={
              isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />
            } 
          />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/apply" element={<ContestantApplication />} />
          <Route path="/contestant-dashboard" element={<ContestantDashboard />} />
          {/* Fallback route */}
          <Route 
            path="*" 
            element={
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />
            } 
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-brand-black text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <a href="/" className="text-3xl font-display font-bold mb-6 block">
                {siteContent?.logoText || 'ELIAX'}<span className="text-brand-orange">{siteContent?.logoSubtext || 'DIGITAL'}</span>
              </a>
              <p className="text-gray-400 max-w-sm mb-4">
                {siteContent?.footerText || "Kenya's leading digital marketing agency and competition platform. We bring customers to your brand and stars to the spotlight."}
              </p>
              <div className="flex items-center text-gray-400 mb-8">
                <Phone className="w-4 h-4 mr-2" /> {siteContent?.contactPhone || '+254 794 415006'}
              </div>
              <div className="flex space-x-4">
                <a href={siteContent?.socialInstagram || "#"} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Instagram size={20} /></a>
                <a href={siteContent?.socialFacebook || "#"} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Facebook size={20} /></a>
                <a href={siteContent?.socialTwitter || "#"} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Twitter size={20} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/contestants" className="hover:text-white transition-colors">Contestants</Link></li>
                <li><Link to="/points" className="hover:text-white transition-colors">Buy Points</Link></li>
                {isAdmin && (
                  <>
                    <li>
                      <Link to="/admin" className="text-brand-orange hover:text-white transition-colors flex items-center">
                        <Shield className="w-3 h-3 mr-2" /> Admin Portal
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={() => auth.signOut()} 
                        className="text-red-400 hover:text-red-300 transition-colors text-sm font-bold"
                      >
                        Logout Admin
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> {siteContent?.contactPhone || '+254 794 415006'}</li>
                <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {siteContent?.contactEmail || 'marketing@eliaxdigitalmarketing.com'}</li>
                <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {siteContent?.contactAddress || 'Nairobi, Kenya'}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>© 2026 Eliax Digital Marketing. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
