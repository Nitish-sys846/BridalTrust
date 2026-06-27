/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, IndianRupee, MapPin, Heart, Sparkles, MessageCircle, 
  ListTodo, Grid, Search, SlidersHorizontal, ArrowRight, ShieldCheck, 
  X, Check, AlertCircle, Plus, Trash2, Send, Loader2, RefreshCw, Star, ArrowLeft
} from 'lucide-react';
import { BeautyProvider, Booking, Review, InspirationItem, PlannerTask, UserProfile, UserRole } from '../types';
import { TrustScoreBadge, CompatibilityBreakdown } from './IntelligenceCenter';

interface CustomerDashboardProps {
  onBackToLanding: () => void;
}

export function CustomerDashboard({ onBackToLanding }: CustomerDashboardProps) {
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [providers, setProviders] = useState<BeautyProvider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedProviderIds, setSavedProviderIds] = useState<string[]>([]);
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  
  // UI Controls
  const [activeTab, setActiveTab] = useState<'catalog' | 'bookings' | 'checklist' | 'moodboard' | 'assistant'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProvider, setSelectedProvider] = useState<BeautyProvider | null>(null);

  // Quote estimator states
  const [quoteEventType, setQuoteEventType] = useState('main_wedding');
  const [quotePartySize, setQuotePartySize] = useState(1);
  const [quoteHasSkincareAddon, setQuoteHasSkincareAddon] = useState(false);
  const [estimatedQuoteRange, setEstimatedQuoteRange] = useState('');

  // Comparison states
  const [comparedProviderIds, setComparedProviderIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  // Forms
  const [bookingDate, setBookingDate] = useState('2026-10-17');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [newInspTitle, setNewInspTitle] = useState('');
  const [newInspUrl, setNewInspUrl] = useState('');
  const [newInspCategory, setNewInspCategory] = useState('Makeup');
  const [newInspNotes, setNewInspNotes] = useState('');
  const [isAddingInsp, setIsAddingInsp] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Skincare' | 'Trial' | 'Booking' | 'General'>('General');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-08-01');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Profile Form States
  const [editName, setEditName] = useState('');
  const [editWeddingDate, setEditWeddingDate] = useState('');
  const [editBudget, setEditBudget] = useState(2500);
  const [editLocation, setEditLocation] = useState('');
  const [editStyle, setEditStyle] = useState('Classic');
  const [editSkin, setEditSkin] = useState('Combination');
  const [editHair, setEditHair] = useState('Wavy');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // AI Assistant Chat States
  const [assistantMessage, setAssistantMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch full dataset
  const fetchAllData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      
      const brideUser = data.users.find((u: any) => u.id === 'bride_demo');
      setProfile(brideUser);

      // Pre-populate editing fields
      if (brideUser) {
        setEditName(brideUser.name);
        setEditWeddingDate(brideUser.weddingDate || '');
        setEditBudget(brideUser.budget || 2500);
        setEditLocation(brideUser.location || 'New York Metro');
        setEditStyle(brideUser.preferences?.style || 'Classic');
        setEditSkin(brideUser.preferences?.skinType || 'Combination');
        setEditHair(brideUser.preferences?.hairType || 'Wavy');
      }

      setBookings(data.bookings);
      setReviews(data.reviews);
      setInspirations(data.inspirations);
      setTasks(data.plannerTasks);
      setSavedProviderIds(data.savedProviders.map((sp: any) => sp.providerId));

      // Fetch computed providers list
      const provRes = await fetch('/api/providers');
      const provData = await provRes.json();
      setProviders(provData);
    } catch (e) {
      console.error('Failed to load application dataset:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatLoading]);

  // Calculations
  const calculateDaysRemaining = () => {
    if (!profile?.weddingDate) return 0;
    const wedding = new Date(profile.weddingDate);
    const today = new Date();
    const diff = wedding.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const calculateBudgetStats = () => {
    const totalBudget = profile?.budget || 2500;
    const spentOnBookings = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0);
    const percentage = Math.min(100, Math.round((spentOnBookings / totalBudget) * 100));
    return { totalBudget, spentOnBookings, percentage, remaining: Math.max(0, totalBudget - spentOnBookings) };
  };

  const calculateEstimatedQuote = () => {
    let base = 600;
    if (quoteEventType === 'main_wedding') base = 1200;
    else if (quoteEventType === 'reception') base = 800;
    else if (quoteEventType === 'sangeet_mehendi') base = 650;
    else if (quoteEventType === 'pre_wedding') base = 400;

    let multiplier = 1;
    if (quotePartySize > 1) {
      multiplier += (quotePartySize - 1) * 0.45;
    }

    let addon = quoteHasSkincareAddon ? 1500 : 0;
    const totalEst = Math.round(base * multiplier + addon);
    const low = Math.round(totalEst * 0.9);
    const high = Math.round(totalEst * 1.1);
    setEstimatedQuoteRange(`₹${low} – ₹${high}`);
  };

  const getWeddingReadinessScore = () => {
    let score = 20; // base score
    if (bookings.length > 0) score += 30;
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const totalTasksCount = tasks.length;
    if (totalTasksCount > 0) {
      score += Math.min(30, Math.round((completedTasksCount / totalTasksCount) * 30));
    }
    if (inspirations.length > 0) score += 20;
    return Math.min(100, score);
  };

  const getSmartRecommendation = () => {
    if (providers.length === 0) return null;
    const budgetCeiling = profile?.budget || 2500;
    const matches = providers.filter(p => p.basePrice <= budgetCeiling);
    if (matches.length > 0) {
      return matches.sort((a, b) => b.trustScore.score - a.trustScore.score)[0];
    }
    return providers.sort((a, b) => b.trustScore.score - a.trustScore.score)[0];
  };

  // handlers
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          weddingDate: editWeddingDate,
          budget: Number(editBudget),
          location: editLocation,
          preferences: {
            style: editStyle,
            skinType: editSkin,
            hairType: editHair,
            servicesNeeded: profile?.preferences?.servicesNeeded || ['Makeup', 'Hair Styling']
          }
        })
      });
      if (res.ok) {
        setIsEditingProfile(false);
        fetchAllData(); // Refresh provider matching lists too!
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSave = async (providerId: string) => {
    try {
      const res = await fetch('/api/saved-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !selectedServiceId) return;

    const selectedService = selectedProvider.services.find(s => s.id === selectedServiceId);
    if (!selectedService) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          date: `${bookingDate}T${bookingTime}:00Z`,
          serviceName: selectedService.name,
          price: selectedService.price,
          notes: bookingNotes
        })
      });

      if (res.ok) {
        setSelectedProvider(null);
        setSelectedServiceId('');
        setBookingNotes('');
        setActiveTab('bookings');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will activate the BridalTrust automated standby Emergency Backup System to secure you.')) return;
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !newReviewContent.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          content: newReviewContent,
          rating: newReviewRating
        })
      });

      if (res.ok) {
        setNewReviewContent('');
        setNewReviewRating(5);
        // Refresh details
        const data = await res.json();
        const updatedProvider = data.provider;
        
        // Refresh full screen lists
        fetchAllData();
        
        // Update popup provider context
        setSelectedProvider(prev => prev ? { 
          ...prev, 
          rating: updatedProvider.rating,
          reviewCount: updatedProvider.reviewCount
        } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddInspiration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspTitle || !newInspUrl) return;

    try {
      const res = await fetch('/api/inspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newInspTitle,
          imageUrl: newInspUrl,
          category: newInspCategory,
          notes: newInspNotes,
          tags: [newInspCategory, 'Mood']
        })
      });

      if (res.ok) {
        setNewInspTitle('');
        setNewInspUrl('');
        setNewInspNotes('');
        setIsAddingInsp(false);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInspiration = async (id: string) => {
    try {
      const res = await fetch(`/api/inspirations/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    try {
      const res = await fetch('/api/planner-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          dueDate: newTaskDueDate,
          category: newTaskCategory
        })
      });

      if (res.ok) {
        setNewTaskTitle('');
        setIsAddingTask(false);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const res = await fetch(`/api/planner-tasks/${id}/toggle`, { method: 'POST' });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/planner-tasks/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // AI assistant messaging
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantMessage.trim()) return;

    const userMsg = assistantMessage;
    setAssistantMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: chatHistory
        })
      });

      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Filtering catalog
  const filteredCatalog = providers.filter(p => {
    const matchesSearch = p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.about.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = false;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else {
      const catLower = p.category?.toLowerCase() || '';
      const selLower = selectedCategory.toLowerCase();
      
      if (catLower === selLower) {
        matchesCategory = true;
      } else if (selLower === 'makeup_artist' && (catLower === 'makeup' || catLower === 'makeup_artist')) {
        matchesCategory = true;
      } else if (selLower === 'hair_stylist' && (catLower === 'hair' || catLower === 'hair_stylist')) {
        matchesCategory = true;
      } else if (selLower === 'bridal_studio' && (catLower === 'all-in-one' || catLower === 'bridal_studio')) {
        matchesCategory = true;
      }
    }
    return matchesSearch && matchesCategory;
  });

  const budgetStats = calculateBudgetStats();

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal font-sans selection:bg-brand-gold/20 selection:text-brand-dark">
      
      {/* Dynamic Header */}
      <header className="bg-brand-ivory/90 border-b border-brand-border px-6 py-4 sticky top-0 z-20 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-charcoal flex items-center justify-center text-brand-ivory font-bold text-sm shadow cursor-pointer" onClick={onBackToLanding}>
              BT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-serif font-medium text-brand-dark">Sarah’s Bridal Workspace</span>
                <span className="bg-brand-panel text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded border border-brand-border font-mono uppercase">Bride Mode</span>
              </div>
              <p className="text-xs text-brand-muted font-sans">Planning: {profile?.location || 'New York Metro'} • Classic Theme</p>
            </div>
          </div>

          {/* Core Widget Block */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Countdown */}
            <div className="bg-brand-panel border border-brand-border px-4 py-2 rounded-xl flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-brand-gold" />
              <div>
                <p className="text-brand-muted text-[9px] uppercase tracking-wider font-semibold leading-none">Wedding Countdown</p>
                <p className="font-serif font-bold text-brand-dark leading-tight pt-0.5">{calculateDaysRemaining()} Days Left</p>
              </div>
            </div>

            {/* Budget summary */}
            <div className="bg-brand-panel border border-brand-border px-4 py-2 rounded-xl flex items-center gap-2.5">
              <IndianRupee className="w-4 h-4 text-brand-gold" />
              <div>
                <p className="text-brand-muted text-[9px] uppercase tracking-wider font-semibold leading-none">Escrow Budget Status</p>
                <p className="font-serif font-bold text-brand-dark leading-tight pt-0.5">
                  ₹{budgetStats.spentOnBookings} / ₹{budgetStats.totalBudget} spent
                </p>
              </div>
            </div>

            <button 
              onClick={() => onBackToLanding()}
              className="px-4 py-2 rounded-lg text-brand-charcoal hover:text-brand-dark bg-brand-panel border border-brand-border hover:bg-brand-border transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Control panel */}
        <aside className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-brand-border shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-brand-dark uppercase tracking-widest font-mono">My Profile</h3>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-brand-gold hover:text-brand-dark transition-colors"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-brand-panel">
                  <span className="text-brand-muted">Bride Name</span>
                  <span className="font-medium text-brand-dark">{profile?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-panel">
                  <span className="text-brand-muted">Wedding Date</span>
                  <span className="font-medium text-brand-dark font-mono">{profile?.weddingDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-panel">
                  <span className="text-brand-muted">Est. Budget</span>
                  <span className="font-medium text-brand-dark font-mono">₹{profile?.budget}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-panel">
                  <span className="text-brand-muted">Location</span>
                  <span className="font-medium text-brand-dark">{profile?.location}</span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <p className="text-brand-muted font-mono text-[9px] uppercase tracking-wider font-semibold">Aesthetic Preferences</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-brand-panel text-brand-gold px-2.5 py-0.5 rounded text-[10px] font-semibold border border-brand-border">Style: {profile?.preferences?.style}</span>
                    <span className="bg-brand-panel text-brand-charcoal px-2.5 py-0.5 rounded text-[10px] font-semibold border border-brand-border">Skin: {profile?.preferences?.skinType}</span>
                    <span className="bg-brand-panel text-brand-charcoal px-2.5 py-0.5 rounded text-[10px] font-semibold border border-brand-border">Hair: {profile?.preferences?.hairType}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-brand-muted font-medium mb-1">Bride Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs bg-brand-panel focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-muted font-medium mb-1">Wedding Date</label>
                  <input 
                    type="date" 
                    value={editWeddingDate} 
                    onChange={e => setEditWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs font-mono bg-brand-panel focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-muted font-medium mb-1">Budget (₹)</label>
                  <input 
                    type="number" 
                    value={editBudget} 
                    onChange={e => setEditBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs font-mono bg-brand-panel focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-brand-muted font-medium mb-1">Preferred Style</label>
                  <select 
                    value={editStyle} 
                    onChange={e => setEditStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-xs bg-brand-panel focus:outline-none focus:border-brand-gold"
                  >
                    <option>Classic</option>
                    <option>Glamour</option>
                    <option>Bohemian</option>
                    <option>Natural</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-brand-muted font-medium mb-1">Skin Type</label>
                    <select value={editSkin} onChange={e => setEditSkin(e.target.value)} className="w-full p-2 border border-brand-border rounded text-xs bg-brand-panel focus:outline-none focus:border-brand-gold">
                      <option>Combination</option>
                      <option>Dry</option>
                      <option>Oily</option>
                      <option>Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-brand-muted font-medium mb-1">Hair Type</label>
                    <select value={editHair} onChange={e => setEditHair(e.target.value)} className="w-full p-2 border border-brand-border rounded text-xs bg-brand-panel focus:outline-none focus:border-brand-gold">
                      <option>Wavy</option>
                      <option>Straight</option>
                      <option>Curly</option>
                      <option>Coily</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-ivory font-bold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Recalculate Match Sync
                </button>
              </form>
            )}
          </div>

          {/* AI Helper banner link */}
          <div className="bg-brand-charcoal text-brand-ivory rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden border border-brand-border/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -mr-8 -mt-8 filter blur-lg" />
            <Sparkles className="w-5 h-5 text-brand-gold" />
            <div>
              <h4 className="font-serif font-medium text-sm text-brand-ivory">Need Style Inspiration?</h4>
              <p className="text-[11px] text-brand-muted leading-relaxed pt-1">
                Consult our context-aware AI Beauty Planner. Get personalized skin prep regimes and match with vetted artists instantly.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('assistant')}
              className="bg-brand-gold text-brand-ivory font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded hover:bg-brand-gold/90 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              Consult AI <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Wedding Readiness Score Widget */}
          <div className="bg-white rounded-xl p-5 border border-brand-border shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-brand-dark uppercase tracking-widest font-mono">Wedding Readiness</h3>
              <span className="font-mono text-xs font-bold text-brand-gold bg-brand-panel px-2 py-0.5 rounded border border-brand-border">{getWeddingReadinessScore()}%</span>
            </div>
            <div className="w-full bg-brand-panel h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-gold h-full rounded-full transition-all duration-500" 
                style={{ width: `${getWeddingReadinessScore()}%` }}
              />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed leading-normal">
              {getWeddingReadinessScore() >= 85 
                ? '✨ Excellent preparation! You have secured core styling packages and verified backup cover.' 
                : '💡 Tip: Secure an alternative standby-guaranteed Mehendi/Nail specialist to bolster your score by 15%.'}
            </p>
          </div>

          {/* Smart Recommendation Widget */}
          {getSmartRecommendation() && (() => {
            const rec = getSmartRecommendation();
            return rec ? (
              <div className="bg-brand-gold/5 border border-brand-gold/30 rounded-xl p-5 shadow-xs space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span className="text-[10px] text-brand-gold font-bold uppercase tracking-wider font-mono">Bespoke Perfect Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={rec.avatarUrl} alt={rec.name} className="w-10 h-10 rounded-full object-cover border border-brand-border" />
                  <div>
                    <h5 className="font-serif font-bold text-xs text-brand-dark leading-tight">{rec.businessName}</h5>
                    <p className="text-[10px] text-brand-muted capitalize">{rec.category?.replace('_', ' ')} Specialist</p>
                  </div>
                </div>
                <p className="text-[10px] text-brand-charcoal leading-relaxed leading-normal">Recommended based on style matching, a {rec.trustScore.score}% Trust rating, and compatibility indexes.</p>
                <button 
                  onClick={() => setSelectedProvider(rec)}
                  className="w-full py-1.5 bg-brand-gold text-brand-ivory text-[10px] uppercase font-bold tracking-wider rounded-lg hover:bg-brand-gold/90 transition-all cursor-pointer"
                >
                  Explore Match
                </button>
              </div>
            ) : null;
          })()}

          {/* Instant Bespoke Quote Generator Widget */}
          <div className="bg-white rounded-xl p-5 border border-brand-border shadow-xs space-y-3.5">
            <h3 className="font-bold text-xs text-brand-dark uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Quote Estimator
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-brand-muted uppercase font-semibold mb-1">Event Type</label>
                <select 
                  value={quoteEventType}
                  onChange={e => setQuoteEventType(e.target.value)}
                  className="w-full bg-brand-panel p-2 border border-brand-border rounded-lg text-xs"
                >
                  <option value="main_wedding">👑 Grand Royal Wedding</option>
                  <option value="reception">✨ Reception & Afterparty</option>
                  <option value="sangeet_mehendi">🎨 Sangeet Celebration</option>
                  <option value="pre_wedding">📸 Trial / Pre-Shoot</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-brand-muted uppercase font-semibold mb-1">Bridal Party Size</label>
                <input 
                  type="number"
                  min="1"
                  max="12"
                  value={quotePartySize}
                  onChange={e => setQuotePartySize(Number(e.target.value))}
                  className="w-full bg-brand-panel p-2 border border-brand-border rounded-lg text-xs font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input 
                  type="checkbox"
                  checked={quoteHasSkincareAddon}
                  onChange={e => setQuoteHasSkincareAddon(e.target.checked)}
                  className="rounded border-brand-border text-brand-gold focus:ring-brand-gold w-3.5 h-3.5"
                />
                <span className="text-[11px] text-brand-charcoal">90-day Skincare Addon</span>
              </label>

              <button
                onClick={calculateEstimatedQuote}
                className="w-full py-2 bg-brand-charcoal hover:bg-brand-dark text-brand-ivory font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all cursor-pointer"
              >
                Estimate Pricing
              </button>

              {estimatedQuoteRange && (
                <div className="bg-brand-panel p-3 rounded-lg border border-brand-border/60 text-center space-y-1 mt-2">
                  <p className="text-[10px] text-brand-muted uppercase font-semibold leading-none">Estimated Package</p>
                  <p className="font-serif font-bold text-brand-dark text-sm leading-normal">{estimatedQuoteRange}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Side: Primary interactive viewport */}
        <main className="md:col-span-9 space-y-6">

          {/* Emergency Backup Shield Active Notification */}
          {bookings.some(b => b.status === 'cancelled') && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 space-y-3 shadow-xs animate-pulse"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-red-500 text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-red-900 flex items-center gap-2">
                    🚨 Emergency Standby Shield Engaged
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed leading-normal">
                    One of your beauty service bookings was cancelled. BridalTrust has automatically activated the standby backup protocol to protect your wedding schedule.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-red-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop&q=80" 
                    alt="Backup Artist" 
                    className="w-10 h-10 rounded-full object-cover border border-red-100"
                  />
                  <div>
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider font-mono">Assigned Emergency Standby</p>
                    <p className="font-serif font-bold text-xs text-slate-800">Gia Kim (Radiant Bridal)</p>
                    <p className="text-[10px] text-slate-400">99% Trust Rating • Bonded Escrow Coverage</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('assistant')}
                    className="px-3.5 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Discuss replacement
                  </button>
                  <button 
                    onClick={() => {
                      alert('Secure emergency routing initiated to standby coordinator...');
                    }}
                    className="px-3.5 py-1.5 bg-red-600 text-white hover:bg-red-700 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Secure Call
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Dashboard internal tabs */}
          <div className="bg-white border border-brand-border p-1.5 rounded-xl flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-brand-panel text-brand-gold font-bold border border-brand-border' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <Search className="w-3.5 h-3.5" /> Artist Catalog
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-brand-panel text-brand-gold font-bold border border-brand-border' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> My Bookings
              {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                <span className="w-2 h-2 bg-brand-gold rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${activeTab === 'checklist' ? 'bg-brand-panel text-brand-gold font-bold border border-brand-border' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <ListTodo className="w-3.5 h-3.5" /> Skincare Countdown
            </button>
            <button
              onClick={() => setActiveTab('moodboard')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${activeTab === 'moodboard' ? 'bg-brand-panel text-brand-gold font-bold border border-brand-border' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <Grid className="w-3.5 h-3.5" /> Mood Board
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${activeTab === 'assistant' ? 'bg-brand-panel text-brand-gold font-bold border border-brand-border' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> AI Bridal Assistant
            </button>
          </div>

          {/* VIEWPORTS */}
          <AnimatePresence mode="wait">
            {activeTab === 'catalog' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="catalog"
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-brand-border shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 text-brand-muted w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search top-rated beauty artists (e.g. Sophia, curls, glass skin)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-brand-panel pl-9 pr-4 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { code: 'All', label: '✨ All Experts' },
                      { code: 'makeup_artist', label: '💄 Makeup Artist' },
                      { code: 'hair_stylist', label: '💇 Hair Stylist' },
                      { code: 'mehendi_artist', label: '🎨 Mehendi Artist' },
                      { code: 'nail_artist', label: '💅 Nail Artist' },
                      { code: 'salon', label: '🏢 Salon' },
                      { code: 'bridal_studio', label: '👑 Bridal Studio' },
                      { code: 'wedding_beauty_partner', label: '📸 Beauty Partner' }
                    ].map(cat => (
                      <button
                        key={cat.code}
                        onClick={() => setSelectedCategory(cat.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${selectedCategory === cat.code ? 'bg-brand-gold border-brand-gold text-brand-ivory font-bold shadow-xs' : 'bg-white border-brand-border text-brand-charcoal hover:bg-brand-panel'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Professionals Section */}
                {selectedCategory === 'All' && (
                  <div className="space-y-4 pt-1 pb-2">
                    <div className="flex items-center justify-between border-b border-brand-panel pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-gold" />
                        <h3 className="font-serif font-semibold text-xs text-brand-dark uppercase tracking-wider">Top Bridal Experts This Month</h3>
                      </div>
                      <span className="text-[9px] text-brand-muted uppercase font-mono font-bold bg-brand-panel px-2 py-0.5 rounded border border-brand-border">Featured partners</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {providers.filter(p => p.featured).map(p => (
                        <div 
                          key={`featured-${p.id}`}
                          className="bg-brand-panel border border-brand-gold/30 rounded-xl p-4 flex flex-col justify-between hover:border-brand-gold transition-all relative overflow-hidden group shadow-2xs"
                        >
                          <div className="absolute top-0 right-0 bg-brand-gold text-brand-ivory text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wider font-mono">
                            Featured
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={p.avatarUrl} 
                                alt={p.name} 
                                className="w-8 h-8 rounded-full object-cover border border-brand-border"
                              />
                              <div>
                                <h4 className="font-serif font-bold text-xs text-brand-dark group-hover:text-brand-gold transition-colors leading-tight">{p.businessName}</h4>
                                <p className="text-[10px] text-brand-muted capitalize">{p.category?.replace('_', ' ')}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-brand-muted">
                              <span className="bg-white border border-brand-border/60 px-1.5 py-0.5 rounded font-mono font-semibold text-brand-dark">₹{p.basePrice}</span>
                              <span className="bg-white border border-brand-border/60 px-1.5 py-0.5 rounded font-semibold text-brand-dark flex items-center gap-0.5"><Star className="w-2 h-2 text-brand-gold fill-brand-gold stroke-none" /> {p.rating}</span>
                              <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded font-bold font-mono">TS: {p.trustScore.score}%</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => setSelectedProvider(p)}
                            className="w-full mt-3 py-1.5 bg-white border border-brand-border hover:bg-brand-panel text-[9px] uppercase tracking-wider font-bold rounded text-brand-charcoal transition-colors cursor-pointer"
                          >
                            Explore Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredCatalog.map(p => (
                    <div 
                      key={p.id}
                      className="bg-white rounded-xl p-5 border border-brand-border shadow-2xs hover:shadow-sm hover:border-brand-gold/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header info */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover border border-brand-border"
                            />
                            <div>
                              <h4 className="font-serif font-medium text-sm text-brand-dark leading-tight">{p.businessName}</h4>
                              <p className="text-[11px] text-brand-muted leading-normal">{p.category} Specialist • {p.location}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-[10px] text-brand-muted cursor-pointer hover:text-brand-dark bg-brand-panel px-2 py-1 rounded border border-brand-border/60">
                              <input 
                                type="checkbox"
                                checked={comparedProviderIds.includes(p.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (comparedProviderIds.length >= 3) {
                                      alert("You can compare up to 3 artists side-by-side!");
                                      return;
                                    }
                                    setComparedProviderIds([...comparedProviderIds, p.id]);
                                  } else {
                                    setComparedProviderIds(comparedProviderIds.filter(id => id !== p.id));
                                  }
                                }}
                                className="rounded text-brand-gold border-brand-border focus:ring-brand-gold w-3 h-3"
                              />
                              <span>Compare</span>
                            </label>
                            
                            <button 
                              onClick={() => handleToggleSave(p.id)}
                              className="p-1.5 rounded hover:bg-brand-panel text-brand-gold"
                            >
                              <Heart className={`w-4 h-4 ${savedProviderIds.includes(p.id) ? 'fill-brand-gold' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-brand-panel text-brand-charcoal border border-brand-border text-[10px] font-semibold px-2 py-0.5 rounded">Base: ₹{p.basePrice}</span>
                          <span className="bg-brand-panel text-brand-gold border border-brand-border text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-brand-gold stroke-none" /> {p.rating} ({p.reviewCount} reviews)
                          </span>
                          {/* Trust score badge */}
                          <TrustScoreBadge metrics={p.trustScore} compact />

                          {/* Verified Badges and achievements */}
                          {p.verifiedStatus === 'premium' && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded">🥇 Premium</span>}
                          {p.verifiedStatus === 'verified' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">✅ Verified</span>}
                          {p.verifiedStatus === 'top_rated' && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">⭐ Top Rated</span>}

                          {p.badges?.slice(0, 1).map((badge, i) => (
                            <span key={i} className="bg-brand-panel border border-brand-border/60 text-brand-charcoal text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                              {badge}
                            </span>
                          ))}
                        </div>

                        {/* About snippet */}
                        <p className="text-xs text-brand-charcoal line-clamp-2 leading-relaxed mb-4">{p.about}</p>

                        {/* Compatibility engine display */}
                        {p.compatibilityScore && (
                          <div className="bg-brand-panel p-3 rounded border border-brand-border/60 flex items-center justify-between text-xs mb-4">
                            <span className="text-brand-charcoal flex items-center gap-1 font-semibold"><Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Compatibility Fit</span>
                            <span className="font-bold text-brand-gold font-mono">{p.compatibilityScore.overall}%</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedProvider(p)}
                        className="w-full py-2.5 bg-brand-gold text-brand-ivory rounded hover:bg-brand-gold/90 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Explore Profile & Trust Scores <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="bookings"
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-800">My Wedding Bookings</h3>
                    <ShieldCheck className="w-5 h-5 text-rose-500" />
                  </div>
                  
                  {bookings.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No scheduled trial sessions or wedding bookings active yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map(b => (
                        <div key={b.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                          <div className="flex gap-3.5 items-center">
                            <img
                              src={b.providerAvatar}
                              alt={b.providerBusinessName}
                              className="w-12 h-12 rounded-full object-cover border"
                            />
                            <div>
                              <h4 className="font-bold text-sm text-slate-800">{b.providerBusinessName}</h4>
                              <p className="text-xs text-slate-500">{b.serviceName} • <span className="font-mono text-slate-400">₹{b.price}</span></p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">Date: {new Date(b.date).toLocaleString()}</p>
                              {b.notes && <p className="text-[11px] text-slate-500 italic mt-1.5 bg-white p-2 rounded-lg border border-slate-100">Notes: {b.notes}</p>}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2.5 w-full md:w-auto">
                            <div className="flex items-center gap-1.5">
                              {b.status === 'completed' && <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>}
                              {b.status === 'confirmed' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Confirmed</span>}
                              {b.status === 'pending' && <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Approval Standby</span>}
                              {b.status === 'cancelled' && <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Cancelled</span>}
                            </div>

                            {/* EMERGENCY SYSTEM ALERT CONTAINER */}
                            {b.emergencyBackupAssigned && b.status === 'cancelled' && (
                              <div className="p-3.5 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl text-white max-w-sm mt-1 shadow-sm border border-rose-300">
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold font-display">
                                  <ShieldCheck className="w-4 h-4 text-white" />
                                  <span>Automated Emergency Backup Active</span>
                                </div>
                                <p className="text-[10px] text-rose-50 leading-normal">
                                  Don't worry! BridalTrust instantly re-routed standby elite artist **{b.backupProviderName}** to secure your slot on {new Date(b.date).toLocaleDateString()}. Your downpayment was successfully transferred and locked in with escrow.
                                </p>
                              </div>
                            )}

                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                              >
                                Trigger Cancellation (Test Backup)
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'checklist' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="checklist"
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-base text-slate-800 font-display">My Bridal Beauty Checklist</h3>
                      <p className="text-xs text-slate-400">Step-by-step skincare prep routines and trials planner.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingTask(!isAddingTask)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Goal
                    </button>
                  </div>

                  {isAddingTask && (
                    <form onSubmit={handleAddTask} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                        <div className="md:col-span-6">
                          <label className="block text-slate-500 mb-1">Checklist Item Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Schedule hydration skin trial..."
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                            required
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-slate-500 mb-1">Category</label>
                          <select
                            value={newTaskCategory}
                            onChange={e => setNewTaskCategory(e.target.value as any)}
                            className="w-full p-1.5 bg-white border rounded-lg"
                          >
                            <option value="Skincare">Skincare</option>
                            <option value="Trial">Trial</option>
                            <option value="Booking">Booking</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-slate-500 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={e => setNewTaskDueDate(e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700">
                        Create Goal
                      </button>
                    </form>
                  )}

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {tasks.map(t => (
                      <div key={t.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTask(t.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${t.completed ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 hover:border-rose-500'}`}
                          >
                            {t.completed && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <p className={`font-medium ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">Category: {t.category} • Due: {t.dueDate}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'moodboard' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="moodboard"
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-base text-slate-800 font-display">My Bridal Inspiration board</h3>
                      <p className="text-xs text-slate-400">Save visual trial details, references, makeup shades, or styles.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingInsp(!isAddingInsp)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Card
                    </button>
                  </div>

                  {isAddingInsp && (
                    <form onSubmit={handleAddInspiration} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1">Inspiration Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Classic Dewy Skin styling"
                            value={newInspTitle}
                            onChange={e => setNewInspTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">Image URL</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newInspUrl}
                            onChange={e => setNewInspUrl(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1">Category</label>
                          <select
                            value={newInspCategory}
                            onChange={e => setNewInspCategory(e.target.value)}
                            className="w-full p-1.5 bg-white border rounded-lg text-xs"
                          >
                            <option>Makeup</option>
                            <option>Hair</option>
                            <option>Couture</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">Notes (Optional)</label>
                          <input
                            type="text"
                            placeholder="Highlighting dewy glow"
                            value={newInspNotes}
                            onChange={e => setNewInspNotes(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700">
                        Add to Board
                      </button>
                    </form>
                  )}

                  {/* Board layout */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {inspirations.map(ins => (
                      <div key={ins.id} className="group relative bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                        <img
                          src={ins.imageUrl}
                          alt={ins.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-bold text-xs text-slate-800">{ins.title}</h4>
                          <span className="text-[9px] uppercase tracking-wider text-rose-600 font-mono">{ins.category}</span>
                          {ins.notes && <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">{ins.notes}</p>}
                        </div>

                        <button
                          onClick={() => handleDeleteInspiration(ins.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assistant' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="assistant"
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
                  
                  {/* Assistant header */}
                  <div className="px-6 py-4 border-b border-rose-50 bg-gradient-to-r from-rose-50/50 to-pink-50/25 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 leading-tight">BridalTrust AI Assistant</h4>
                        <p className="text-[10px] text-slate-400">Context-Aware Wedding Beauty Planner • Powered by Gemini</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat logs */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.length === 0 && (
                      <div className="text-center py-12 max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <h5 className="font-bold text-sm text-slate-700">Start Planning Bespoke Look</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Ask anything! Try: <br />
                          <span className="italic font-medium text-rose-600">"What is the best prep for dry skin 1 month prior to the wedding?"</span> or <br />
                          <span className="italic font-medium text-rose-600">"Which Makeup artist from the list fits a ₹15,000 budget best?"</span>
                        </p>
                      </div>
                    )}

                    {chatHistory.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`p-4 rounded-2xl text-xs max-w-md leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-rose-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border rounded-tl-none border-slate-100'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                          <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                          <span className="text-xs text-slate-400">AI is planning bespoke response...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat form */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-50 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask our AI Bridal Planner for professional advice..."
                      value={assistantMessage}
                      onChange={e => setAssistantMessage(e.target.value)}
                      disabled={isChatLoading}
                      className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !assistantMessage.trim()}
                      className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl disabled:bg-slate-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* DETAILED PROVIDER PROFILE POPUP MODAL */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden grid md:grid-cols-12 max-h-[90vh]"
            >
              
              {/* Left Column: Details & Reviews */}
              <div className="md:col-span-7 p-6 border-r border-slate-100 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProvider.avatarUrl}
                      alt={selectedProvider.name}
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{selectedProvider.businessName}</h3>
                      <p className="text-xs text-rose-600 font-medium">{selectedProvider.category} Artist • Base Price: ₹{selectedProvider.basePrice}</p>
                    </div>
                  </div>
                  
                  {/* Close button inside modal */}
                  <button 
                    onClick={() => setSelectedProvider(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main stats block */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <TrustScoreBadge metrics={selectedProvider.trustScore} />
                  {selectedProvider.compatibilityScore && (
                    <CompatibilityBreakdown score={selectedProvider.compatibilityScore} />
                  )}
                </div>

                {/* Detailed Trust breakdown list */}
                <div className="bg-brand-panel border border-brand-border/60 rounded-2xl p-4.5 space-y-3 mb-5">
                  <h4 className="font-serif font-bold text-xs text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                    🛡️ Multi-Factor Trust Audit Report
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                    <div className="bg-white p-2.5 rounded-lg border border-brand-border/40 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-brand-muted text-[9px]">Reliability Rate</span>
                        <span className="text-brand-dark">{selectedProvider.trustScore.reliability}%</span>
                      </div>
                      <p className="text-[9px] text-brand-muted leading-tight">Contractual arrival & booking fulfillment rate on the wedding day.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-brand-border/40 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-brand-muted text-[9px]">Review Authenticity</span>
                        <span className="text-brand-dark">{selectedProvider.trustScore.authenticity}%</span>
                      </div>
                      <p className="text-[9px] text-brand-muted leading-tight">Semantic and cryptographic validation of past wedding evaluations.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-brand-border/40 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-brand-muted text-[9px]">Repeat Client Rate</span>
                        <span className="text-brand-dark">{selectedProvider.trustScore.repeatRate}%</span>
                      </div>
                      <p className="text-[9px] text-brand-muted leading-tight">Direct referrals and multiple event bookings within bridal family networks.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-brand-border/40 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-brand-muted text-[9px]">Response Speed</span>
                        <span className="text-brand-dark">{selectedProvider.trustScore.responseSpeed}%</span>
                      </div>
                      <p className="text-[9px] text-brand-muted leading-tight">Average duration to response and complete consultation schedules (Average: 12m).</p>
                    </div>
                  </div>

                  {selectedProvider.experienceYears && (
                    <div className="pt-2 text-[10px] text-brand-muted border-t border-brand-border flex items-center justify-between">
                      <span>Bridal Career Experience: <strong>{selectedProvider.experienceYears} Years</strong></span>
                      <span>Cancellation History: <strong className="text-emerald-600">0 events</strong></span>
                    </div>
                  )}

                  {selectedProvider.certifications && selectedProvider.certifications.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-brand-border">
                      <p className="text-[9px] uppercase tracking-wider text-brand-muted font-semibold">Active Licensing & Board Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedProvider.certifications.map((cert, index) => (
                          <span key={index} className="bg-white text-brand-charcoal border border-brand-border text-[9px] px-2 py-0.5 rounded">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* About and languages */}
                <div className="space-y-3 text-xs text-slate-600 mb-5 leading-relaxed">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider font-mono">Professional Biography</h4>
                  <p>{selectedProvider.about}</p>
                  <p className="text-[10px] text-slate-400">Languages: {selectedProvider.languages.join(', ')}</p>
                </div>

                {/* Portfolio Showcase */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">Portfolio Showcase</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProvider.portfolio.map(port => (
                      <div key={port.id} className="relative rounded-lg overflow-hidden group">
                        <img
                          src={port.imageUrl}
                          alt={port.title}
                          className="w-full h-24 object-cover hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent p-1.5 flex items-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[9px] text-white font-medium leading-none truncate">{port.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Reviews Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">Screened Client Reviews</h4>
                    <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                      🛡️ Authenticity Validated
                    </span>
                  </div>

                  {/* Review input box */}
                  <form onSubmit={handleAddReview} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <p className="text-[10px] font-semibold text-slate-600">Have a past trial or booking with this artist? Write a verified review:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-0.5 text-amber-500"
                          >
                            <Star className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">Rating: {newReviewRating}/5</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write authentic feedback... (Tip: extreme CAPS or spam words trigger review screening flags)"
                        value={newReviewContent}
                        onChange={e => setNewReviewContent(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        required
                      />
                      <button
                        type="submit"
                        disabled={reviewSubmitting || !newReviewContent.trim()}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:bg-slate-200"
                      >
                        {reviewSubmitting ? 'Analyzing...' : 'Post'}
                      </button>
                    </div>
                  </form>

                  {/* Reviews Logs */}
                  <div className="space-y-3">
                    {reviews.filter(r => r.providerId === selectedProvider.id).map(r => (
                      <div 
                        key={r.id} 
                        className={`p-3.5 rounded-2xl border transition-all ${r.isGenuine ? 'bg-white border-slate-100' : 'bg-red-50/50 border-red-200 text-red-900'}`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex items-center gap-2">
                            {r.userImage ? (
                              <img src={r.userImage} alt={r.userName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold uppercase">{r.userName.charAt(0)}</div>
                            )}
                            <div>
                              <p className="font-semibold text-[11px] leading-tight">{r.userName}</p>
                              <p className="text-[9px] text-slate-400 font-mono">Date: {r.date}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-500 stroke-none" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed italic">"{r.content}"</p>

                        {/* FRAUD INDICATION ALERT FOR DEFAMATORY OR ROBOTIC ATTACKS */}
                        {!r.isGenuine && (
                          <div className="mt-2.5 p-2 bg-red-100 text-red-800 border border-red-200 rounded-lg text-[10px] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                            <div>
                              <span className="font-bold">SUSPICIOUS REVIEW SHIELDED:</span> {r.analysisReasoning}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Scheduler / Booking Form */}
              <div className="md:col-span-5 p-6 bg-slate-50/60 overflow-y-auto max-h-[90vh] flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Booking Center</span>
                    <h4 className="text-lg font-bold text-slate-800 leading-snug">Lock Down Your Big Day</h4>
                    <p className="text-xs text-slate-500">All bookings are backed by the **BridalTrust 100% Standby Emergency Protection**.</p>
                  </div>

                  <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Select Service Package</label>
                      <select
                        value={selectedServiceId}
                        onChange={e => setSelectedServiceId(e.target.value)}
                        className="w-full p-2 bg-white border rounded-xl font-medium"
                        required
                      >
                        <option value="">-- Choose Wedding/Trial Service --</option>
                        {selectedProvider.services.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} - ₹{s.price} ({s.durationMinutes} min)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Wedding Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={e => setBookingDate(e.target.value)}
                          className="w-full p-2 bg-white border rounded-xl font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Start Time</label>
                        <input
                          type="time"
                          value={bookingTime}
                          onChange={e => setBookingTime(e.target.value)}
                          className="w-full p-2 bg-white border rounded-xl font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Live Availability Status */}
                    {bookingDate && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Live Schedule Check</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>Selected: <strong className="font-mono">{bookingDate}</strong></span>
                          {(() => {
                            const status = selectedProvider.availabilityCalendar?.[bookingDate] || 'available';
                            if (status === 'fully_booked') {
                              return <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">🔴 Fully Booked</span>;
                            } else if (status === 'busy') {
                              return <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">🟡 Busy / Standby Only</span>;
                            } else {
                              return <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">🟢 Available to lock</span>;
                            }
                          })()}
                        </div>
                        {/* Interactive mini date bar */}
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const d = new Date(bookingDate);
                            d.setDate(d.getDate() + i - 1);
                            const dStr = d.toISOString().split('T')[0];
                            const st = selectedProvider.availabilityCalendar?.[dStr] || 'available';
                            const isSelected = bookingDate === dStr;
                            return (
                              <button
                                type="button"
                                key={dStr}
                                onClick={() => setBookingDate(dStr)}
                                className={`p-2 rounded-lg text-center transition-all border flex flex-col justify-between cursor-pointer ${isSelected ? 'border-brand-gold bg-brand-gold/10' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                              >
                                <span className="text-[9px] text-slate-400 font-bold leading-none">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="font-mono text-xs font-bold text-slate-800 leading-tight pt-0.5">{d.getDate()}</span>
                                <span className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${st === 'fully_booked' ? 'bg-red-500' : st === 'busy' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Specific Styling requests</label>
                      <textarea
                        placeholder="e.g. skin tone, hair crown, extensions, or classic matte details..."
                        value={bookingNotes}
                        onChange={e => setBookingNotes(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedServiceId}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-200 flex items-center justify-center gap-1.5 disabled:bg-slate-300"
                    >
                      🛡️ Secure Instant Booking Escrow
                    </button>
                  </form>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p>
                    **Payment Escrow Protection**: Your deposit remains securely protected in BridalTrust escrow. Funds are only dispersed to the professional upon successful wedding day styling verification.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK COMPARE FLOATING BOTTOM BAR */}
      {comparedProviderIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-charcoal text-brand-ivory py-4 px-6 border-t border-brand-gold/30 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg border border-brand-gold/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-brand-ivory leading-snug">Quick Compare Tool active</p>
              <p className="text-xs text-brand-muted">{comparedProviderIds.length} artist{comparedProviderIds.length > 1 ? 's' : ''} selected. Compare credentials, prices, and Trust Score breakdowns.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setComparedProviderIds([])}
              className="text-xs text-brand-muted hover:text-brand-ivory transition-colors cursor-pointer"
            >
              Clear selection
            </button>
            <button 
              onClick={() => setIsCompareModalOpen(true)}
              className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-brand-ivory text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md shadow-brand-gold/10 cursor-pointer animate-pulse"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARE MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-panel">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <h3 className="text-sm font-serif font-bold text-brand-dark uppercase tracking-wider">Side-by-Side Professional Comparison</h3>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Table */}
            <div className="p-6 overflow-x-auto overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-panel">
                    <th className="p-3.5 font-semibold text-brand-muted uppercase tracking-wider text-[10px]">Metric / Detail</th>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <th key={p.id} className="p-3.5 text-center min-w-[180px]">
                          <div className="space-y-1">
                            <img src={p.avatarUrl} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-brand-border mx-auto" />
                            <p className="font-serif font-bold text-brand-dark leading-snug">{p.businessName}</p>
                            <p className="text-[10px] text-brand-muted capitalize font-sans">{p.category?.replace('_', ' ')}</p>
                          </div>
                        </th>
                      ) : null;
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-panel">
                  {/* Verified Badge */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px]">Verified Status</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`verify-${p.id}`} className="p-3 text-center">
                          {p.verifiedStatus === 'premium' && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[9px] font-bold px-2 py-0.5 rounded-full">🥇 Premium</span>}
                          {p.verifiedStatus === 'verified' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full">✅ Verified</span>}
                          {p.verifiedStatus === 'top_rated' && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full">⭐ Top Rated</span>}
                          {(!p.verifiedStatus || p.verifiedStatus === 'none') && <span className="bg-gray-50 text-gray-400 border border-gray-200 text-[9px] font-bold px-2 py-0.5 rounded-full">Screening</span>}
                        </td>
                      ) : null;
                    })}
                  </tr>

                  {/* Rating */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px]">Rating & Reviews</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`rating-${p.id}`} className="p-3 text-center font-serif font-bold text-brand-dark">
                          ⭐ {p.rating} / 5 ({p.reviewCount} reviews)
                        </td>
                      ) : null;
                    })}
                  </tr>

                  {/* Trust Score */}
                  <tr className="bg-brand-panel/30">
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px] text-brand-gold font-bold">Overall Trust Score</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`trust-${p.id}`} className="p-3 text-center">
                          <span className="font-mono font-bold text-brand-gold text-sm">{p.trustScore.score}%</span>
                        </td>
                      ) : null;
                    })}
                  </tr>

                  {/* Reliability */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px] pl-5 border-l-2 border-brand-gold/30">Reliability Rate</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`rel-${p.id}`} className="p-3 text-center text-brand-dark font-medium">{p.trustScore.reliability}%</td>
                      ) : null;
                    })}
                  </tr>

                  {/* Review Authenticity */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px] pl-5 border-l-2 border-brand-gold/30">Review Authenticity</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`auth-${p.id}`} className="p-3 text-center text-brand-dark font-medium">{p.trustScore.authenticity}%</td>
                      ) : null;
                    })}
                  </tr>

                  {/* Repeat Rate */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px] pl-5 border-l-2 border-brand-gold/30">Repeat Client Rate</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`rep-${p.id}`} className="p-3 text-center text-brand-dark font-medium">{p.trustScore.repeatRate}%</td>
                      ) : null;
                    })}
                  </tr>

                  {/* Response Speed */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px] pl-5 border-l-2 border-brand-gold/30">Response Speed</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`resp-${p.id}`} className="p-3 text-center text-brand-dark font-medium">{p.trustScore.responseSpeed}%</td>
                      ) : null;
                    })}
                  </tr>

                  {/* Price */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px]">Base Package Price</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`price-${p.id}`} className="p-3 text-center font-serif font-bold text-brand-dark text-sm">
                          ₹{p.basePrice}
                        </td>
                      ) : null;
                    })}
                  </tr>

                  {/* Experience */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px]">Experience Years</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`exp-${p.id}`} className="p-3 text-center font-sans font-medium text-brand-dark">
                          {p.experienceYears || 5} Years in Bridal
                        </td>
                      ) : null;
                    })}
                  </tr>

                  {/* Certifications */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px]">Certifications</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`certs-${p.id}`} className="p-3 text-center">
                          <div className="flex flex-col gap-1 text-[10px] text-brand-muted italic">
                            {p.certifications?.map((c, i) => (
                              <p key={i}>• {c}</p>
                            )) || <p>Vetted Esthetics Certification</p>}
                          </div>
                        </td>
                      ) : null;
                    })}
                  </tr>

                  {/* Badges */}
                  <tr>
                    <td className="p-3 font-semibold text-brand-muted uppercase tracking-wider text-[9px]">Achievements</td>
                    {comparedProviderIds.map(id => {
                      const p = providers.find(item => item.id === id);
                      return p ? (
                        <td key={`achieve-${p.id}`} className="p-3 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {p.badges?.map((badge, i) => (
                              <span key={i} className="bg-brand-panel border border-brand-border/60 text-brand-charcoal text-[9px] font-bold px-2 py-0.5 rounded">
                                {badge}
                              </span>
                            )) || <span className="text-[10px] text-brand-muted">-</span>}
                          </div>
                        </td>
                      ) : null;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-brand-panel border-t border-brand-border flex justify-end gap-3">
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-dark text-brand-ivory text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
