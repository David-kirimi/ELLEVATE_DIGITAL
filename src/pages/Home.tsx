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
    <div className="min-h-screen bg-brand-green text-white">
      {/* Hero Section with Stage Lights */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Stage Lights Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-brand-gold/10 to-transparent transform -skew-x-12 blur-3xl opacity-30" />
          <div className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-b from-brand-gold/10 to-transparent transform skew-x-12 blur-3xl opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,204,0,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Circular Logo */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,204,0,0.3)] border-4 border-brand-gold/20">
              <div className="text-brand-green flex flex-col items-center">
                <Music className="w-12 h-12 md:w-20 md:h-20 mb-1" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">Kalenjin Crown</span>
                <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Awards</span>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 bg-brand-gold/10 text-brand-gold px-4 py-1.5 rounded-full mb-6 border border-brand-gold/20">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kalenjin Crown Awards 2026</span>
            </div>

            <h1 className="text-5xl md:text-8xl mb-6 leading-tight font-serif uppercase tracking-tight text-brand-gold drop-shadow-2xl">
              {siteContent?.heroTitle || 'KALENJIN BEST HIT SONG'}
            </h1>

            <div className="flex items-center justify-center space-x-4 mb-8 text-brand-gold/60">
              <Music className="w-5 h-5" />
              <div className="h-px w-12 bg-brand-gold/30" />
              <Star className="w-5 h-5" />
              <div className="h-px w-12 bg-brand-gold/30" />
              <Mic2 className="w-5 h-5" />
            </div>

            <p className="text-sm md:text-base text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-medium">
              {siteContent?.heroSubtitle || 'Cast your vote for the best Kalenjin song of 2026. One vote per number. Results announced live.'}
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/kalenjin-awards" 
                className="bg-brand-gold text-brand-green px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center hover:bg-white transition-all shadow-xl shadow-brand-gold/20"
              >
                <Trophy className="mr-3 w-4 h-4" /> Vote Now
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Musical Notes Decoration */}
        <div className="absolute bottom-20 left-0 w-full overflow-hidden opacity-10 pointer-events-none">
           <div className="flex space-x-20 animate-pulse">
              {[1,2,3,4,5,6,7,8].map(i => (
                <Music key={i} className="w-12 h-12 text-brand-gold" />
              ))}
           </div>
        </div>
      </section>

      {/* Featured Contestants */}
      <section className="py-32 bg-brand-black/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-brand-gold/10 pb-10">
            <div>
              <h2 className="text-4xl md:text-6xl mb-4 font-serif">Top Nominees</h2>
              <p className="text-gray-400 max-w-xl uppercase tracking-widest text-xs font-bold">
                The most voted musicians, artists, and models this week. Support your favorite star today!
              </p>
            </div>
            <Link to="/kalenjin-awards" className="mt-8 md:mt-0 text-brand-gold font-black uppercase tracking-widest text-xs flex items-center hover:underline group">
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
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-block bg-brand-gold/10 text-brand-gold px-4 py-1 rounded-full mb-6 border border-brand-gold/20 text-[10px] font-black uppercase tracking-widest">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-6xl mb-8 font-serif leading-tight">
                {siteContent?.aboutTitle || 'CELEBRATING KALENJIN EXCELLENCE'}
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-10 font-medium">
                {siteContent?.aboutText || 'The Kalenjin Crown Awards is a premier platform dedicated to discovering, nurturing, and celebrating the diverse talents within the Kalenjin community. From music and arts to modeling and innovation, we provide a stage for excellence to shine.'}
              </p>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-4xl font-serif text-brand-gold mb-2">2026</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Next Big Event</p>
                </div>
                <div>
                  <p className="text-4xl font-serif text-brand-gold mb-2">12+</p>
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
                <div className="absolute inset-0 bg-brand-green/20 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-gold/10 rounded-full -z-10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4">
        <motion.a 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          href="https://wa.me/254700000000" 
          target="_blank"
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl text-white"
        >
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </motion.a>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-brand-gold rounded-full flex items-center justify-center shadow-2xl text-brand-green"
        >
          <MessageSquare className="w-7 h-7" />
        </motion.button>
      </div>
    </div>
  );
}
