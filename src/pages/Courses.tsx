import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Play, Clock, User, Coins } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(courseData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Video Library</h1>
            <p className="text-gray-600">Learn from the best digital marketers and creators in Kenya.</p>
          </div>
          
          <div className="mt-8 md:mt-0 relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search courses or creators..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
              >
                <Link to={`/courses/${course.id}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={course.thumbnail || `https://picsum.photos/seed/${course.id}/800/450`} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="text-brand-orange fill-brand-orange w-6 h-6 ml-1" />
                      </div>
                    </div>
                    {course.isSubscriptionOnly && (
                      <div className="absolute top-4 right-4 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                        Subscription
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                        <User className="w-3 h-3 mr-1" /> {course.creatorName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> 12 Lessons
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-brand-orange transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center text-brand-orange font-bold">
                        <Coins className="w-4 h-4 mr-1.5" />
                        {course.price > 0 ? `${course.price} pts` : 'Free'}
                      </div>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-brand-black transition-colors">
                        Enroll Now
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">No courses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
