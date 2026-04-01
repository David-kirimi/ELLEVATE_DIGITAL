import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogIn, LogOut, Coins } from 'lucide-react';
import { auth, signInWithGoogle, logout, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubPoints = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserPoints(doc.data().points);
          }
        });
        return () => unsubPoints();
      } else {
        setUserPoints(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Contestants', href: '/contestants' },
    { name: 'Buy Points', href: '/points' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || location.pathname !== '/' ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <span className="text-brand-black">ELIAX</span>
          <span className="text-orange-600 ml-1">DIGITAL</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className={`text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'}`}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-bold">
                <Coins className="w-4 h-4 mr-1.5" />
                {userPoints} pts
              </div>
              <div className="flex items-center space-x-2">
                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-gray-200" />
                <button onClick={logout} className="text-gray-600 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="bg-brand-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-all duration-300 flex items-center"
            >
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-brand-black"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-t border-gray-100 p-6 md:hidden shadow-xl"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold">{user.displayName}</p>
                      <p className="text-xs text-orange-600 font-bold">{userPoints} points</p>
                    </div>
                  </div>
                  <button onClick={logout} className="text-red-600 font-bold">Logout</button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl text-center font-bold flex items-center justify-center"
                >
                  <LogIn className="w-5 h-5 mr-2" /> Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
