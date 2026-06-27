import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Lock, User, Calendar, DollarSign, MapPin, 
  Briefcase, ArrowRight, Sparkles, ShieldCheck, Loader, Star
} from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthPageProps {
  onAuthSuccess: (user: any, role: 'bride' | 'provider' | 'founder') => void;
  onClose: () => void;
}

export function AuthPage({ onAuthSuccess, onClose }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'bride' | 'provider'>('bride');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bride specific fields
  const [weddingDate, setWeddingDate] = useState('2026-10-17');
  const [budget, setBudget] = useState('2500');
  const [location, setLocation] = useState('New York Metro');
  const [style, setStyle] = useState('Classic');

  // Provider specific fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Makeup');
  const [basePrice, setBasePrice] = useState('1000');
  const [about, setAbout] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Prepare Profile State
        const profileData: any = {
          id: user.uid,
          name,
          email,
          role,
          createdAt: new Date().toISOString()
        };

        if (role === 'bride') {
          profileData.weddingDate = weddingDate;
          profileData.budget = Number(budget);
          profileData.location = location;
          profileData.preferences = {
            style,
            skinType: 'Combination',
            hairType: 'Wavy',
            servicesNeeded: ['Makeup', 'Hair Styling']
          };

          // Update backend as well for compatibility / matching logic sync
          await fetch('/api/profile', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': user.uid 
            },
            body: JSON.stringify({
              name,
              weddingDate,
              budget: Number(budget),
              location,
              preferences: profileData.preferences
            })
          });
        } else {
          // Provider: Register provider profile
          const res = await fetch('/api/providers/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.uid,
              name,
              businessName: businessName || `${name} Bridal Styling`,
              category,
              basePrice: Number(basePrice),
              about,
              location
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.provider) {
              localStorage.setItem('active_provider_id', data.provider.id);
            }
          }
        }

        // 3. Write profile to Firestore
        await setDoc(doc(db, 'users', user.uid), profileData);

        onAuthSuccess(user, role);
      } else {
        // Log in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch profile from firestore or local backend fallback
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        let userRole: 'bride' | 'provider' | 'founder' = 'bride';
        if (docSnap.exists()) {
          userRole = docSnap.data().role || 'bride';
        } else {
          // Fallback based on email domains or query
          if (email.includes('founder') || email === 'elena@bridaltrust.io') {
            userRole = 'founder';
          } else if (email.includes('moretti') || email.includes('prov')) {
            userRole = 'provider';
          }
        }

        if (userRole === 'provider') {
          localStorage.setItem('active_provider_id', user.uid);
        }

        onAuthSuccess(user, userRole);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Lazy-onboards and logs in the demo accounts
  const handleDemoLogin = async (demoType: 'bride' | 'provider' | 'founder') => {
    setError('');
    setLoading(true);
    let demoEmail = '';
    let demoName = '';
    let password = 'password123';

    if (demoType === 'bride') {
      demoEmail = 'sarah.jenkins@example.com';
      demoName = 'Sarah Jenkins';
    } else if (demoType === 'provider') {
      demoEmail = 'sophia@morettibeauty.com';
      demoName = 'Sophia Moretti';
    } else {
      demoEmail = 'elena@bridaltrust.io';
      demoName = 'Elena Vance';
    }

    try {
      let user;
      try {
        // Try logging in
        const userCredential = await signInWithEmailAndPassword(auth, demoEmail, password);
        user = userCredential.user;
      } catch (loginErr) {
        // If account doesn't exist, lazily register it
        const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, password);
        user = userCredential.user;

        const roleMapping = { bride: 'bride', provider: 'provider', founder: 'founder' };
        const assignedRole = roleMapping[demoType] as 'bride' | 'provider' | 'founder';

        // Write default initial profile to firestore
        const profileData: any = {
          id: user.uid,
          name: demoName,
          email: demoEmail,
          role: assignedRole,
          createdAt: new Date().toISOString()
        };

        if (assignedRole === 'bride') {
          profileData.weddingDate = '2026-10-17';
          profileData.budget = 2500;
          profileData.location = 'New York Metro';
          profileData.preferences = {
            style: 'Classic',
            skinType: 'Combination',
            hairType: 'Wavy',
            servicesNeeded: ['Makeup', 'Hair Styling']
          };
        }

        await setDoc(doc(db, 'users', user.uid), profileData);
      }

      const finalRole = demoType;
      if (finalRole === 'provider') {
        // Sophia's profile uses prov_sophia on the preloaded dataset, let's tie them
        localStorage.setItem('active_provider_id', 'prov_sophia');
      }

      onAuthSuccess(user, finalRole);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load demo session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl border border-brand-border/20 shadow-2xl overflow-hidden text-brand-charcoal"
      >
        {/* Banner */}
        <div className="bg-brand-dark px-6 py-4 flex items-center justify-between border-b border-brand-border/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand-gold flex items-center justify-center text-brand-dark font-bold text-xs">BT</div>
            <span className="text-sm font-medium text-brand-ivory font-serif">BridalTrust Security Portal</span>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-muted hover:text-brand-ivory text-xs font-semibold px-2 py-1 rounded hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-serif text-brand-dark leading-tight">
              {isSignUp ? 'Create your Account' : 'Welcome to BridalTrust'}
            </h2>
            <p className="text-xs text-brand-muted">
              {isSignUp ? 'Join the network and secure your wedding day style' : 'Sign in using your secure credential'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-3">
                {/* Role Toggle */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block mb-1.5">Are you a Bride or Beauty Partner?</label>
                  <div className="grid grid-cols-2 gap-2 bg-brand-panel p-1 rounded-lg border border-brand-border">
                    <button
                      type="button"
                      onClick={() => setRole('bride')}
                      className={`py-2 text-xs font-semibold rounded-md transition-all ${
                        role === 'bride' 
                          ? 'bg-brand-gold text-brand-ivory shadow-xs' 
                          : 'text-brand-muted hover:text-brand-dark'
                      }`}
                    >
                      💍 Bride / Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('provider')}
                      className={`py-2 text-xs font-semibold rounded-md transition-all ${
                        role === 'provider' 
                          ? 'bg-brand-gold text-brand-ivory shadow-xs' 
                          : 'text-brand-muted hover:text-brand-dark'
                      }`}
                    >
                      💄 Beauty Partner
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-brand-panel text-xs pl-9 pr-3.5 py-3 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-brand-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-brand-panel text-xs pl-9 pr-3.5 py-3 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-panel text-xs pl-9 pr-3.5 py-3 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Conditional Sign Up Fields */}
            {isSignUp && role === 'bride' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Wedding Date</label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={e => setWeddingDate(e.target.value)}
                    className="w-full bg-brand-panel text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Budget (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full bg-brand-panel text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            )}

            {isSignUp && role === 'provider' && (
              <div className="space-y-3 pt-2 border-t border-brand-border/10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Moretti Luxury Makeup"
                      className="w-full bg-brand-panel text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-brand-panel text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    >
                      <option value="Makeup">Makeup Artist</option>
                      <option value="Hair">Hair Stylist</option>
                      <option value="Stylist">Couture Stylist</option>
                      <option value="All-in-One">All-In-One Studio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Base Package Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={basePrice}
                      onChange={e => setBasePrice(e.target.value)}
                      className="w-full bg-brand-panel text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Service Location</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. New York Metro"
                      className="w-full bg-brand-panel text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Brief bio / design aesthetic</label>
                  <textarea
                    required
                    rows={2}
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    placeholder="Describe your signature bridal styling bio..."
                    className="w-full bg-brand-panel text-xs p-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-charcoal hover:bg-brand-dark text-brand-ivory font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-brand-charcoal"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> {isSignUp ? 'Registering...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? 'Complete Registration' : 'Secure Log In'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle login vs signup */}
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-brand-gold hover:underline font-medium"
            >
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Demo users fast entry */}
          <div className="pt-4 border-t border-brand-border/10 space-y-2.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block text-center">
              Frictionless testing &bull; Preloaded Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('bride')}
                className="py-2 px-1 text-[11px] font-medium bg-brand-panel hover:bg-brand-border border border-brand-border rounded text-brand-dark flex flex-col items-center justify-center gap-1 transition-all"
              >
                <span>👰 Bride</span>
                <span className="text-[9px] text-brand-muted">Sarah Jenkins</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('provider')}
                className="py-2 px-1 text-[11px] font-medium bg-brand-panel hover:bg-brand-border border border-brand-border rounded text-brand-dark flex flex-col items-center justify-center gap-1 transition-all"
              >
                <span>💄 Provider</span>
                <span className="text-[9px] text-brand-muted">Sophia Moretti</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('founder')}
                className="py-2 px-1 text-[11px] font-medium bg-brand-panel hover:bg-brand-border border border-brand-border rounded text-brand-dark flex flex-col items-center justify-center gap-1 transition-all"
              >
                <span>👑 Founder</span>
                <span className="text-[9px] text-brand-muted">Elena Vance</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
