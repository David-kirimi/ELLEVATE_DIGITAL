import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, Video, Layout, DollarSign, Users, Clock, CheckCircle, AlertCircle, Image as ImageIcon, Link as LinkIcon, BookOpen, Microscope, Cpu, Stethoscope, Utensils, Dumbbell, Play } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';
import { getYouTubeEmbedUrl } from '../utils/youtube';

const categories = [
  { id: 'science', name: 'Science', icon: Microscope },
  { id: 'tech', name: 'Tech', icon: Cpu },
  { id: 'medicine', name: 'Medicine', icon: Stethoscope },
  { id: 'food', name: 'Food', icon: Utensils },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell },
  { id: 'other', name: 'Other', icon: BookOpen },
];

export default function CreatorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleFirestoreError = (error: any, operation: string, path: string) => {
    const errInfo = {
      error: error.message || String(error),
      operation,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      }
    };
    console.error(`Firestore Error [${operation}] on [${path}]:`, JSON.stringify(errInfo));
  };

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tech',
    thumbnail: '',
    videoUrl: '',
    price: 0,
    isSubscriptionOnly: false
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qCourses = query(
      collection(db, 'courses'),
      where('creatorUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, 'LIST', 'courses');
      setLoading(false);
    });

    const qPurchases = query(
      collection(db, 'purchases'),
      where('creatorUid', '==', user.uid),
      where('status', '==', 'completed')
    );

    const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
      setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'purchases'));

    return () => {
      unsubCourses();
      unsubPurchases();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const loadingToast = toast.loading(editingId ? "Updating course..." : "Uploading course...");
    try {
      const data = {
        ...formData,
        videoUrl: getYouTubeEmbedUrl(formData.videoUrl),
        creatorUid: auth.currentUser.uid,
        creatorName: auth.currentUser.displayName || 'Anonymous Creator',
        status: 'pending', // Requires admin moderation
        createdAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'courses', editingId), data);
        toast.success("Course updated! Pending review.", { id: loadingToast });
      } else {
        await addDoc(collection(db, 'courses'), data);
        toast.success("Course uploaded! Pending review.", { id: loadingToast });
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        category: 'tech',
        thumbnail: '',
        videoUrl: '',
        price: 0,
        isSubscriptionOnly: false
      });
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error("Failed to save course.", { id: loadingToast });
    }
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: course.thumbnail,
      videoUrl: course.videoUrl,
      price: course.price,
      isSubscriptionOnly: course.isSubscriptionOnly || false
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      toast.success("Course deleted");
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const totalRevenue = purchases.reduce((acc, curr) => acc + (curr.creatorShare || curr.amount * 0.7), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-brand-orange mb-4">
              <Layout className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-widest">Creator Dashboard</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-brand-black leading-none tracking-tighter uppercase">
              Manage Your<br />Courses
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">KSh {totalRevenue.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all shadow-lg shadow-brand-black/10"
            >
              <Plus className="w-5 h-5 mr-2" /> New Course
            </button>
          </div>
        </div>

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 mb-12"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Course' : 'Upload New Course'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-400 hover:text-brand-black">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Course Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                    placeholder="e.g. Advanced Web Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat.id})}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          formData.category === cat.id 
                            ? 'bg-brand-orange text-white' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <cat.icon className="w-4 h-4" />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">YouTube Embed URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="url" 
                      required
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400">Use the embed format for the video to play correctly.</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Price (KSh)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="number" 
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center h-full pt-8">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isSubscriptionOnly}
                        onChange={(e) => setFormData({...formData, isSubscriptionOnly: e.target.checked})}
                        className="w-6 h-6 rounded-lg border-gray-300 text-brand-orange focus:ring-brand-orange"
                      />
                      <span className="text-sm font-bold text-gray-700">Subscription Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Thumbnail Image</label>
                  <ImageUpload 
                    folder="courses"
                    initialImage={formData.thumbnail}
                    onUploadComplete={(url) => setFormData({...formData, thumbnail: url})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Course Description</label>
                  <textarea 
                    rows={6}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                    placeholder="Describe what students will learn..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-orange text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" /> {editingId ? 'Update Course' : 'Publish Course'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100 group"
              >
                <div className="relative aspect-video bg-gray-100">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      course.status === 'approved' ? 'bg-green-500 text-white' :
                      course.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">{course.category}</span>
                    <div className="flex items-center text-gray-400 text-xs font-bold">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(course.createdAt?.toDate?.() || course.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-brand-black mb-4 line-clamp-1">{course.title}</h3>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="text-brand-orange font-bold">
                      KSh {course.price}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(course)}
                        className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {courses.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400">No courses yet</h3>
            <p className="text-gray-500 mb-8">Start sharing your expertise with the community.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all"
            >
              Upload Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
