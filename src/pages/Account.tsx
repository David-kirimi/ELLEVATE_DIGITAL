import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Coins, Award, LogOut, Settings, ChevronRight, Trophy, Clock, CheckCircle, XCircle, LayoutDashboard } from 'lucide-react';
import { auth, db, logout } from '../firebase';
import { doc, onSnapshot, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Account() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Listen to user profile
        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data());
          }
          setLoading(false);
        });

        // Fetch recent votes
        const fetchVotes = async () => {
          const q = query(
            collection(db, 'votes'),
            where('fanUid', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const snapshot = await getDocs(q);
          setVotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        // Fetch recent purchases
        const fetchPurchases = async () => {
          const q = query(
            collection(db, 'purchases'),
            where('userUid', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const snapshot = await getDocs(q);
          setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchVotes();
        fetchPurchases();

        // Fetch application status
        const fetchApp = async () => {
          const q = query(
            collection(db, 'contestantApplications'),
            where('userUid', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setApplication(snapshot.docs[0].data());
          }
        };
        fetchApp();

        return () => unsubProfile();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!auth.currentUser) return <div className="min-h-screen flex items-center justify-center">Please sign in to view your account.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 text-center"
            >
              <div className="relative inline-block mb-6">
                <img 
                  src={auth.currentUser.photoURL || ''} 
                  alt={auth.currentUser.displayName || ''} 
                  className="w-32 h-32 rounded-full border-4 border-brand-orange/20 p-1"
                />
                <div className="absolute bottom-0 right-0 bg-brand-orange text-white p-2 rounded-full shadow-lg">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{auth.currentUser.displayName}</h1>
              <p className="text-gray-500 text-sm mb-6 flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" /> {auth.currentUser.email}
              </p>
              
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600 mb-8">
                Role: {userProfile?.role || 'Fan'}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-6 rounded-3xl">
                  <Coins className="w-6 h-6 text-brand-orange mx-auto mb-2" />
                  <p className="text-2xl font-bold text-brand-orange">{userProfile?.points || 0}</p>
                  <p className="text-[10px] font-bold uppercase text-brand-orange/60">Points</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl">
                  <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{votes.length}</p>
                  <p className="text-[10px] font-bold uppercase text-blue-600/60">Votes Cast</p>
                </div>
              </div>
            </motion.div>

            <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 space-y-2">
              {userProfile?.role === 'contestant' && (
                <Link 
                  to="/contestant-dashboard"
                  className="w-full flex items-center justify-between p-4 bg-brand-orange text-white rounded-2xl transition-all group mb-2 shadow-lg shadow-brand-orange/20"
                >
                  <div className="flex items-center">
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    <span className="font-bold">Contestant Dashboard</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50" />
                </Link>
              )}

              {userProfile?.role === 'fan' && !application && (
                <Link 
                  to="/apply"
                  className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all group mb-2"
                >
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 mr-3 text-brand-orange" />
                    <span className="font-bold text-brand-orange">Become a Contestant</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-orange/50" />
                </Link>
              )}

              {application && userProfile?.role === 'fan' && (
                <div className="w-full p-4 bg-gray-50 rounded-2xl mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Application Status</span>
                    {application.status === 'pending' ? (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    ) : application.status === 'approved' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm font-bold capitalize ${
                    application.status === 'pending' ? 'text-yellow-600' :
                    application.status === 'approved' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {application.status}
                  </p>
                </div>
              )}

              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-brand-orange" />
                  <span className="font-bold text-gray-700">Account Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-all group"
              >
                <div className="flex items-center">
                  <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-500" />
                  <span className="font-bold text-gray-700">Sign Out</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <Award className="w-6 h-6 mr-3 text-brand-orange" />
                Recent Voting History
              </h2>
              
              {votes.length > 0 ? (
                <div className="space-y-4">
                  {votes.map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                      <div>
                        <p className="font-bold">Voted for Contestant ID: {vote.contestantId}</p>
                        <p className="text-xs text-gray-500">{new Date(vote.timestamp?.toDate()).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-orange">-{vote.pointsSpent} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No votes cast yet.</p>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <Coins className="w-6 h-6 mr-3 text-brand-orange" />
                Recent Purchases
              </h2>
              
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                      <div>
                        <p className="font-bold">Course Purchase</p>
                        <p className="text-xs text-gray-500">{new Date(purchase.timestamp?.toDate()).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500">-{purchase.amountPaid} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No purchases yet.</p>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
