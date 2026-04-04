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
  Shield
} from 'lucide-react';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contestants from './pages/Contestants';
import Points from './pages/Points';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KalenjinAwards from './pages/KalenjinAwards';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ContestantApplication from './pages/ContestantApplication';
import ContestantDashboard from './pages/ContestantDashboard';

export default function App() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState<any>(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // Clean up previous user listener if it exists
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      console.log("Auth state changed. User:", user?.email);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const adminStatus = data.role === 'admin' || user.email === 'muriiradavie@gmail.com' || user.email === 'superadmin@eliax.com';
            console.log("User data loaded. Admin status:", adminStatus, "Role:", data.role);
            setIsAdmin(adminStatus);
          } else {
            // Fallback for admin emails if doc doesn't exist yet
            const adminStatus = user.email === 'muriiradavie@gmail.com' || user.email === 'superadmin@eliax.com';
            console.log("User doc does not exist. Admin status (fallback):", adminStatus);
            setIsAdmin(adminStatus);
          }
          setLoading(false);
        }, (error) => {
          console.error("App.tsx onSnapshot error:", error);
          if (error.message.includes('insufficient permissions')) {
            const adminStatus = user.email === 'muriiradavie@gmail.com' || user.email === 'superadmin@eliax.com';
            setIsAdmin(adminStatus);
          }
          setLoading(false);
        });
      } else {
        console.log("No user logged in.");
        setIsAdmin(false);
        setLoading(false);
      }
    });

    const unsubContent = onSnapshot(doc(db, 'siteSettings', 'content'), (doc) => {
      if (doc.exists()) {
        setSiteContent(doc.data());
      }
    }, (error) => {
      console.error("App.tsx siteSettings error:", error);
    });

    return () => {
      unsubscribe();
      if (unsubUser) unsubUser();
      unsubContent();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Initializing Eliax...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      
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
          <Route path="/kalenjin-awards" element={<KalenjinAwards />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/apply" element={<ContestantApplication />} />
          <Route path="/contestant-dashboard" element={<ContestantDashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-brand-black text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <a href="/" className="text-3xl font-display font-bold mb-6 block">
                ELIAX<span className="text-brand-orange">DIGITAL</span>
              </a>
              <p className="text-gray-400 max-w-sm mb-4">
                {siteContent?.footerText || "Kenya's leading digital marketing agency and competition platform. We bring customers to your brand and stars to the spotlight."}
              </p>
              <div className="flex items-center text-gray-400 mb-8">
                <Phone className="w-4 h-4 mr-2" /> {siteContent?.contactPhone || '+254 794 415006'}
              </div>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Twitter size={20} /></a>
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
                <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Nairobi, Kenya</li>
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
