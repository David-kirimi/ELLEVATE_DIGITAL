import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Video, Trash2, Edit2, Coins, TrendingUp, Users, ShieldCheck, X, Upload } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';

export default function CreatorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 100,
    thumbnail: '',
    videoUrl: '',
    isSubscriptionOnly: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, 
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to user data:", error);
        setLoading(false);
      }
    );
    return () => unsubUser();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'courses'), where('creatorUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("Error fetching creator courses:", error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData?.isVerifiedCreator) return;

    setSubmitting(true);
    try {
      // Create course metadata
      const courseRef = await addDoc(collection(db, 'courses'), {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        thumbnail: formData.thumbnail || `https://picsum.photos/seed/${Date.now()}/800/450`,
        isSubscriptionOnly: formData.isSubscriptionOnly,
        creatorUid: user.uid,
        creatorName: user.displayName,
        createdAt: serverTimestamp()
      });

      // Create course content (video link)
      await setDoc(doc(db, 'courseContents', courseRef.id), {
        courseId: courseRef.id,
        videoUrl: formData.videoUrl
      });

      setIsModalOpen(false);
      setFormData({ title: '', description: '', price: 100, thumbnail: '', videoUrl: '', isSubscriptionOnly: false });
    } catch (err) {
      console.error('Error adding course:', err);
      alert('Failed to add course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      await deleteDoc(doc(db, 'courseContents', id));
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isVerifiedCreator: true,
        role: 'creator'
      });
      // State will update via onSnapshot
    } catch (err) {
      console.error('Error applying:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user || !userData?.isVerifiedCreator) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-10 h-10 text-brand-orange" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Become a Creator</h1>
          <p className="text-gray-600 mb-10">
            Only verified digital marketing experts can upload courses to Eliax Digital. Apply now to start earning from your expertise.
          </p>
          <button 
            onClick={handleApply}
            disabled={submitting}
            className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            {submitting ? 'Processing...' : 'Apply for Verification (Demo)'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Creator Dashboard</h1>
            <p className="text-gray-600">Manage your courses and track your earnings.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-8 md:mt-0 bg-brand-orange text-white px-8 py-4 rounded-full font-bold flex items-center hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Upload New Course
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Total Earnings', value: '45,200 pts', icon: Coins, color: 'text-green-600' },
            { label: 'Total Students', value: '1,240', icon: Users, color: 'text-blue-600' },
            { label: 'Avg Rating', value: '4.9/5', icon: TrendingUp, color: 'text-brand-orange' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-6">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-bold">Your Courses</h3>
            <span className="text-sm text-gray-500">{courses.length} Courses Published</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-8 py-4">Course</th>
                  <th className="px-8 py-4">Price</th>
                  <th className="px-8 py-4">Sales</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img src={course.thumbnail} className="w-16 h-10 rounded-lg object-cover" alt="" />
                        <div>
                          <p className="font-bold text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">Added on {new Date(course.createdAt?.toDate()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-brand-orange">{course.price} pts</td>
                    <td className="px-8 py-6">124</td>
                    <td className="px-8 py-6">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-1 rounded-full">Active</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-black transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Upload New Course</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Course Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Advanced SEO Mastery"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Price (Points)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="What will students learn in this course?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">YouTube Embed URL</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-orange/20 outline-none"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 italic">Make sure to use the 'embed' link from YouTube.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="subOnly"
                    className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                    checked={formData.isSubscriptionOnly}
                    onChange={(e) => setFormData({...formData, isSubscriptionOnly: e.target.checked})}
                  />
                  <label htmlFor="subOnly" className="text-sm font-medium text-gray-700">Available to subscribers only</label>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center"
                >
                  {submitting ? 'Uploading...' : (
                    <>
                      <Upload className="w-5 h-5 mr-2" /> Publish Course
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
