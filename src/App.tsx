import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contestants from './pages/Contestants';
import Points from './pages/Points';

export default function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contestants" element={<Contestants />} />
          <Route path="/points" element={<Points />} />
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
                Kenya's leading digital marketing agency and competition platform. We bring customers to your brand and stars to the spotlight.
              </p>
              <div className="flex items-center text-gray-400 mb-8">
                <Phone className="w-4 h-4 mr-2" /> +254 794 415006
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
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/contestants" className="hover:text-white transition-colors">Contestants</a></li>
                <li><a href="/points" className="hover:text-white transition-colors">Buy Points</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +254 794 415006</li>
                <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> marketing@eliaxdigitalmarketing.com</li>
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
