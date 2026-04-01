import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Filter, Search, Plus } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import ContestantCard from '../components/ContestantCard';

export default function Contestants() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'contestants');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContestants(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredContestants = contestants.filter(c => {
    const matchesFilter = filter === 'all' || c.category === filter;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const seedData = async () => {
    const initialData = [
      { name: "John Musician", category: "musician", bio: "Rising star from Nairobi with a soul-stirring voice.", image: "https://picsum.photos/seed/musician1/800/1000", votes: 120 },
      { name: "Sarah Artist", category: "artist", bio: "Visual artist specializing in contemporary African art.", image: "https://picsum.photos/seed/artist1/800/1000", votes: 85 },
      { name: "Linda Model", category: "model", bio: "International fashion model with a passion for sustainability.", image: "https://picsum.photos/seed/model1/800/1000", votes: 210 },
      { name: "David Rapper", category: "musician", bio: "Lyrical genius bringing fresh vibes to the hip-hop scene.", image: "https://picsum.photos/seed/musician2/800/1000", votes: 150 },
      { name: "Grace Painter", category: "artist", bio: "Abstract painter exploring the depths of human emotion.", image: "https://picsum.photos/seed/artist2/800/1000", votes: 95 },
      { name: "Alex Model", category: "model", bio: "Commercial model known for high-energy campaigns.", image: "https://picsum.photos/seed/model2/800/1000", votes: 180 },
    ];

    for (const data of initialData) {
      await addDoc(collection(db, 'contestants'), data);
    }
    alert("Seed data added!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl mb-2">Contestants</h1>
            <p className="text-gray-600">Discover and support your favorite stars.</p>
          </div>
          
          {/* Admin Seed Button (Development only) */}
          {auth.currentUser?.email === 'muriiradavie@gmail.com' && contestants.length === 0 && (
            <button 
              onClick={seedData}
              className="bg-brand-black text-white px-6 py-2 rounded-full text-sm font-bold flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Seed Initial Data
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search contestants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'musician', 'artist', 'model'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  filter === cat 
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-8 h-96 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredContestants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredContestants.map((contestant) => (
              <ContestantCard key={contestant.id} contestant={contestant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">No contestants found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
