import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Send, User, Music, Camera, Link as LinkIcon, AlertCircle, CheckCircle, Video, BookOpen, Microscope, Cpu, Stethoscope, Utensils, Dumbbell } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

export default function Application() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'contestant';
  
  const [formData, setFormData] = useState({
    fullName: '',
    category: role === 'contestant' ? 'musician' : 'tech',
    bio: '',
    talentProofUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        if (data.role === role && data.isVerifiedCreator) {
          setError(`You are already a verified ${role}!`);
        }
      }

      // Fetch dynamic questions for this role
      const q = query(
        collection(db, 'applicationQuestions'), 
        where('targetRole', '==', role),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [navigate, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'contestantApplications'), {
        ...formData,
        role,
        answers,
        userUid: auth.currentUser.uid,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const contestantCategories = [
    { id: 'musician', name: 'Musician', icon: Music },
    { id: 'artist', name: 'Artist', icon: Camera },
    { id: 'model', name: 'Model', icon: User },
  ];

  const creatorCategories = [
    { id: 'science', name: 'Science', icon: Microscope },
    { id: 'tech', name: 'Tech', icon: Cpu },
    { id: 'medicine', name: 'Medicine', icon: Stethoscope },
    { id: 'food', name: 'Food', icon: Utensils },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell },
    { id: 'other', name: 'Other', icon: BookOpen },
  ];

  const categories = role === 'contestant' ? contestantCategories : creatorCategories;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 pt-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Sent!</h1>
          <p className="text-gray-500 mb-10">
            Thank you for applying to be a {role}. Our team will review your application and get back to you soon.
          </p>
          <button 
            onClick={() => navigate('/account')}
            className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all"
          >
            Back to Account
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 text-brand-orange mb-4">
            {role === 'contestant' ? <Trophy className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            <span className="text-sm font-bold uppercase tracking-widest">{role} Program</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {role === 'contestant' ? 'Apply to Compete' : 'Become a Creator'}
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {role === 'contestant' 
              ? 'Showcase your talent to thousands of fans and win amazing prizes.'
              : 'Share your knowledge and earn from your expertise.'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-3xl flex items-start border border-red-100">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                    placeholder={role === 'contestant' ? "Your Stage Name" : "Your Professional Name"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {role === 'contestant' ? 'Proof of Talent (Link)' : 'Portfolio/Expertise (Link)'}
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="url" 
                  required
                  value={formData.talentProofUrl}
                  onChange={(e) => setFormData({...formData, talentProofUrl: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                  placeholder="YouTube, LinkedIn, or Portfolio link"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">Share a link that showcases your work or expertise.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Short Bio</label>
              <textarea 
                rows={5}
                required
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                placeholder={role === 'contestant' ? "Tell us about your journey..." : "Tell us about your expertise and what you plan to teach..."}
              />
            </div>

            {/* Dynamic Questions */}
            {questions.length > 0 && (
              <div className="space-y-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-brand-black">Additional Questions</h3>
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">{q.question}</label>
                    {q.type === 'text' && (
                      <input 
                        type="text"
                        required
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    )}
                    {q.type === 'textarea' && (
                      <textarea 
                        rows={4}
                        required
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                      />
                    )}
                    {q.type === 'select' && (
                      <select 
                        required
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="">Select an option</option>
                        {q.options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !!error}
              className="w-full bg-brand-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-brand-orange transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Send className="w-5 h-5 mr-2" /> Submit Application
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
