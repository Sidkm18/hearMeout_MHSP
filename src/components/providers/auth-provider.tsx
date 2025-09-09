'use client';

import type { User, UserRole } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Logo } from '../logo';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, role: UserRole, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          const userPath = `/${userData.role.toLowerCase()}`;
          if (pathname !== userPath) {
            router.push(userPath);
          }
        } else {
          // If user exists in Auth but not Firestore, log them out.
          await signOut(auth);
          setUser(null);
          router.push('/');
        }
      } else {
        setUser(null);
         if (pathname !== '/') {
            router.push('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signIn = async (email: string, pass: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle the redirect
    } catch (e: any) {
      setError(e.message);
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };
  
  const signUp = async (email: string, pass: string, role: UserRole, name: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        name,
        email: firebaseUser.email!,
        role,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      // onAuthStateChanged will set the user and redirect
    } catch (e: any) {
      setError(e.message);
      console.error(e);
    } finally {
        setAuthLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (e: any) {
      setError(e.message);
      console.error(e);
    } finally {
        setLoading(false);
    }
  };
  
  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <Logo />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, error, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
