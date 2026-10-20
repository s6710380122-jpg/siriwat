import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

const BOOTSTRAP_ADMIN_EMAIL = 's6710380122@pkru.ac.th';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  isGuest: boolean;
  isSuspended: boolean;
  loading: boolean;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<{ needVerification: boolean }>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or bootstrap
  const syncOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const isBootstrap = firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If bootstrapped admin and not yet marked admin, elevate
        if (isBootstrap && data.role !== 'admin') {
          const updated: UserProfile = { ...data, role: 'admin' };
          await setDoc(userDocRef, updated, { merge: true });
          // Also guarantee admin doc
          await setDoc(doc(db, 'admins', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'admin',
            createdAt: new Date().toISOString(),
          }, { merge: true });
          return updated;
        }
        return data;
      } else {
        // Create initial profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'ผู้ใช้งาน',
          photoURL: firebaseUser.photoURL || '',
          role: isBootstrap ? 'admin' : 'member',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);

        if (isBootstrap) {
          await setDoc(doc(db, 'admins', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'admin',
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
        return newProfile;
      }
    } catch (err) {
      console.warn('Could not sync user profile in Firestore:', err);
      // Fallback local representation
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'ผู้ใช้งาน',
        role: isBootstrap ? 'admin' : 'member',
        status: 'active',
      };
    }
  };

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const initialProf = await syncOrCreateProfile(currentUser);
          setProfile(initialProf);

          // Realtime listener for profile updates (e.g. role change or suspension by admin)
          const userDocRef = doc(db, 'users', currentUser.uid);
          unsubscribeDoc = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
              }
            },
            (error) => {
              console.error('Error listening to user profile:', error);
            }
          );
        } catch (error) {
          console.error('Profile initialization error:', error);
        }
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: name.trim() });
    
    // Send email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Failed to send verification email:', e);
    }

    const newProf = await syncOrCreateProfile(cred.user);
    setProfile(newProf);
    return { needVerification: !cred.user.emailVerified };
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const p = await syncOrCreateProfile(cred.user);
    setProfile(p);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const p = await syncOrCreateProfile(cred.user);
    setProfile(p);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const sendResetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      const p = await syncOrCreateProfile(auth.currentUser);
      setProfile(p);
    }
  };

  const isBootstrap = user?.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const currentRole: UserRole = profile?.role || (isBootstrap ? 'admin' : user ? 'member' : 'guest');
  const isSuspended = profile?.status === 'suspended';
  const isAdmin = currentRole === 'admin' || isBootstrap;
  const isModerator = isAdmin || currentRole === 'moderator';
  const isMember = isModerator || currentRole === 'member';
  const isGuest = !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: currentRole,
        isAdmin,
        isModerator,
        isMember,
        isGuest,
        isSuspended,
        loading,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        sendResetPassword,
        resendVerificationEmail,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
