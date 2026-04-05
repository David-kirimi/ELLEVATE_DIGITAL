import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Lock, CheckCircle, Video, User, Clock, ShoppingCart, MessageCircle, Mail, Smartphone, AlertCircle, ChevronLeft, ShieldCheck, Star } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [siteContent, setSiteContent] = useState<any>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch course
        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (!courseDoc.exists()) {
          toast.error("Course not found");
          navigate('/courses');
          return;
        }
        setCourse({ id: courseDoc.id, ...courseDoc.data() });

        // Fetch site settings for subscription fee
        const contentDoc = await getDoc(doc(db, 'siteSettings', 'content'));
        if (contentDoc.exists()) {
          setSiteContent(contentDoc.data());
        }

        // Check access if logged in
        const user = auth.currentUser;
        if (user) {
          // Check subscription
          const subQuery = query(
            collection(db, 'subscriptions'),
            where('userId', '==', user.uid),
            where('expiresAt', '>', new Date().toISOString())
          );
          const subSnapshot = await getDocs(subQuery);
          setIsSubscribed(!subSnapshot.empty);

          // Check direct purchase
          const purchaseQuery = query(
            collection(db, 'purchases'),
            where('userId', '==', user.uid),
            where('courseId', '==', id),
            where('status', '==', 'completed')
          );
          const purchaseSnapshot = await getDocs(purchaseQuery);
          setHasPurchased(!purchaseSnapshot.empty);
        }
      } catch (err) {
        console.error("Error fetching course detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleStkPush = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to use M-Pesa STK Push");
      navigate('/login');
      return;
    }
    
    setPurchaseLoading(true);
    try {
      // Logic for STK push would go here
      // For now, we'll simulate a successful purchase
      await addDoc(collection(db, 'purchases'), {
        userId: auth.currentUser.uid,
        courseId: id,
        amount: course.price,
        status: 'completed',
        timestamp: serverTimestamp(),
        method: 'mpesa_stk'
      });
      setHasPurchased(true);
      toast.success("Purchase successful! You now have access.");
    } catch (err) {
      toast.error("Purchase failed. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleWhatsAppPurchase = () => {
    const message = `Hi, I want to purchase the course: ${course.title} (ID: ${course.id}). My email is ${auth.currentUser?.email || 'Guest'}.`;
    const whatsappUrl = `https://wa.me/${siteContent?.whatsappNumber || '254794415006'}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailPurchase = () => {
    const subject = `Course Purchase Request: ${course.title}`;
    const body = `Hi,\n\nI would like to purchase the course "${course.title}".\nCourse ID: ${course.id}\nUser Email: ${auth.currentUser?.email || 'Guest'}\n\nPlease provide payment instructions.`;
    window.location.href = `mailto:${siteContent?.contactEmail || 'support@eliax.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const isAuthorized = isSubscribed || hasPurchased || course?.price === 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/courses')}
          className="flex items-center text-gray-500 hover:text-brand-orange font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Library
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
              {isAuthorized ? (
                <iframe 
                  src={course.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-brand-black/90 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-brand-orange/20 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-brand-orange" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Content Locked</h2>
                  <p className="text-gray-400 max-w-md mb-8">
                    This course is exclusive to subscribers or requires a one-time purchase.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => navigate('/account')}
                      className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-orange/80 transition-all"
                    >
                      Get Subscription
                    </button>
                    <button 
                      onClick={handleStkPush}
                      className="bg-white text-brand-black px-8 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center"
                    >
                      <Smartphone className="w-5 h-5 mr-2" /> Buy for KSh {course.price}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-bold uppercase tracking-widest">
                  {course.category}
                </span>
                <div className="flex items-center text-gray-400 text-sm font-bold">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration || '15:00'}
                </div>
                <div className="flex items-center text-gray-400 text-sm font-bold">
                  <User className="w-4 h-4 mr-1" />
                  {course.creatorName}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-brand-black mb-6">{course.title}</h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-10">
                {course.description}
              </p>

              <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-gray-100">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <ShieldCheck className="w-6 h-6 text-brand-orange mr-2" /> What you'll learn
                  </h3>
                  <ul className="space-y-3">
                    {['Expert insights', 'Practical skills', 'Industry standards', 'Community support'].map((item, i) => (
                      <li key={i} className="flex items-center text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Star className="w-6 h-6 text-brand-orange mr-2" /> Course Features
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-500">
                      <Video className="w-4 h-4 text-brand-orange mr-3" />
                      High-quality video content
                    </li>
                    <li className="flex items-center text-gray-500">
                      <Lock className="w-4 h-4 text-brand-orange mr-3" />
                      Lifetime access (if purchased)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {!isAuthorized && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-brand-black text-white rounded-[40px] p-8 shadow-xl border border-white/10"
              >
                <div className="mb-8">
                  <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-2">One-time Purchase</p>
                  <h3 className="text-4xl font-bold">KSh {course.price}</h3>
                </div>

                <div className="space-y-4 mb-10">
                  <button 
                    onClick={handleStkPush}
                    disabled={purchaseLoading}
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:bg-brand-orange/80 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    <Smartphone className="w-5 h-5 mr-2" /> {purchaseLoading ? 'Processing...' : 'Pay via M-Pesa'}
                  </button>
                  <button 
                    onClick={handleWhatsAppPurchase}
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold hover:bg-[#25D366]/80 transition-all flex items-center justify-center"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" /> Buy via WhatsApp
                  </button>
                  <button 
                    onClick={handleEmailPurchase}
                    className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center border border-white/10"
                  >
                    <Mail className="w-5 h-5 mr-2" /> Buy via Email
                  </button>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-brand-orange mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Purchasing this course gives you permanent access to this content. For unlimited access to all courses, consider a platform subscription.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6">About the Creator</h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-brand-orange" />
                </div>
                <div>
                  <p className="font-bold text-lg">{course.creatorName}</p>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Verified Creator</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Expert in {course.category} with years of experience in the field.
              </p>
              <button 
                onClick={() => navigate(`/creator/${course.creatorUid}`)}
                className="w-full py-4 border-2 border-brand-orange text-brand-orange rounded-2xl font-bold hover:bg-brand-orange hover:text-white transition-all"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
