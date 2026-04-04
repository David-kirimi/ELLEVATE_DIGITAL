import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Target, Users, Heart, Coins, MessageSquare, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-brand-orange/5 rounded-bl-[100px]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full mb-6">
                <span className="text-xs font-bold uppercase tracking-wider">Top Agency in Kenya</span>
              </div>
              <h1 className="text-5xl md:text-7xl mb-6 leading-[1.1] uppercase">
                {siteContent?.heroTitle || 'VOTE FOR YOUR FAVORITE TALENT'}
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-lg">
                {siteContent?.heroSubtitle || 'Empowering the next generation of Kalenjin stars through community-driven recognition and support.'}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to={auth.currentUser ? "/contestants" : "/signup"} 
                  className="bg-brand-orange text-white px-8 py-4 rounded-full font-bold flex items-center justify-center hover:shadow-lg hover:shadow-brand-orange/30 transition-all"
                >
                  Vote Now <Heart className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/points" 
                  className="border-2 border-brand-black text-brand-black px-8 py-4 rounded-full font-bold flex items-center justify-center hover:bg-brand-black hover:text-white transition-all"
                >
                  Buy Points <Coins className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                <img 
                  src={siteContent?.heroImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
                  alt="Marketing & Competition" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80";
                  }}
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden sm:block">
                <p className="text-3xl font-bold text-brand-orange">1M+</p>
                <p className="text-xs text-gray-500 font-bold uppercase">Votes Cast</p>
              </div>
              <div className="absolute -top-6 -right-6 bg-brand-black text-white p-6 rounded-2xl shadow-xl z-20 hidden sm:block">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-xs text-gray-400 font-bold uppercase">Contestants</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Contestants */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4">Top Contestants</h2>
              <p className="text-gray-600 max-w-xl">
                The most voted musicians, artists, and models this week. Support your favorite star today!
              </p>
            </div>
            <Link to="/contestants" className="mt-6 md:mt-0 text-brand-orange font-bold flex items-center hover:underline">
              View all contestants <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topContestants.length > 0 ? (
              topContestants.map((contestant) => (
                <ContestantCard key={contestant.id} contestant={contestant} />
              ))
            ) : (
              // Placeholder cards if no data yet
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-8 h-96 animate-pulse border border-gray-100" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl mb-8 uppercase leading-tight">
                {siteContent?.aboutTitle || 'CELEBRATING EXCELLENCE'}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {siteContent?.aboutText || 'The Kalenjin Crown Awards is a premier platform dedicated to discovering, nurturing, and celebrating the diverse talents within the Kalenjin community. From music and arts to modeling and innovation, we provide a stage for excellence to shine.'}
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-3xl font-bold text-brand-orange mb-1">2026</p>
                  <p className="text-sm text-gray-500 font-bold uppercase">Next Big Event</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-brand-orange mb-1">10+</p>
                  <p className="text-sm text-gray-500 font-bold uppercase">Categories</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="aspect-square rounded-[40px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80" 
                  alt="Awards Ceremony" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-brand-orange rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Digital Marketing Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Beyond the competition, we offer a comprehensive suite of digital marketing services tailored to help your business thrive.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Social Media Management', icon: Target, desc: 'Strategic growth and engagement across all platforms.' },
              { title: 'Influencer Marketing', icon: Users, desc: 'Connecting brands with the right voices to reach real customers.' },
              { title: 'Brand Strategy', icon: CheckCircle2, desc: 'Building identity and presence that stands out in the market.' }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-orange rounded-[40px] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl mb-8">Why Eliax Digital?</h2>
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Results-Focused</h4>
                      <p className="text-white/80">We don't care about vanity metrics. We care about your bottom line and real customer growth.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Influencer Power</h4>
                      <p className="text-white/80">Unique access to massive audiences that other agencies simply can't provide.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <blockquote className="text-2xl font-display italic mb-6">
                  "We don't just market — we bring customers. That's the Eliax promise."
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                  <div>
                    <p className="font-bold">MC JJ</p>
                    <p className="text-sm text-white/60">Founder & CEO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
