import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Target, Users, Heart, Coins, MessageSquare, ChevronRight, Trophy, Music, Star, Mic2, Play } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import ContestantCard from '../components/ContestantCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [topContestants, setTopContestants] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'contestants'), orderBy('votes', 'desc'), limit(4));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const contestants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTopContestants(contestants);
      },
      (error) => {
        console.error("Error fetching top contestants:", error);
      }
    );

    const unsubContent = onSnapshot(doc(db, 'siteSettings', 'content'), (doc) => {
      if (doc.exists()) {
        setSiteContent(doc.data());
      }
    }, (error) => {
      console.error("Home.tsx siteSettings error:", error);
    });

    return () => {
      unsubscribe();
      unsubContent();
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-black text-white">
      {/* Hero Section with Stage Lights */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Stage Lights Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-brand-orange/10 to-transparent transform -skew-x-12 blur-3xl opacity-30" />
          <div className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-b from-brand-orange/10 to-transparent transform skew-x-12 blur-3xl opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,102,0,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Circular Logo */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,102,0,0.3)] border-4 border-brand-orange/20">
              <div className="text-brand-black flex flex-col items-center">
                <Music className="w-12 h-12 md:w-20 md:h-20 mb-1" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">{siteContent?.logoText || 'ELIAX'}</span>
                <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">{siteContent?.logoSubtext || 'DIGITAL'}</span>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 bg-brand-orange/10 text-brand-orange px-4 py-1.5 rounded-full mb-6 border border-brand-orange/20">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{siteContent?.eventName || 'Excellence Awards 2026'}</span>
            </div>

            <h1 className="text-5xl md:text-8xl mb-6 leading-tight font-serif uppercase tracking-tight text-brand-orange drop-shadow-2xl">
              {siteContent?.heroTitle || 'VOTE FOR YOUR FAVORITE TALENT'}
            </h1>

            <div className="flex items-center justify-center space-x-4 mb-8 text-brand-orange/60">
              <Music className="w-5 h-5" />
              <div className="h-px w-12 bg-brand-orange/30" />
              <Star className="w-5 h-5" />
              <div className="h-px w-12 bg-brand-orange/30" />
              <Mic2 className="w-5 h-5" />
            </div>

            <p className="text-sm md:text-base text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-medium">
              {siteContent?.heroSubtitle || 'Cast your vote for the best talent of 2026. One vote per number. Results announced live.'}
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/contestants" 
                className="bg-brand-orange text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center hover:bg-white hover:text-brand-black transition-all shadow-xl shadow-brand-orange/20"
              >
                <Trophy className="mr-3 w-4 h-4" /> {siteContent?.heroButtonText || 'Vote Now'}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Musical Notes Decoration */}
        <div className="absolute bottom-20 left-0 w-full overflow-hidden opacity-10 pointer-events-none">
           <div className="flex space-x-20 animate-pulse">
              {[1,2,3,4,5,6,7,8].map(i => (
                <Music key={i} className="w-12 h-12 text-brand-orange" />
              ))}
           </div>
        </div>
      </section>

      {/* Featured Contestants */}
      <section className="py-32 bg-brand-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-brand-orange/10 pb-10">
            <div>
              <h2 className="text-4xl md:text-6xl mb-4 font-serif">Top Nominees</h2>
              <p className="text-gray-400 max-w-xl uppercase tracking-widest text-xs font-bold">
                The most voted musicians, artists, and models this week. Support your favorite star today!
              </p>
            </div>
            <Link to="/contestants" className="mt-8 md:mt-0 text-brand-orange font-black uppercase tracking-widest text-xs flex items-center hover:underline group">
              View Leaderboard <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {topContestants.length > 0 ? (
              topContestants.map((contestant) => (
                <ContestantCard key={contestant.id} contestant={contestant} />
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-8 h-96 animate-pulse border border-white/5" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-block bg-brand-orange/10 text-brand-orange px-4 py-1 rounded-full mb-6 border border-brand-orange/20 text-[10px] font-black uppercase tracking-widest">
                {siteContent?.missionLabel || 'Our Mission'}
              </div>
              <h2 className="text-4xl md:text-6xl mb-8 font-serif leading-tight">
                {siteContent?.aboutTitle || 'CELEBRATING EXCELLENCE'}
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-10 font-medium">
                {siteContent?.aboutText || 'Our platform is dedicated to discovering, nurturing, and celebrating the diverse talents within the community. From music and arts to modeling and innovation, we provide a stage for excellence to shine.'}
              </p>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-4xl font-serif text-brand-orange mb-2">{siteContent?.statsYear || '2026'}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Next Big Event</p>
                </div>
                <div>
                  <p className="text-4xl font-serif text-brand-orange mb-2">{siteContent?.statsCategories || '12+'}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Categories</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="aspect-square rounded-[40px] overflow-hidden border-8 border-white/5 shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80" 
                  alt="Awards Ceremony" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-orange/10 rounded-full -z-10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
