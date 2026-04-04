import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  userProfile: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  userProfile: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log("AuthContext: Auth state changed. User:", currentUser?.email);
      
      // Clean up previous user listener
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubUser = onSnapshot(userDocRef, 
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setUserProfile(data);
              const adminStatus = data.role === 'admin' || 
                                 currentUser.email === 'muriiradavie@gmail.com' || 
                                 currentUser.email === 'superadmin@eliax.com';
              console.log("AuthContext: User profile loaded. Admin status:", adminStatus);
              setIsAdmin(adminStatus);
            } else {
              console.log("AuthContext: User profile does not exist yet.");
              setUserProfile(null);
              const adminStatus = currentUser.email === 'muriiradavie@gmail.com' || 
                                 currentUser.email === 'superadmin@eliax.com';
              setIsAdmin(adminStatus);
            }
            setLoading(false);
          },
          (error) => {
            console.error("AuthContext: Error listening to user profile:", error);
            // On error, we still want to stop loading
            // and fallback to email check for admin status
            const adminStatus = currentUser.email === 'muriiradavie@gmail.com' || 
                               currentUser.email === 'superadmin@eliax.com';
            setIsAdmin(adminStatus);
            setLoading(false);
          }
        );
      } else {
        console.log("AuthContext: No user logged in.");
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Safety timeout
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000); // Increased to 8s for unstable connections

    return () => {
      unsubscribeAuth();
      if (unsubUser) unsubUser();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
