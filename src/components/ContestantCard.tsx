import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';

interface Contestant {
  id: string;
  name: string;
  category: string;
  bio: string;
  image: string;
  votes: number;
}

interface ContestantCardProps {
  contestant: Contestant;
  key?: string | number;
}

export default function ContestantCard({ contestant }: ContestantCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVote = async () => {
    if (!auth.currentUser) {
      setError("Please sign in to vote");
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
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={contestant.image} 
          alt={contestant.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-sm">
          <Heart className="w-4 h-4 text-red-500 mr-1.5 fill-red-500" />
          <span className="text-sm font-bold">{contestant.votes}</span>
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
    </motion.div>
  );
}
