/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { FounderDashboard } from './components/FounderDashboard';
import { AuthPage } from './components/AuthPage';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type AppRole = 'landing' | 'bride' | 'provider' | 'founder';

export default function App() {
  const [role, setRole] = useState<AppRole>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Safely attempt to patch window.fetch with a try-catch block to prevent runtime crashes
    const originalFetch = window.fetch;
    let restoreFetch = () => {};
    
    try {
      const patchedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const currentUserId = localStorage.getItem('active_user_uid');
        if (currentUserId && typeof input === 'string' && input.startsWith('/api/')) {
          init = init || {};
          const headers = new Headers(init.headers || {});
          if (!headers.has('x-user-id')) {
            headers.append('x-user-id', currentUserId);
          }
          init.headers = headers;
        }
        return originalFetch(input, init);
      };

      // If fetch is writable, assign it. Otherwise, use Object.defineProperty
      const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
      if (descriptor && (descriptor.writable || descriptor.set)) {
        window.fetch = patchedFetch;
        restoreFetch = () => {
          window.fetch = originalFetch;
        };
      } else {
        Object.defineProperty(window, 'fetch', {
          value: patchedFetch,
          configurable: true,
          writable: true
        });
        restoreFetch = () => {
          try {
            Object.defineProperty(window, 'fetch', {
              value: originalFetch,
              configurable: true,
              writable: true
            });
          } catch (e) {
            console.warn("Could not restore original fetch:", e);
          }
        };
      }
    } catch (e) {
      console.warn("Could not intercept window.fetch securely. Falling back to cookies:", e);
    }

    const setAuthCookie = (uid: string | null) => {
      if (uid) {
        document.cookie = `active_user_uid=${encodeURIComponent(uid)}; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        document.cookie = "active_user_uid=; path=/; max-age=0; SameSite=Lax";
      }
    };
    
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('active_user_uid', user.uid);
        setAuthCookie(user.uid);
        
        // Fetch user profile from firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role || 'bride';
            setRole(userRole);
            if (userRole === 'provider') {
              localStorage.setItem('active_provider_id', user.uid);
            }
          } else {
            // Fallbacks
            if (user.email === 'elena@bridaltrust.io') {
              setRole('founder');
            } else if (user.email?.includes('moretti') || user.email?.includes('prov')) {
              setRole('provider');
              localStorage.setItem('active_provider_id', 'prov_sophia');
            } else {
              setRole('bride');
            }
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setRole('bride');
        }
        setShowAuth(false);
      } else {
        setCurrentUser(null);
        localStorage.removeItem('active_user_uid');
        setAuthCookie(null);
        setRole('landing');
      }
    });

    return () => {
      unsubscribe();
      restoreFetch();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('active_user_uid');
      localStorage.removeItem('active_provider_id');
      document.cookie = "active_user_uid=; path=/; max-age=0; SameSite=Lax";
      setRole('landing');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleAuthSuccess = (user: any, userRole: AppRole) => {
    setCurrentUser(user);
    localStorage.setItem('active_user_uid', user.uid);
    document.cookie = `active_user_uid=${encodeURIComponent(user.uid)}; path=/; max-age=31536000; SameSite=Lax`;
    setRole(userRole);
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen bg-brand-ivory">
      {role === 'landing' && (
        <LandingPage 
          onEnterApp={(selectedRole) => setRole(selectedRole)} 
          onOpenAuth={() => setShowAuth(true)}
        />
      )}
      {role === 'bride' && (
        <CustomerDashboard onBackToLanding={handleSignOut} />
      )}
      {role === 'provider' && (
        <ProviderDashboard onBackToLanding={handleSignOut} />
      )}
      {role === 'founder' && (
        <FounderDashboard onBackToLanding={handleSignOut} />
      )}

      {showAuth && (
        <AuthPage 
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}
