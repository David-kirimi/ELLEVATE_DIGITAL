import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, Shield, Users, Trophy, FileText, Check, Ban, HelpCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contestants' | 'users' | 'applications' | 'questions'>('contestants');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'musician',
    bio: '',
    image: '',
    votes: 0,
    competitionId: 'general'
  });

  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    type: 'text' as 'text' | 'textarea' | 'select',
    options: '',
    order: 0
  });

  useEffect(() => {
    const qContestants = query(collection(db, 'contestants'), orderBy('name', 'asc'));
    const unsubContestants = onSnapshot(qContestants, (snapshot) => {
      setContestants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qUsers = query(collection(db, 'users'), orderBy('displayName', 'asc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qApps = query(collection(db, 'contestantApplications'), orderBy('timestamp', 'desc'));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qQuestions = query(collection(db, 'applicationQuestions'), orderBy('order', 'asc'));
    const unsubQuestions = onSnapshot(qQuestions, (snapshot) => {
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubContestants();
      unsubUsers();
      unsubApps();
      unsubQuestions();
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleVerificationChange = async (userId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isVerifiedCreator: isVerified });
    } catch (err) {
      console.error("Error updating verification:", err);
    }
  };

  const handleApproveApplication = async (app: any) => {
    try {
      // 1. Update application status
      await updateDoc(doc(db, 'contestantApplications', app.id), { status: 'approved' });
      
      // 2. Update user role
      await updateDoc(doc(db, 'users', app.userUid), { role: 'contestant' });

      // 3. Create contestant entry
      await addDoc(collection(db, 'contestants'), {
        name: app.fullName,
        category: app.category,
        bio: app.bio,
        image: `https://ui-avatars.com/api/?name=${app.fullName}&background=random`,
        votes: 0,
        competitionId: 'general',
        createdAt: new Date().toISOString()
      });

      alert("Application approved and contestant created!");
    } catch (err) {
      console.error("Error approving application:", err);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'contestantApplications', appId), { status: 'rejected' });
    } catch (err) {
      console.error("Error rejecting application:", err);
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
      setQuestionFormData({ question: '', type: 'text', options: '', order: questions.length });
    } catch (err) {
      console.error("Error saving question:", err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteDoc(doc(db, 'applicationQuestions', id));
      } catch (err) {
        console.error("Error deleting question:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'contestants', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'contestants'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        setIsAdding(false);
      }
      setFormData({
        name: '',
        category: 'musician',
        bio: '',
        image: '',
        votes: 0,
        competitionId: 'general'
      });
    } catch (err) {
      console.error("Error saving contestant:", err);
      alert("Error saving contestant. Check console for details.");
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
      competitionId: contestant.competitionId || 'general'
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this contestant?")) {
      try {
        await deleteDoc(doc(db, 'contestants', id));
      } catch (err) {
        console.error("Error deleting contestant:", err);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-orange mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Admin Portal</span>
            </div>
            <h1 className="text-4xl font-bold">Platform Management</h1>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => setActiveTab('contestants')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center ${activeTab === 'contestants' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-brand-black'}`}
            >
              <Trophy className="w-4 h-4 mr-2" /> Contestants
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center ${activeTab === 'users' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-brand-black'}`}
            >
              <Users className="w-4 h-4 mr-2" /> Users & Roles
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center ${activeTab === 'applications' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-brand-black'}`}
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
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center ${activeTab === 'questions' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-brand-black'}`}
            >
              <HelpCircle className="w-4 h-4 mr-2" /> Questions
            </button>
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
                        <option value="kalenjin-crown-2026">Kalenjin Crown Awards 2026</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Initial Votes</label>
                      <input 
                        type="number" 
                        value={formData.votes}
                        onChange={(e) => setFormData({...formData, votes: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image URL</label>
                      <input 
                        type="url" 
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="https://..."
                      />
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
                            <img src={c.image} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            c.competitionId === 'kalenjin-crown-2026' 
                              ? 'bg-brand-orange/10 text-brand-orange' 
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {c.competitionId === 'kalenjin-crown-2026' ? 'Kalenjin Crown' : 'General'}
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
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">User</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Role</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider">Verification</th>
                    <th className="px-8 py-6 font-bold text-sm uppercase tracking-wider text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full border border-gray-100" />
                          <div>
                            <p className="font-bold">{u.displayName}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={u.role || 'fan'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-orange"
                        >
                          <option value="fan">Fan</option>
                          <option value="contestant">Contestant</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </select>
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
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </div>
    </div>
  );
}
