import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Play, Clock, User, CheckCircle, Lock, Video, Microscope, Cpu, Stethoscope, Utensils, Dumbbell, BookOpen, ChevronRight } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'all', name: 'All Courses', icon: Video },
  { id: 'science', name: 'Science', icon: Microscope },
  { id: 'tech', name: 'Tech', icon: Cpu },
  { id: 'medicine', name: 'Medicine', icon: Stethoscope },
  { id: 'food', name: 'Food', icon: Utensils },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell },
  { id: 'other', name: 'Other', icon: BookOpen },
];

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'courses'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-brand-orange mb-4">
              <Video className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-widest">Video Library</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-brand-black leading-none tracking-tighter uppercase">
              Learn from<br />the Experts
            </h1>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-brand-orange outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar space-x-3 mb-12 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id 
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-[32px] mb-4" />
                <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-[32px] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    {course.isSubscriptionOnly && (
                      <div className="absolute top-4 right-4 bg-brand-orange text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> Sub Only
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold">
                      {course.duration || '15:00'}
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <div className="flex items-center space-x-2 text-brand-orange text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span>{course.category}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {course.creatorName}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-brand-black mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-400 font-bold">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-brand-orange font-bold">
                        {course.price > 0 ? `KSh ${course.price}` : 'FREE'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
