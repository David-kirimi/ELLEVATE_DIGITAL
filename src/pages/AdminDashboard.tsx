import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, Shield, Users, Trophy, FileText, Check, Ban, HelpCircle, Layout, Image as ImageIcon, Terminal, Info, AlertCircle, Music, Music2, ShoppingCart, Heart, Video, CheckCircle, UserPlus, Search } from 'lucide-react';
import { db, auth } from '../firebase';
import ConfirmModal from '../components/ConfirmModal';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any>(null);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleFirestoreError = (error: any, operation: string, path: string) => {
    const errInfo = {
      error: error.message || String(error),
      operation,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      }
    };
    console.error(`Firestore Error [${operation}] on [${path}]:`, JSON.stringify(errInfo));
    // toast.error(`Permission denied for ${path}`);
  };

  const [activeTab, setActiveTab] = useState<'contestants' | 'users' | 'applications' | 'questions' | 'content' | 'music' | 'mpesa' | 'transactions' | 'votes' | 'courses' | 'subscriptions'>('contestants');
  const [mpesaSettings, setMpesaSettings] = useState({
    consumerKey: '',
    consumerSecret: '',
    shortcode: '',
    passkey: '',
    callbackUrl: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingMusic, setIsAddingMusic] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMusicId, setEditingMusicId] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    title: string;
    message: string;
  }>({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'musician',
    bio: '',
    image: '',
    votes: 0,
    competitionId: 'general',
    isVerified: false,
    socials: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      spotify: ''
    },
    songs: [] as { id: string; title: string; votes: number; youtubeUrl?: string }[]
  });

  const [musicFormData, setMusicFormData] = useState({
    title: '',
    youtubeUrl: '',
    artistId: '',
    votes: 0
  });

  const [contentFormData, setContentFormData] = useState({
    heroTitle: 'VOTE FOR YOUR FAVORITE TALENT',
    heroSubtitle: 'Empowering the next generation of stars through community-driven recognition and support.',
    heroImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80',
    aboutTitle: 'CELEBRATING EXCELLENCE',
    aboutText: 'Our platform is dedicated to discovering, nurturing, and celebrating the diverse talents within the community. From music and arts to modeling and innovation, we provide a stage for excellence to shine.',
    contactEmail: 'support@eliax.com',
    contactPhone: '+254 700 000 000',
    footerText: '© 2026 Eliax. All rights reserved. Built for the community.',
    logoText: 'ELIAX',
    logoSubtext: 'DIGITAL',
    eventName: 'Excellence Awards 2026',
    heroButtonText: 'Vote Now',
    missionLabel: 'Our Mission',
    statsYear: '2026',
    statsCategories: '12+',
    contactAddress: 'Nairobi, Kenya',
    socialInstagram: '#',
    socialFacebook: '#',
    socialTwitter: '#',
    whatsappNumber: '254794415006',
    pointsHelpTitle: 'Need help with payments?',
    pointsHelpText: 'We support M-Pesa, Card, and Bank transfers. If you encounter any issues with your purchase, our support team is available 24/7.',
    pointsHelpButtonText: 'Contact Support',
    subscriptionFee: 1000,
    subscriptionDurationDays: 30
  });

  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    type: 'text' as 'text' | 'textarea' | 'select',
    options: '',
    order: 0,
    targetRole: 'contestant' as 'contestant' | 'creator'
  });

  const [userFormData, setUserFormData] = useState({
    displayName: '',
    email: '',
    role: 'fan',
    points: 0,
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
    isVerifiedCreator: false
  });

  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: 'tech',
    thumbnail: '',
    videoUrl: '',
    price: 0,
    isSubscriptionOnly: false,
    creatorUid: '',
    creatorName: ''
  });

  useEffect(() => {
    const qContestants = query(collection(db, 'contestants'), orderBy('name', 'asc'));
    const unsubContestants = onSnapshot(qContestants, (snapshot) => {
      setContestants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'contestants'));

    const qUsers = query(collection(db, 'users'), orderBy('displayName', 'asc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'users'));

    const qApps = query(collection(db, 'contestantApplications'), orderBy('timestamp', 'desc'));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'contestantApplications'));

    const qQuestions = query(collection(db, 'applicationQuestions'), orderBy('order', 'asc'));
    const unsubQuestions = onSnapshot(qQuestions, (snapshot) => {
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'applicationQuestions'));

    const unsubContent = onSnapshot(doc(db, 'siteSettings', 'content'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSiteContent(data);
        setContentFormData(prev => ({ ...prev, ...data }));
      }
      setIsContentLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'GET', 'siteSettings/content');
      setIsContentLoading(false);
    });

    const unsubMpesa = onSnapshot(doc(db, 'siteSettings', 'mpesa'), (doc) => {
      if (doc.exists()) {
        setMpesaSettings(doc.data() as any);
      }
      setLoading(false);
    }, (err) => handleFirestoreError(err, 'GET', 'siteSettings/mpesa'));

    const qTransactions = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'transactions'));

    const qVotes = query(collection(db, 'votes'), orderBy('timestamp', 'desc'));
    const unsubVotes = onSnapshot(qVotes, (snapshot) => {
      setVotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'votes'));

    const qCourses = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'courses'));

    const qSubscriptions = query(collection(db, 'subscriptions'), orderBy('expiresAt', 'desc'));
    const unsubSubscriptions = onSnapshot(qSubscriptions, (snapshot) => {
      setSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'LIST', 'subscriptions'));

    return () => {
      unsubContestants();
      unsubUsers();
      unsubApps();
      unsubQuestions();
      unsubContent();
      unsubMpesa();
      unsubTransactions();
      unsubVotes();
      unsubCourses();
      unsubSubscriptions();
    };
  }, []);

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isContentLoading) {
      toast.error("Please wait for content to load before saving.");
      return;
    }
    const loadingToast = toast.loading("Updating site content...");
    try {
      await setDoc(doc(db, 'siteSettings', 'content'), contentFormData);
      toast.success("Site content updated successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error updating site content:", err);
      toast.error("Error updating site content.", { id: loadingToast });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("Failed to update user role");
    }
  };

  const handleVerificationChange = async (userId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isVerifiedCreator: isVerified });
      toast.success(`User verification status updated`);
    } catch (err) {
      console.error("Error updating verification:", err);
      toast.error("Failed to update verification status");
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingUserId ? "Updating user..." : "Adding user...");
    try {
      if (editingUserId) {
        await updateDoc(doc(db, 'users', editingUserId), userFormData);
        toast.success("User updated successfully", { id: loadingToast });
      } else {
        // For new users, we use a random ID since we can't create Auth accounts
        const newUserId = Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'users', newUserId), {
          ...userFormData,
          uid: newUserId,
          createdAt: serverTimestamp()
        });
        toast.success("User profile created. They can sign up with this email.", { id: loadingToast });
      }
      setIsAddingUser(false);
      setEditingUserId(null);
      setUserFormData({
        displayName: '',
        email: '',
        role: 'fan',
        points: 0,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
        isVerifiedCreator: false
      });
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("Failed to save user", { id: loadingToast });
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingCourseId ? "Updating course..." : "Adding course...");
    try {
      const data = {
        ...courseFormData,
        videoUrl: getYouTubeEmbedUrl(courseFormData.videoUrl),
        status: 'approved', // Admin added courses are auto-approved
        updatedAt: serverTimestamp()
      };

      if (editingCourseId) {
        await updateDoc(doc(db, 'courses', editingCourseId), data);
        toast.success("Course updated successfully", { id: loadingToast });
      } else {
        await addDoc(collection(db, 'courses'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success("Course added successfully", { id: loadingToast });
      }
      setIsAddingCourse(false);
      setEditingCourseId(null);
      setCourseFormData({
        title: '',
        description: '',
        category: 'tech',
        thumbnail: '',
        videoUrl: '',
        price: 0,
        isSubscriptionOnly: false,
        creatorUid: auth.currentUser?.uid || '',
        creatorName: auth.currentUser?.displayName || 'Admin'
      });
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error("Failed to save course", { id: loadingToast });
    }
  };

  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicFormData.artistId) {
      toast.error("Please select an artist");
      return;
    }

    const loadingToast = toast.loading(editingMusicId ? "Updating song..." : "Adding song...");
    try {
      const artist = contestants.find(c => c.id === musicFormData.artistId);
      if (!artist) throw new Error("Artist not found");

      let updatedSongs = [...(artist.songs || [])];
      const newSong = {
        id: editingMusicId || Math.random().toString(36).substr(2, 9),
        title: musicFormData.title,
        youtubeUrl: getYouTubeEmbedUrl(musicFormData.youtubeUrl),
        votes: musicFormData.votes || 0
      };

      if (editingMusicId) {
        updatedSongs = updatedSongs.map(s => s.id === editingMusicId ? newSong : s);
      } else {
        updatedSongs.push(newSong);
      }

      await updateDoc(doc(db, 'contestants', musicFormData.artistId), { songs: updatedSongs });
      
      setIsAddingMusic(false);
      setEditingMusicId(null);
      setMusicFormData({ title: '', youtubeUrl: '', artistId: '', votes: 0 });
      toast.success(editingMusicId ? "Song updated!" : "Song added!", { id: loadingToast });
    } catch (err) {
      console.error("Error saving music:", err);
      toast.error("Failed to save music", { id: loadingToast });
    }
  };

  const handleDeleteMusic = async (artistId: string, songId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Song',
      message: 'Are you sure you want to delete this song? This will remove it from the artist\'s profile.',
      onConfirm: async () => {
        try {
          const artist = contestants.find(c => c.id === artistId);
          if (!artist) return;
          const updatedSongs = artist.songs.filter((s: any) => s.id !== songId);
          await updateDoc(doc(db, 'contestants', artistId), { songs: updatedSongs });
          toast.success("Song deleted successfully");
        } catch (err) {
          console.error("Error deleting song:", err);
          toast.error("Failed to delete song");
        }
      }
    });
  };

  const handleEditMusic = (artistId: string, song: any) => {
    setMusicFormData({
      title: song.title,
      youtubeUrl: song.youtubeUrl || '',
      artistId: artistId,
      votes: song.votes || 0
    });
    setEditingMusicId(song.id);
    setIsAddingMusic(true);
  };

  const handleApproveApplication = async (app: any) => {
    const loadingToast = toast.loading("Approving application...");
    try {
      // 1. Update application status
      await updateDoc(doc(db, 'contestantApplications', app.id), { status: 'approved' });
      
      // 2. Update user role and verification
      const userUpdate: any = { role: app.role };
      if (app.role === 'creator') {
        userUpdate.isVerifiedCreator = true;
      }
      await updateDoc(doc(db, 'users', app.userUid), userUpdate);

      // 3. Create contestant entry if it's a contestant
      if (app.role === 'contestant') {
        await addDoc(collection(db, 'contestants'), {
          name: app.fullName,
          category: app.category,
          bio: app.bio,
          image: `https://ui-avatars.com/api/?name=${app.fullName}&background=random`,
          votes: 0,
          competitionId: 'general',
          isVerified: true,
          uid: app.userUid,
          createdAt: new Date().toISOString()
        });
      }

      toast.success(`Application approved and user promoted to ${app.role}!`, { id: loadingToast });
    } catch (err) {
      console.error("Error approving application:", err);
      toast.error("Failed to approve application", { id: loadingToast });
    }
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'contestantApplications', appId), { status: 'rejected' });
      toast.success("Application rejected");
    } catch (err) {
      console.error("Error rejecting application:", err);
      toast.error("Failed to reject application");
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...questionFormData,
        options: questionFormData.options.split(',').map(o => o.trim()).filter(o => o !== '')
      };
      await addDoc(collection(db, 'applicationQuestions'), data);
      setIsAddingQuestion(false);
      setQuestionFormData({ question: '', type: 'text', options: '', order: questions.length, targetRole: 'contestant' });
    } catch (err) {
      console.error("Error saving question:", err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this application question? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'applicationQuestions', id));
          toast.success("Question deleted successfully");
        } catch (err) {
          console.error("Error deleting question:", err);
          toast.error("Failed to delete question");
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? "Updating contestant..." : "Creating contestant...");
    
    // Process songs to ensure embed URLs
    const processedSongs = formData.songs.map(song => ({
      ...song,
      youtubeUrl: song.youtubeUrl ? getYouTubeEmbedUrl(song.youtubeUrl) : ''
    }));

    const finalData = {
      ...formData,
      songs: processedSongs
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'contestants', editingId), finalData);
        setEditingId(null);
        toast.success("Contestant updated successfully!", { id: loadingToast });
      } else {
        await addDoc(collection(db, 'contestants'), {
          ...finalData,
          createdAt: new Date().toISOString()
        });
        setIsAdding(false);
        toast.success("Contestant created successfully!", { id: loadingToast });
      }
      setFormData({
        name: '',
        category: 'musician',
        bio: '',
        image: '',
        votes: 0,
        competitionId: 'general',
        isVerified: false,
        socials: {
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          spotify: ''
        },
        songs: []
      });
    } catch (err) {
      console.error("Error saving contestant:", err);
      toast.error("Error saving contestant. Check console for details.", { id: loadingToast });
    }
  };

  const handleEdit = (contestant: any) => {
    setEditingId(contestant.id);
    setFormData({
      name: contestant.name,
      category: contestant.category,
      bio: contestant.bio,
      image: contestant.image,
      votes: contestant.votes || 0,
      competitionId: contestant.competitionId || 'general',
      isVerified: contestant.isVerified || false,
      socials: {
        instagram: contestant.socials?.instagram || '',
        facebook: contestant.socials?.facebook || '',
        twitter: contestant.socials?.twitter || '',
        youtube: contestant.socials?.youtube || '',
        tiktok: contestant.socials?.tiktok || '',
        spotify: contestant.socials?.spotify || ''
      },
      songs: contestant.songs || []
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Contestant',
      message: 'Are you sure you want to delete this contestant? This will remove all their data from the platform.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'contestants', id));
          toast.success("Contestant deleted successfully");
        } catch (err) {
          console.error("Error deleting contestant:", err);
          toast.error("Failed to delete contestant");
        }
      }
    });
  };

  const fixNegativeVotes = async () => {
    const loadingToast = toast.loading("Fixing negative votes...");
    try {
      const negativeContestants = contestants.filter(c => (c.votes || 0) < 0);
      for (const c of negativeContestants) {
        await updateDoc(doc(db, 'contestants', c.id), { votes: 0 });
      }
      toast.success(`Fixed ${negativeContestants.length} contestants with negative votes!`, { id: loadingToast });
    } catch (err) {
      console.error("Error fixing negative votes:", err);
      toast.error("Failed to fix negative votes", { id: loadingToast });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {!import.meta.env.VITE_IMGBB_API_KEY && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-start">
            <AlertCircle className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-1">ImgBB API Key Missing</h3>
              <p className="text-sm text-red-500/80 leading-relaxed">
                Image uploads will not work until you add the <strong>VITE_IMGBB_API_KEY</strong> environment variable in the <strong>Settings</strong> menu. 
                Please use the key you provided: <code>6738b516f540a67d53653ce65d43e906</code>
              </p>
            </div>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center space-x-2 text-brand-orange mb-4">
            <Shield className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">Admin Portal</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-brand-orange leading-[0.9] uppercase tracking-tighter">
            Platform<br />Management
          </h1>
        </div>
        
        <div className="flex flex-col space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={fixNegativeVotes}
              className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-sm font-bold flex items-center hover:bg-red-100 transition-all border border-red-100 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Fix Negative Votes
            </button>
          </div>

          <div className="w-full">
            <div className="flex bg-white p-2 rounded-3xl shadow-md border border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex space-x-2 min-w-max">
                <button 
                  onClick={() => setActiveTab('contestants')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'contestants' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Trophy className="w-4 h-4 mr-2" /> Contestants
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'users' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Users className="w-4 h-4 mr-2" /> Users & Roles
                </button>
                <button 
                  onClick={() => setActiveTab('applications')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'applications' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <FileText className="w-4 h-4 mr-2" /> Applications
                  {applications.filter(a => a.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {applications.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('questions')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'questions' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <HelpCircle className="w-4 h-4 mr-2" /> Questions
                </button>
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'content' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Layout className="w-4 h-4 mr-2" /> Site Content
                </button>
                <button 
                  onClick={() => setActiveTab('music')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'music' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Music className="w-4 h-4 mr-2" /> Music
                </button>
                <button 
                  onClick={() => setActiveTab('mpesa')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'mpesa' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Shield className="w-4 h-4 mr-2" /> M-Pesa
                </button>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'transactions' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Transactions
                </button>
                <button 
                  onClick={() => setActiveTab('votes')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'votes' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Heart className="w-4 h-4 mr-2" /> Votes
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'courses' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <Video className="w-4 h-4 mr-2" /> Video Library
                  {courses.filter(c => c.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {courses.filter(c => c.status === 'pending').length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('subscriptions')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center whitespace-nowrap ${activeTab === 'subscriptions' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-brand-black hover:bg-gray-50'}`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Subscriptions
                </button>
              </div>
            </div>
          </div>
        </div>

      {activeTab === 'contestants' ? (
          <>
            {!isAdding && (
              <div className="flex justify-end mb-8">
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add New Contestant
                </button>
              </div>
            )}

            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 mb-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{editingId ? 'Edit Contestant' : 'New Contestant'}</h2>
                  <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-400 hover:text-brand-black">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="musician">Musician</option>
                        <option value="artist">Artist</option>
                        <option value="model">Model</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Competition</label>
                      <select 
                        value={formData.competitionId}
                        onChange={(e) => setFormData({...formData, competitionId: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="general">General Competition</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                      <input 
                        type="checkbox"
                        id="isVerified"
                        checked={formData.isVerified}
                        onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      />
                      <label htmlFor="isVerified" className="text-sm font-bold text-gray-700 cursor-pointer">Verified Contestant</label>
                    </div>                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Initial Votes</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.votes}
                        onChange={(e) => setFormData({...formData, votes: Math.max(0, parseInt(e.target.value) || 0)})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">Social Media Links</label>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="url" 
                          placeholder="Instagram URL"
                          value={formData.socials.instagram}
                          onChange={(e) => setFormData({...formData, socials: {...formData.socials, instagram: e.target.value}})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                        />
                        <input 
                          type="url" 
                          placeholder="Facebook URL"
                          value={formData.socials.facebook}
                          onChange={(e) => setFormData({...formData, socials: {...formData.socials, facebook: e.target.value}})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                        />
                        <input 
                          type="url" 
                          placeholder="Twitter URL"
                          value={formData.socials.twitter}
                          onChange={(e) => setFormData({...formData, socials: {...formData.socials, twitter: e.target.value}})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                        />
                        <input 
                          type="url" 
                          placeholder="YouTube URL"
                          value={formData.socials.youtube}
                          onChange={(e) => setFormData({...formData, socials: {...formData.socials, youtube: e.target.value}})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                        />
                        <input 
                          type="url" 
                          placeholder="TikTok URL"
                          value={formData.socials.tiktok}
                          onChange={(e) => setFormData({...formData, socials: {...formData.socials, tiktok: e.target.value}})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                        />
                        <input 
                          type="url" 
                          placeholder="Spotify URL"
                          value={formData.socials.spotify}
                          onChange={(e) => setFormData({...formData, socials: {...formData.socials, spotify: e.target.value}})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                        />
                      </div>
                    </div>

                    {formData.category === 'musician' && (
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Nominated Songs</label>
                        {formData.songs.map((song, idx) => (
                          <div key={song.id} className="p-4 bg-gray-50 rounded-2xl space-y-3">
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Song Title"
                                value={song.title}
                                onChange={(e) => {
                                  const newSongs = [...formData.songs];
                                  newSongs[idx].title = e.target.value;
                                  setFormData({...formData, songs: newSongs});
                                }}
                                className="flex-1 px-4 py-2 rounded-xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newSongs = formData.songs.filter((_, i) => i !== idx);
                                  setFormData({...formData, songs: newSongs});
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <input 
                              type="url"
                              placeholder="YouTube Embed URL (e.g. https://www.youtube.com/embed/...)"
                              value={song.youtubeUrl || ''}
                              onChange={(e) => {
                                const newSongs = [...formData.songs];
                                newSongs[idx].youtubeUrl = e.target.value;
                                setFormData({...formData, songs: newSongs});
                              }}
                              className="w-full px-4 py-2 rounded-xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                            />
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, songs: [...formData.songs, { id: Math.random().toString(36).substr(2, 9), title: '', votes: 0, youtubeUrl: '' }]})}
                          className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:border-brand-orange hover:text-brand-orange transition-all"
                        >
                          + Add Nominated Song
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image</label>
                      <ImageUpload 
                        folder="contestants"
                        initialImage={formData.image}
                        onUploadComplete={(url) => setFormData({...formData, image: url})}
                      />
                      <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-400 mb-2">Or use Image URL</label>
                        <input 
                          type="url" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Biography</label>
                      <textarea 
                        rows={5}
                        required
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                        placeholder="Tell us about the contestant..."
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" /> {editingId ? 'Update Contestant' : 'Save Contestant'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Contestant</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Category</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Competition</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-center">Votes</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contestants.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img src={c.image} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                              {c.isVerified && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                                  <Check className="w-2 h-2" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold">{c.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{c.bio}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold capitalize">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold capitalize">
                            {c.competitionId === 'general' ? 'General' : c.competitionId}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center font-bold">
                          {c.votes}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleEdit(c)}
                              className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'questions' ? (
          <div className="space-y-8">
            {!isAddingQuestion && (
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsAddingQuestion(true)}
                  className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Question
                </button>
              </div>
            )}

            {isAddingQuestion && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">New Application Question</h2>
                  <button onClick={() => setIsAddingQuestion(false)} className="text-gray-400 hover:text-brand-black">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleQuestionSubmit} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                      <input 
                        type="text" 
                        required
                        value={questionFormData.question}
                        onChange={(e) => setQuestionFormData({...questionFormData, question: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. Why do you want to join?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Input Type</label>
                      <select 
                        value={questionFormData.type}
                        onChange={(e) => setQuestionFormData({...questionFormData, type: e.target.value as any})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Multiple Choice</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Options (comma separated, for Multiple Choice)</label>
                      <input 
                        type="text" 
                        value={questionFormData.options}
                        onChange={(e) => setQuestionFormData({...questionFormData, options: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="Option 1, Option 2, Option 3"
                        disabled={questionFormData.type !== 'select'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Target Role</label>
                      <select 
                        value={questionFormData.targetRole}
                        onChange={(e) => setQuestionFormData({...questionFormData, targetRole: e.target.value as any})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="contestant">Contestant</option>
                        <option value="creator">Creator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                      <input 
                        type="number" 
                        value={questionFormData.order}
                        onChange={(e) => setQuestionFormData({...questionFormData, order: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" /> Save Question
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Order</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Question</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Type</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-bold text-gray-400">#{q.order}</td>
                        <td className="px-8 py-6 font-bold">{q.question}</td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold capitalize">
                            {q.type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'content' ? (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-8">Manage Site Content</h2>
              
              <form onSubmit={handleContentSubmit} className="space-y-12">
                {/* Header & Logo Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-brand-orange flex items-center">
                    <Shield className="w-5 h-5 mr-2" /> Header & Logo
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Logo Main Text</label>
                      <input 
                        type="text"
                        required
                        value={contentFormData.logoText}
                        onChange={(e) => setContentFormData({...contentFormData, logoText: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. ELIAX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Logo Subtext</label>
                      <input 
                        type="text"
                        required
                        value={contentFormData.logoSubtext}
                        onChange={(e) => setContentFormData({...contentFormData, logoSubtext: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. DIGITAL"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-brand-orange flex items-center">
                    <Layout className="w-5 h-5 mr-2" /> Hero Section
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Event Name (Badge)</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.eventName}
                          onChange={(e) => setContentFormData({...contentFormData, eventName: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                          placeholder="e.g. Excellence Awards 2026"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hero Title</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.heroTitle}
                          onChange={(e) => setContentFormData({...contentFormData, heroTitle: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hero Button Text</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.heroButtonText}
                          onChange={(e) => setContentFormData({...contentFormData, heroButtonText: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hero Subtitle</label>
                        <textarea 
                          rows={3}
                          required
                          value={contentFormData.heroSubtitle}
                          onChange={(e) => setContentFormData({...contentFormData, heroSubtitle: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Hero Image</label>
                      <ImageUpload 
                        folder="site"
                        initialImage={contentFormData.heroImage}
                        onUploadComplete={(url) => setContentFormData({...contentFormData, heroImage: url})}
                      />
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-brand-orange flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" /> About Section
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mission Label</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.missionLabel}
                          onChange={(e) => setContentFormData({...contentFormData, missionLabel: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">About Title</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.aboutTitle}
                          onChange={(e) => setContentFormData({...contentFormData, aboutTitle: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Stat: Year</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.statsYear}
                          onChange={(e) => setContentFormData({...contentFormData, statsYear: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Stat: Categories</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.statsCategories}
                          onChange={(e) => setContentFormData({...contentFormData, statsCategories: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">About Text</label>
                    <textarea 
                      rows={4}
                      required
                      value={contentFormData.aboutText}
                      onChange={(e) => setContentFormData({...contentFormData, aboutText: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Contact & Footer */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-brand-orange flex items-center">
                    <Users className="w-5 h-5 mr-2" /> Contact & Footer
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                        <input 
                          type="email"
                          required
                          value={contentFormData.contactEmail}
                          onChange={(e) => setContentFormData({...contentFormData, contactEmail: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.contactPhone}
                          onChange={(e) => setContentFormData({...contentFormData, contactPhone: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Address</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.contactAddress}
                          onChange={(e) => setContentFormData({...contentFormData, contactAddress: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number (International Format)</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.whatsappNumber}
                          onChange={(e) => setContentFormData({...contentFormData, whatsappNumber: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                          placeholder="e.g. 254794415006"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Instagram URL</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.socialInstagram}
                          onChange={(e) => setContentFormData({...contentFormData, socialInstagram: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Facebook URL</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.socialFacebook}
                          onChange={(e) => setContentFormData({...contentFormData, socialFacebook: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Twitter URL</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.socialTwitter}
                          onChange={(e) => setContentFormData({...contentFormData, socialTwitter: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subscription Settings */}
                  <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                    <h4 className="font-bold text-gray-700">Subscription Settings</h4>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subscription Fee (KSh)</label>
                        <input 
                          type="number"
                          required
                          value={contentFormData.subscriptionFee}
                          onChange={(e) => setContentFormData({...contentFormData, subscriptionFee: parseInt(e.target.value) || 0})}
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Days)</label>
                        <input 
                          type="number"
                          required
                          value={contentFormData.subscriptionDurationDays}
                          onChange={(e) => setContentFormData({...contentFormData, subscriptionDurationDays: parseInt(e.target.value) || 0})}
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Points Page Help Section */}
                  <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                    <h4 className="font-bold text-gray-700">Points Page Help Section</h4>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Help Title</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.pointsHelpTitle}
                          onChange={(e) => setContentFormData({...contentFormData, pointsHelpTitle: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Help Button Text</label>
                        <input 
                          type="text"
                          required
                          value={contentFormData.pointsHelpButtonText}
                          onChange={(e) => setContentFormData({...contentFormData, pointsHelpButtonText: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Help Text</label>
                      <textarea 
                        rows={2}
                        required
                        value={contentFormData.pointsHelpText}
                        onChange={(e) => setContentFormData({...contentFormData, pointsHelpText: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Footer Copyright Text</label>
                    <input 
                      type="text"
                      required
                      value={contentFormData.footerText}
                      onChange={(e) => setContentFormData({...contentFormData, footerText: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-brand-black text-white px-12 py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all flex items-center"
                  >
                    <Save className="w-5 h-5 mr-2" /> Save All Site Content
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : activeTab === 'music' ? (
          <div className="space-y-8">
            {!isAddingMusic && (
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsAddingMusic(true)}
                  className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Nominated Song
                </button>
              </div>
            )}

            {isAddingMusic && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{editingMusicId ? 'Edit Song' : 'Add Nominated Song'}</h2>
                  <button onClick={() => { setIsAddingMusic(false); setEditingMusicId(null); }} className="text-gray-400 hover:text-brand-black">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleMusicSubmit} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Song Title</label>
                      <input 
                        type="text" 
                        required
                        value={musicFormData.title}
                        onChange={(e) => setMusicFormData({...musicFormData, title: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. My Best Hit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Embed URL</label>
                      <input 
                        type="url" 
                        required
                        value={musicFormData.youtubeUrl}
                        onChange={(e) => setMusicFormData({...musicFormData, youtubeUrl: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="https://www.youtube.com/embed/..."
                      />
                      <p className="mt-2 text-[10px] text-gray-400">Use the embed URL format: https://www.youtube.com/embed/VIDEO_ID</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nominated Artist</label>
                      <select 
                        required
                        value={musicFormData.artistId}
                        onChange={(e) => setMusicFormData({...musicFormData, artistId: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="">Select an artist...</option>
                        {contestants.filter(c => c.category === 'musician').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Initial Votes</label>
                      <input 
                        type="number" 
                        min="0"
                        value={musicFormData.votes}
                        onChange={(e) => setMusicFormData({...musicFormData, votes: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" /> {editingMusicId ? 'Update Song' : 'Save Song'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Song Title</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Artist</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-center">Votes</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contestants.filter(c => c.songs && c.songs.length > 0).flatMap(artist => 
                      artist.songs.map((song: any) => (
                        <tr key={song.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                                <Music className="w-5 h-5 text-brand-orange" />
                              </div>
                              <div>
                                <p className="font-bold">{song.title}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">{song.youtubeUrl}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <img src={artist.image} alt={artist.name} className="w-8 h-8 rounded-full object-cover" />
                              <span className="font-bold text-sm">{artist.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center font-bold text-brand-orange">
                            {song.votes || 0}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditMusic(artist.id, song)}
                                className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMusic(artist.id, song.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'mpesa' ? (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">M-Pesa Daraja Settings</h2>
                  <p className="text-sm text-gray-400">Configure your Safaricom Daraja API credentials for STK Push payments.</p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                  Sandbox Mode
                </div>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const loadingToast = toast.loading("Saving M-Pesa settings...");
                try {
                  await setDoc(doc(db, 'siteSettings', 'mpesa'), mpesaSettings);
                  toast.success("M-Pesa settings saved successfully!", { id: loadingToast });
                } catch (err) {
                  console.error("Error saving M-Pesa settings:", err);
                  toast.error("Failed to save M-Pesa settings.", { id: loadingToast });
                }
              }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Consumer Key</label>
                      <input 
                        type="password"
                        required
                        value={mpesaSettings.consumerKey}
                        onChange={(e) => setMpesaSettings({...mpesaSettings, consumerKey: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="Your Daraja Consumer Key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Consumer Secret</label>
                      <input 
                        type="password"
                        required
                        value={mpesaSettings.consumerSecret}
                        onChange={(e) => setMpesaSettings({...mpesaSettings, consumerSecret: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="Your Daraja Consumer Secret"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Business Shortcode</label>
                      <input 
                        type="text"
                        required
                        value={mpesaSettings.shortcode}
                        onChange={(e) => setMpesaSettings({...mpesaSettings, shortcode: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. 174379"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Passkey</label>
                      <input 
                        type="password"
                        required
                        value={mpesaSettings.passkey}
                        onChange={(e) => setMpesaSettings({...mpesaSettings, passkey: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="Your Daraja Passkey"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-4 mt-1 flex-shrink-0" />
                  <div className="text-sm text-blue-600 leading-relaxed">
                    <p className="font-bold mb-1">Important Note:</p>
                    These keys are used for the STK Push integration. Ensure you are using the <strong>Sandbox</strong> credentials for testing. 
                    The callback URL is automatically generated based on your application's deployment URL.
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-brand-black text-white px-12 py-4 rounded-2xl font-bold hover:bg-brand-orange transition-all flex items-center"
                  >
                    <Save className="w-5 h-5 mr-2" /> Save M-Pesa Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        ) : activeTab === 'transactions' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Transactions</p>
                <p className="text-3xl font-bold">{transactions.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  KSh {transactions.filter(t => t.status === 'completed').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Points Sold</p>
                <p className="text-3xl font-bold text-brand-orange">
                  {transactions.filter(t => t.status === 'completed').reduce((acc, curr) => acc + (curr.points || 0), 0).toLocaleString()} pts
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Transaction ID</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">User</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Phone</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Amount</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Points</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Status</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs text-gray-400">{t.id}</td>
                        <td className="px-8 py-6">
                          <p className="font-bold">{t.userEmail}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{t.userId}</p>
                        </td>
                        <td className="px-8 py-6 text-sm">{t.phoneNumber}</td>
                        <td className="px-8 py-6 font-bold">KSh {t.amount}</td>
                        <td className="px-8 py-6 font-bold text-brand-orange">{t.points} pts</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-gray-500">
                          {new Date(t.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-8 py-12 text-center text-gray-500">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
                <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pending Moderation</p>
                  <p className="text-2xl font-bold text-brand-orange">
                    {courses.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAddingCourse(true);
                  setEditingCourseId(null);
                  setCourseFormData({
                    title: '',
                    description: '',
                    category: 'tech',
                    thumbnail: '',
                    videoUrl: '',
                    price: 0,
                    isSubscriptionOnly: false,
                    creatorUid: auth.currentUser?.uid || '',
                    creatorName: auth.currentUser?.displayName || 'Admin'
                  });
                }}
                className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all shadow-lg shadow-brand-black/10"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Course
              </button>
            </div>

            {isAddingCourse && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{editingCourseId ? 'Edit Course' : 'Add New Course'}</h2>
                  <button onClick={() => { setIsAddingCourse(false); setEditingCourseId(null); }} className="text-gray-400 hover:text-brand-black">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCourseSubmit} className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Course Title</label>
                      <input 
                        type="text" 
                        required
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData({...courseFormData, title: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. Advanced Web Development"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'science', name: 'Science' },
                          { id: 'tech', name: 'Tech' },
                          { id: 'medicine', name: 'Medicine' },
                          { id: 'food', name: 'Food' },
                          { id: 'fitness', name: 'Fitness' },
                          { id: 'other', name: 'Other' },
                        ].map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCourseFormData({...courseFormData, category: cat.id})}
                            className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                              courseFormData.category === cat.id 
                                ? 'bg-brand-orange text-white' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">YouTube URL</label>
                      <input 
                        type="url" 
                        required
                        value={courseFormData.videoUrl}
                        onChange={(e) => setCourseFormData({...courseFormData, videoUrl: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Price (KSh)</label>
                        <input 
                          type="number" 
                          min="0"
                          value={courseFormData.price}
                          onChange={(e) => setCourseFormData({...courseFormData, price: parseInt(e.target.value) || 0})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                      </div>
                      <div className="flex items-center h-full pt-8">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={courseFormData.isSubscriptionOnly}
                            onChange={(e) => setCourseFormData({...courseFormData, isSubscriptionOnly: e.target.checked})}
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
                        initialImage={courseFormData.thumbnail}
                        onUploadComplete={(url) => setCourseFormData({...courseFormData, thumbnail: url})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Course Description</label>
                      <textarea 
                        rows={6}
                        required
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                        placeholder="Describe what students will learn..."
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-orange text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" /> {editingCourseId ? 'Update Course' : 'Publish Course'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Course</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Creator</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Category</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Status</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <img src={c.thumbnail} alt={c.title} className="w-12 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold">{c.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold">{c.creatorName}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'approved' ? 'bg-green-100 text-green-600' :
                            c.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            {c.status === 'pending' && (
                              <>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await updateDoc(doc(db, 'courses', c.id), { status: 'approved' });
                                      toast.success("Course approved!");
                                    } catch (err) {
                                      toast.error("Failed to approve course");
                                    }
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                  title="Approve"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await updateDoc(doc(db, 'courses', c.id), { status: 'rejected' });
                                      toast.success("Course rejected");
                                    } catch (err) {
                                      toast.error("Failed to reject course");
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Reject"
                                >
                                  <Ban className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => {
                                setEditingCourseId(c.id);
                                setCourseFormData({
                                  title: c.title || '',
                                  description: c.description || '',
                                  category: c.category || 'tech',
                                  thumbnail: c.thumbnail || '',
                                  videoUrl: c.videoUrl || '',
                                  price: c.price || 0,
                                  isSubscriptionOnly: c.isSubscriptionOnly || false,
                                  creatorUid: c.creatorUid || '',
                                  creatorName: c.creatorName || ''
                                });
                                setIsAddingCourse(true);
                              }}
                              className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={async () => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Course',
                                  message: 'Are you sure you want to delete this course? This action cannot be undone.',
                                  onConfirm: async () => {
                                    try {
                                      await deleteDoc(doc(db, 'courses', c.id));
                                      toast.success("Course deleted");
                                    } catch (err) {
                                      toast.error("Failed to delete course");
                                    }
                                  }
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                          No courses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'subscriptions' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">
                  {subscriptions.filter(s => new Date(s.expiresAt) > new Date()).length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">User UID</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Plan</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Started At</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Expires At</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscriptions.map((s) => {
                      const isActive = new Date(s.expiresAt) > new Date();
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-mono text-xs text-gray-400">{s.userId}</td>
                          <td className="px-8 py-6 font-bold capitalize">{s.planId}</td>
                          <td className="px-8 py-6 text-sm text-gray-500">
                            {new Date(s.startedAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500">
                            {new Date(s.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {isActive ? 'Active' : 'Expired'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                          No subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'votes' ? (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Votes Recorded</p>
                <p className="text-3xl font-bold">{votes.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Points Spent</p>
                <p className="text-3xl font-bold text-brand-orange">
                  {votes.reduce((acc, curr) => acc + (curr.pointsSpent || 0), 0).toLocaleString()} pts
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Vote ID</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Voter (UID)</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Contestant</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Points Spent</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {votes.map((v) => {
                      const contestant = contestants.find(c => c.id === v.contestantId);
                      return (
                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-mono text-xs text-gray-400">{v.id}</td>
                          <td className="px-8 py-6 text-xs font-mono text-gray-500">{v.fanUid}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              {contestant?.image && <img src={contestant.image} className="w-8 h-8 rounded-full object-cover" />}
                              <span className="font-bold">{contestant?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-brand-orange">{v.pointsSpent} pts</td>
                          <td className="px-8 py-6 text-xs text-gray-500">
                            {v.timestamp?.toDate ? v.timestamp.toDate().toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                    {votes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                          No votes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-brand-orange outline-none shadow-sm"
                />
              </div>
              <button 
                onClick={() => {
                  setIsAddingUser(true);
                  setEditingUserId(null);
                  setUserFormData({
                    displayName: '',
                    email: '',
                    role: 'fan',
                    points: 0,
                    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
                    isVerifiedCreator: false
                  });
                }}
                className="bg-brand-black text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all shadow-lg shadow-brand-black/10"
              >
                <UserPlus className="w-5 h-5 mr-2" /> Add User
              </button>
            </div>

            {isAddingUser && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{editingUserId ? 'Edit User' : 'Add New User'}</h2>
                  <button onClick={() => { setIsAddingUser(false); setEditingUserId(null); }} className="text-gray-400 hover:text-brand-black">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUserSubmit} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        required
                        value={userFormData.displayName}
                        onChange={(e) => setUserFormData({...userFormData, displayName: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo URL</label>
                      <input 
                        type="url" 
                        value={userFormData.photoURL}
                        onChange={(e) => setUserFormData({...userFormData, photoURL: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                      <select 
                        required
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="fan">Fan</option>
                        <option value="contestant">Contestant</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Points</label>
                      <input 
                        type="number" 
                        min="0"
                        value={userFormData.points}
                        onChange={(e) => setUserFormData({...userFormData, points: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-4">
                      <input 
                        type="checkbox"
                        id="isVerifiedCreator"
                        checked={userFormData.isVerifiedCreator}
                        onChange={(e) => setUserFormData({...userFormData, isVerifiedCreator: e.target.checked})}
                        className="w-6 h-6 rounded-lg border-gray-300 text-brand-orange focus:ring-brand-orange"
                      />
                      <label htmlFor="isVerifiedCreator" className="text-sm font-bold text-gray-700 cursor-pointer">Verified Creator</label>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" /> {editingUserId ? 'Update User' : 'Save User'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">User</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Role</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Verification</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-center">Points</th>
                      <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.filter(u => 
                      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearch.toLowerCase())
                    ).map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                            <div>
                              <p className="font-bold">{u.displayName}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                            u.role === 'creator' ? 'bg-blue-100 text-blue-600' :
                            u.role === 'contestant' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {u.role || 'fan'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs font-bold uppercase ${u.isVerifiedCreator ? 'text-green-600' : 'text-gray-400'}`}>
                              {u.isVerifiedCreator ? 'Verified' : 'Unverified'}
                            </span>
                            <button 
                              onClick={() => handleVerificationChange(u.id, !u.isVerifiedCreator)}
                              className={`p-1.5 rounded-lg transition-all ${u.isVerifiedCreator ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-brand-orange">
                          {u.points || 0}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => {
                                setEditingUserId(u.id);
                                setUserFormData({
                                  displayName: u.displayName || '',
                                  email: u.email || '',
                                  role: u.role || 'fan',
                                  points: u.points || 0,
                                  photoURL: u.photoURL || '',
                                  isVerifiedCreator: u.isVerifiedCreator || false
                                });
                                setIsAddingUser(true);
                              }}
                              className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete User',
                                  message: `Are you sure you want to delete ${u.displayName}? This will remove their profile from the database.`,
                                  onConfirm: async () => {
                                    try {
                                      await deleteDoc(doc(db, 'users', u.id));
                                      toast.success("User deleted");
                                    } catch (err) {
                                      toast.error("Failed to delete user");
                                    }
                                  }
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
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
        ) : (
          <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Applicant</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Category</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Proof</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Status</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold">{app.fullName}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{app.bio}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold capitalize">
                          {app.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <a 
                          href={app.talentProofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-brand-orange hover:underline text-sm font-bold flex items-center"
                        >
                          View Proof <X className="w-3 h-3 ml-1 rotate-45" />
                        </a>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          app.status === 'approved' ? 'bg-green-100 text-green-600' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {app.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleApproveApplication(app)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleRejectApplication(app.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Reject"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
        />
      </div>
    </div>
  );
}

