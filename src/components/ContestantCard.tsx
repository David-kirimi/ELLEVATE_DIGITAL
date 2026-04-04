import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Heart, Coins, CheckCircle2, AlertCircle, Instagram, Facebook, Twitter, Youtube, ExternalLink, Music2, Music, X, Share2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';

interface Contestant {
  id: string;
  name: string;
  category: string;
  bio: string;
  image: string;
  votes: number;
  socials?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    spotify?: string;
  };
  isVerified?: boolean;
}

interface ContestantCardProps {
  contestant: Contestant;
  key?: string | number;
}

export default function ContestantCard({ contestant }: ContestantCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  const handleVote = async () => {
    if (!auth.currentUser) {
      navigate('/signup');
      return;
    }

    setIsVoting(true);
    setError(null);
    setSuccess(false);

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setError("User profile not found");
        return;
      }

      const points = userDoc.data().points;
      const pointsToSpend = 1; // 1 point per vote

      if (points < pointsToSpend) {
        setError("Not enough points. Buy more to vote!");
        return;
      }

      // 1. Deduct points from user
      await updateDoc(userDocRef, {
        points: increment(-pointsToSpend)
      });

      // 2. Add vote to contestant
      const contestantDocRef = doc(db, 'contestants', contestant.id);
      await updateDoc(contestantDocRef, {
        votes: increment(1)
      });

      // 3. Record the vote
      await addDoc(collection(db, 'votes'), {
        fanUid: auth.currentUser.uid,
        contestantId: contestant.id,
        pointsSpent: pointsToSpend,
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Voting error:", err);
      setError("An error occurred while voting.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
    >
      <div 
        className="relative aspect-[4/5] overflow-hidden cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        <img 
          src={contestant.image} 
          alt={contestant.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contestant.name)}&background=random&size=512`;
          }}
        />
        {contestant.isVerified && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-sm">
          <Heart className="w-4 h-4 text-red-500 mr-1.5 fill-red-500" />
          <span className="text-sm font-bold">{Math.max(0, contestant.votes)}</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">{contestant.category}</p>
          <h3 className="text-xl font-bold">{contestant.name}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
          {contestant.bio}
        </p>

        {contestant.socials && (
          <div className="flex space-x-3 mb-6">
            {contestant.socials.instagram && (
              <a href={contestant.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {contestant.socials.facebook && (
              <a href={contestant.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {contestant.socials.twitter && (
              <a href={contestant.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {contestant.socials.youtube && (
              <a href={contestant.socials.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {contestant.socials.tiktok && (
              <a href={contestant.socials.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                <Music2 className="w-4 h-4" />
              </a>
            )}
            {contestant.socials.spotify && (
              <a href={contestant.socials.spotify} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-brand-orange transition-colors">
                <Music className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
        
        <button
          onClick={handleVote}
          disabled={isVoting}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center transition-all ${
            success 
              ? 'bg-green-500 text-white' 
              : 'bg-brand-black text-white hover:bg-brand-orange'
          } disabled:opacity-50`}
        >
          {isVoting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" /> Voted!
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" /> Vote (1 pt)
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-3 flex items-center text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {error}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDetail(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            <button 
              onClick={() => setShowDetail(false)}
              className="absolute top-6 right-6 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-500 hover:text-brand-black transition-all shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="md:w-1/2 relative bg-gray-100">
              <img 
                src={contestant.image} 
                alt={contestant.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-wider">{contestant.category}</p>
                  {contestant.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <h2 className="text-4xl font-bold">{contestant.name}</h2>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100">
                  <Heart className="w-6 h-6 text-brand-orange fill-brand-orange" />
                  <div>
                    <p className="text-2xl font-bold text-brand-orange leading-none">{Math.max(0, contestant.votes)}</p>
                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Total Votes</p>
                  </div>
                </div>
                <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-brand-orange transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">About the Contestant</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {contestant.bio}
                </p>
              </div>

              {contestant.socials && (
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Connect</h3>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(contestant.socials).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = platform === 'instagram' ? Instagram :
                                   platform === 'facebook' ? Facebook :
                                   platform === 'twitter' ? Twitter :
                                   platform === 'youtube' ? Youtube :
                                   platform === 'tiktok' ? Music2 :
                                   platform === 'spotify' ? Music : ExternalLink;
                      return (
                        <a 
                          key={platform}
                          href={url as string} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center space-x-3 px-5 py-3 bg-gray-50 rounded-2xl text-gray-600 hover:bg-brand-orange hover:text-white transition-all capitalize font-bold"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleVote}
                disabled={isVoting}
                className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center transition-all ${
                  success 
                    ? 'bg-green-500 text-white' 
                    : 'bg-brand-black text-white hover:bg-brand-orange'
                } disabled:opacity-50 shadow-xl shadow-brand-black/10`}
              >
                {isVoting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 mr-2" /> Voted!
                  </>
                ) : (
                  <>
                    <Heart className="w-6 h-6 mr-2" /> Vote (1 Point)
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
