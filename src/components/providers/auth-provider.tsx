'use client';

import type { User, UserRole } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Logo } from '../logo';

export interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirect = useCallback((user: User | null) => {
    if (user) {
      const userPath = `/${user.role.toLowerCase()}`;
      if (pathname === '/' || !pathname.startsWith(userPath)) {
        router.push(userPath);
      }
    } else if (pathname !== '/') {
      router.push('/');
    }
  }, [pathname, router]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('inner-space-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        if (pathname === '/') {
           router.push(`/${parsedUser.role.toLowerCase()}`);
        }
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('inner-space-user');
    }
    setLoading(false);
  }, [pathname, router]);
  
  const login = (role: UserRole) => {
    const mockUser: User = {
      name: role === 'Counsellor' ? 'Dr. Evelyn Reed' : role,
      email: `${role.toLowerCase()}@example.com`,
      role: role,
    };
    localStorage.setItem('inner-space-user', JSON.stringify(mockUser));
    setUser(mockUser);
    router.push(`/${role.toLowerCase()}`);
  };

  const logout = () => {
    localStorage.removeItem('inner-space-user');
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <Logo />
        <p className="mt-4 text-primary-foreground/80">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
