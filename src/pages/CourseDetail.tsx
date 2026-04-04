import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Lock, Coins, CheckCircle2, User, Clock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const { user, userProfile: userData } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Error loading course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;

    const checkAccess = async () => {
      // Check if user is the creator
      if (course?.creatorUid === user.uid) {
        setHasAccess(true);
        return;
      }

      // Check for purchase
      const purchaseId = `${user.uid}_${id}`;
      const purchaseDoc = await getDoc(doc(db, 'purchases', purchaseId));
      if (purchaseDoc.exists()) {
        setHasAccess(true);
        return;
      }

      // Check for subscription
      const subDoc = await getDoc(doc(db, 'subscriptions', user.uid));
      if (subDoc.exists()) {
        const subData = subDoc.data();
        if (subData.status === 'active' && subData.expiresAt.toDate() > new Date()) {
          setHasAccess(true);
          return;
        }
      }

      setHasAccess(false);
    };

    if (course) checkAccess();
  }, [id, user, course]);

  useEffect(() => {
    if (hasAccess && id) {
      const fetchContent = async () => {
        try {
          const contentDoc = await getDoc(doc(db, 'courseContents', id));
          if (contentDoc.exists()) {
            setContent(contentDoc.data());
          }
        } catch (err) {
          console.error('Error fetching content:', err);
        }
      };
      fetchContent();
    }
  }, [hasAccess, id]);

  const handlePurchase = async () => {
    if (!user || !course || !userData) return;
    if (userData.points < course.price) {
      alert('Insufficient points. Please top up your balance.');
      return;
    }

    setPurchasing(true);
    try {
      const purchaseId = `${user.uid}_${id}`;
      const platformShare = course.price * 0.2; // 20% platform share
      const creatorShare = course.price * 0.8; // 80% creator share

      // Create purchase record
      await setDoc(doc(db, 'purchases', purchaseId), {
        id: purchaseId,
        userUid: user.uid,
        courseId: id,
        amountPaid: course.price,
        platformShare,
        creatorShare,
        timestamp: serverTimestamp()
      });

      // Deduct points from user
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-course.price)
      });

      // Add points to creator (optional, or track in a separate revenue collection)
      await updateDoc(doc(db, 'users', course.creatorUid), {
        points: increment(creatorShare)
      });

      setHasAccess(true);
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Failed to complete purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !course) return <div className="min-h-screen flex items-center justify-center">{error || 'Course not found'}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/courses" className="inline-flex items-center text-gray-500 hover:text-brand-orange mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-brand-black rounded-[40px] overflow-hidden shadow-2xl aspect-video relative group">
              {hasAccess && content ? (
                <iframe 
                  src={content.videoUrl} 
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-brand-orange" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Content Locked</h2>
                  <p className="text-white/60 max-w-md mb-8">
                    This course is premium content. Purchase access or subscribe to watch the full tutorial.
                  </p>
                  {!user ? (
                    <button className="bg-brand-orange text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-brand-orange/30 transition-all">
                      Sign In to Unlock
                    </button>
                  ) : (
                    <button 
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="bg-brand-orange text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-brand-orange/30 transition-all flex items-center"
                    >
                      {purchasing ? 'Processing...' : `Unlock for ${course.price} Points`}
                      <Coins className="ml-2 w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-12 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
              <h1 className="text-4xl font-bold mb-6">{course.title}</h1>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl text-gray-600">
                  <User className="w-4 h-4 mr-2" /> {course.creatorName}
                </div>
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl text-gray-600">
                  <Clock className="w-4 h-4 mr-2" /> 12 Lessons
                </div>
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl text-gray-600">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Verified Creator
                </div>
              </div>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>{course.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Course Features</h3>
              <ul className="space-y-4">
                {[
                  'Full HD Video Content',
                  'Downloadable Resources',
                  'Certificate of Completion',
                  'Lifetime Access',
                  'Expert Support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-brand-orange mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-brand-orange rounded-[40px] p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Unlimited Access</h3>
              <p className="text-white/80 mb-8 text-sm">
                Get access to all current and future courses with our premium subscription.
              </p>
              <button className="w-full bg-white text-brand-orange py-4 rounded-2xl font-bold hover:shadow-xl transition-all">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
