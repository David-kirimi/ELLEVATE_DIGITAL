import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Camera, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Save, 
  Trash2, 
  ExternalLink,
  LayoutDashboard,
  Award,
  Upload
} from 'lucide-react';
import { db, auth } from '../firebase';
import ConfirmModal from '../components/ConfirmModal';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function ContestantDashboard() {
  const [contestant, setContestant] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPost, setIsAddingPost] = useState(false);
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
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video'
  });
  const [profileFormData, setProfileFormData] = useState({
    bio: '',
    image: '',
    socials: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: ''
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Find contestant document for this user
        const q = query(collection(db, 'contestants'), where('uid', '==', user.uid));
        const unsubContestant = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setContestant({ id: snapshot.docs[0].id, ...data });
            setProfileFormData({
              bio: data.bio || '',
              image: data.image || '',
              socials: data.socials || { instagram: '', facebook: '', twitter: '', youtube: '' }
            });

            // Fetch posts
            const qPosts = query(
              collection(db, 'contestantPosts'), 
              where('contestantUid', '==', user.uid),
              orderBy('timestamp', 'desc')
            );
            onSnapshot(qPosts, (postSnapshot) => {
              setPosts(postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
          } else {
            // Not a contestant yet
            navigate('/account');
          }
          setLoading(false);
        });

        return () => unsubContestant();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestant) return;
    const loadingToast = toast.loading("Updating profile...");
    try {
      await updateDoc(doc(db, 'contestants', contestant.id), profileFormData);
      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile", { id: loadingToast });
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const loadingToast = toast.loading("Publishing post...");
    try {
      await addDoc(collection(db, 'contestantPosts'), {
        ...postFormData,
        contestantUid: auth.currentUser.uid,
        timestamp: new Date().toISOString()
      });
      setIsAddingPost(false);
      setPostFormData({ title: '', description: '', mediaUrl: '', mediaType: 'image' });
      toast.success("Post published successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error adding post:", err);
      toast.error("Failed to publish post", { id: loadingToast });
    }
  };

  const handleDeletePost = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      onConfirm: async () => {
        const loadingToast = toast.loading("Deleting post...");
        try {
          await deleteDoc(doc(db, 'contestantPosts', id));
          toast.success("Post deleted", { id: loadingToast });
        } catch (err) {
          console.error("Error deleting post:", err);
          toast.error("Failed to delete post", { id: loadingToast });
        }
      }
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-brand-orange mb-2">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Contestant Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold">Manage Your Profile</h1>
          </div>
          <div className="flex items-center space-x-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <Award className="w-5 h-5 text-brand-orange" />
            <span className="font-bold text-lg">{contestant?.votes || 0} <span className="text-gray-400 text-sm font-normal">Votes</span></span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Profile Management */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-8 flex items-center">
                <User className="w-5 h-5 mr-3 text-brand-orange" />
                Profile Info
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image</label>
                  <ImageUpload 
                    folder="contestants"
                    initialImage={profileFormData.image}
                    onUploadComplete={(url) => setProfileFormData({...profileFormData, image: url})}
                  />
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-400 mb-2">Or use Image URL</label>
                    <div className="relative">
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="url"
                        value={profileFormData.image}
                        onChange={(e) => setProfileFormData({...profileFormData, image: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                  <textarea 
                    rows={4}
                    value={profileFormData.bio}
                    onChange={(e) => setProfileFormData({...profileFormData, bio: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Social Media Links</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="url"
                      placeholder="Instagram URL"
                      value={profileFormData.socials.instagram}
                      onChange={(e) => setProfileFormData({...profileFormData, socials: {...profileFormData.socials, instagram: e.target.value}})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="url"
                      placeholder="Facebook URL"
                      value={profileFormData.socials.facebook}
                      onChange={(e) => setProfileFormData({...profileFormData, socials: {...profileFormData.socials, facebook: e.target.value}})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="url"
                      placeholder="Twitter URL"
                      value={profileFormData.socials.twitter}
                      onChange={(e) => setProfileFormData({...profileFormData, socials: {...profileFormData.socials, twitter: e.target.value}})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="url"
                      placeholder="YouTube URL"
                      value={profileFormData.socials.youtube}
                      onChange={(e) => setProfileFormData({...profileFormData, socials: {...profileFormData.socials, youtube: e.target.value}})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" /> Save Changes
                </button>
              </form>
            </motion.div>
          </div>

          {/* Work / Posts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Work</h2>
              <button 
                onClick={() => setIsAddingPost(true)}
                className="bg-brand-black text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-brand-orange transition-all"
              >
                <Plus className="w-5 h-5 mr-2" /> Post New Work
              </button>
            </div>

            {isAddingPost && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100"
              >
                <form onSubmit={handlePostSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                      <input 
                        type="text"
                        required
                        value={postFormData.title}
                        onChange={(e) => setPostFormData({...postFormData, title: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="e.g. My Latest Performance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Media Type</label>
                      <select 
                        value={postFormData.mediaType}
                        onChange={(e) => setPostFormData({...postFormData, mediaType: e.target.value as any})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video (YouTube Link)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Media</label>
                    {postFormData.mediaType === 'image' ? (
                      <ImageUpload 
                        folder="posts"
                        initialImage={postFormData.mediaUrl}
                        onUploadComplete={(url) => setPostFormData({...postFormData, mediaUrl: url})}
                      />
                    ) : (
                      <div className="relative">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                          type="url"
                          required
                          value={postFormData.mediaUrl}
                          onChange={(e) => setPostFormData({...postFormData, mediaUrl: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                          placeholder="YouTube Video URL"
                        />
                      </div>
                    )}
                    {postFormData.mediaType === 'image' && (
                      <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-400 mb-2">Or use Image URL</label>
                        <input 
                          type="url"
                          value={postFormData.mediaUrl}
                          onChange={(e) => setPostFormData({...postFormData, mediaUrl: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                      rows={3}
                      value={postFormData.description}
                      onChange={(e) => setPostFormData({...postFormData, description: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none resize-none"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-brand-orange text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                      Publish Work
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAddingPost(false)}
                      className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <motion.div 
                  key={post.id}
                  layout
                  className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100 group"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-300" />
                        <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </a>
                      </div>
                    )}
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{post.description}</p>
                  </div>
                </motion.div>
              ))}
              {posts.length === 0 && !isAddingPost && (
                <div className="col-span-2 text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">No work posted yet. Share your talent!</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
