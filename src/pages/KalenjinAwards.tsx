import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Heart, Search, Share2, Crown, Music, Star, ChevronRight } from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  addDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

export default function KalenjinAwards() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'vote' | 'leaderboard'>('vote');
  const [votingId, setVotingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'contestants'), 
      where('competitionId', '==', 'kalenjin-crown-2026'),
      where('isVerified', '==', true),
      orderBy('votes', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContestants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching contestants:", err);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleVote = async (contestant: any) => {
    if (!auth.currentUser) {
      navigate('/signup');
      return;
    }

    setVotingId(contestant.id);
    setError(null);

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setError("User profile not found");
        return;
      }

      const points = userDoc.data().points || 0;
      const pointsToSpend = 1;

      if (points < pointsToSpend) {
        setError("Not enough points. Buy more to vote!");
        return;
      }

      // 1. Deduct points
      await updateDoc(userDocRef, { points: increment(-pointsToSpend) });

      // 2. Add vote to contestant
      await updateDoc(doc(db, 'contestants', contestant.id), { votes: increment(1) });

      // 3. Record vote
      await addDoc(collection(db, 'votes'), {
        fanUid: auth.currentUser.uid,
        contestantId: contestant.id,
        competitionId: 'kalenjin-crown-2026',
        pointsSpent: pointsToSpend,
        timestamp: serverTimestamp()
      });

      // Success feedback (could add a toast)
    } catch (err) {
      console.error("Voting error:", err);
      setError("An error occurred while voting.");
    } finally {
      setVotingId(null);
    }
  };

  const filteredContestants = contestants.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVotes = contestants.reduce((acc, curr) => acc + Math.max(0, curr.votes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a140a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a140a] text-white pt-32 pb-20 selection:bg-brand-orange/30">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full mb-6 border border-brand-orange/20"
        >
          <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">Live Rankings</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-brand-orange">
          Contest Leaderboard
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Kalenjin Best Hit Song - Kalenjin Crown Awards 2026
        </p>

        <div className="inline-flex items-center space-x-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm font-bold">Total Votes: <span className="text-brand-orange">{totalVotes}</span></span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-xl mx-auto px-6 mb-12">
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('vote')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'vote' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-white'}`}
          >
            Vote
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-white'}`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {activeTab === 'vote' ? (
          <>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search nominee or song..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-[30px] bg-white/5 border border-white/10 focus:border-brand-orange/50 focus:ring-0 outline-none text-lg transition-all"
              />
            </div>

            {/* Voting Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContestants.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-[40px] overflow-hidden border border-white/10 group hover:border-brand-orange/30 transition-all"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* Vinyl Record Effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                      <div className="absolute w-[90%] h-[90%] rounded-full border-[20px] border-black/40 shadow-2xl" />
                    </div>
                    
                    <img 
                      src={c.image} 
                      alt={c.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#0a140a] via-[#0a140a]/60 to-transparent">
                      <h3 className="text-3xl font-display font-bold uppercase tracking-tighter mb-1 outline-text">{c.name}</h3>
                      <p className="text-brand-orange text-xs font-bold uppercase tracking-widest">{c.category}</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1">Current Votes</p>
                        <p className="text-3xl font-bold text-brand-orange">{Math.max(0, c.votes || 0)}</p>
                      </div>
                      <button className="p-3 bg-white/5 rounded-2xl hover:bg-brand-orange/20 transition-colors">
                        <Share2 className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleVote(c)}
                      disabled={votingId === c.id}
                      className="w-full py-5 bg-brand-orange text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-brand-orange/30 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {votingId === c.id ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "VOTE NOW"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* Leaderboard View - Enhanced to feel like a page */
          <div className="space-y-16">
            {/* Podium Section */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 mb-20">
              {/* 2nd Place */}
              {contestants[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full md:w-64 order-2 md:order-1"
                >
                  <div className="bg-white/5 rounded-t-[40px] p-8 border-x border-t border-white/10 text-center relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center font-bold shadow-lg">2</div>
                    <img src={contestants[1].image} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-400/20 object-cover" />
                    <h3 className="font-bold truncate">{contestants[1].name}</h3>
                    <p className="text-gray-500 text-xs uppercase font-bold">{contestants[1].votes} Votes</p>
                  </div>
                  <div className="h-32 bg-gradient-to-b from-white/10 to-transparent rounded-b-2xl" />
                </motion.div>
              )}

              {/* 1st Place */}
              {contestants[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full md:w-80 z-10 order-1 md:order-2"
                >
                  <div className="bg-brand-orange/10 rounded-t-[50px] p-10 border-x border-t border-brand-orange/30 text-center relative shadow-2xl shadow-brand-orange/10">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand-orange rounded-full flex items-center justify-center shadow-xl shadow-brand-orange/30">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <img src={contestants[0].image} alt="" className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-brand-orange object-cover" />
                    <h3 className="text-2xl font-bold truncate text-brand-orange">{contestants[0].name}</h3>
                    <p className="text-brand-orange/60 text-sm uppercase font-bold tracking-widest">{contestants[0].votes} Votes</p>
                  </div>
                  <div className="h-48 bg-gradient-to-b from-brand-orange/20 to-transparent rounded-b-3xl" />
                </motion.div>
              )}

              {/* 3rd Place */}
              {contestants[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full md:w-64 order-3"
                >
                  <div className="bg-white/5 rounded-t-[40px] p-8 border-x border-t border-white/10 text-center relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center font-bold shadow-lg">3</div>
                    <img src={contestants[2].image} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-amber-700/20 object-cover" />
                    <h3 className="font-bold truncate">{contestants[2].name}</h3>
                    <p className="text-gray-500 text-xs uppercase font-bold">{contestants[2].votes} Votes</p>
                  </div>
                  <div className="h-24 bg-gradient-to-b from-white/10 to-transparent rounded-b-2xl" />
                </motion.div>
              )}
            </div>

            {/* List Section */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center px-8 py-4 text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                <span className="w-12">Rank</span>
                <span className="flex-1">Contestant</span>
                <span className="w-32 text-right">Votes</span>
                <span className="w-24 text-right">Share</span>
              </div>
              
              {contestants.map((c, index) => {
                const percentage = totalVotes > 0 ? Math.max(0, (c.votes || 0) / totalVotes) * 100 : 0;
                
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-3xl p-6 flex items-center gap-6 border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-brand-orange text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' : 
                      index === 2 ? 'bg-amber-700 text-white' : 
                      'bg-white/5 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <img 
                        src={c.image} 
                        alt={c.name} 
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate group-hover:text-brand-orange transition-colors">{c.name}</h3>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{c.category}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="w-32 text-right">
                      <p className="text-xl font-bold text-brand-orange">{Math.max(0, c.votes || 0)}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Votes</p>
                    </div>

                    {/* Share */}
                    <div className="w-24 text-right">
                      <div className="text-lg font-bold text-white">{percentage.toFixed(1)}%</div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-brand-orange rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center">
          <Star className="w-5 h-5 mr-3" />
          {error}
          <button onClick={() => setError(null)} className="ml-4 font-bold underline">Dismiss</button>
        </div>
      )}

      <style>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: white;
        }
        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>
    </div>
  );
}
