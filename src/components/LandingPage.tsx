/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Sparkles, Flame, UserCheck, Compass, MessageSquareCode, Calendar, ArrowRight, Star, X, ArrowLeft } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (role: 'bride' | 'provider' | 'founder') => void;
  onOpenAuth: () => void;
}

export function LandingPage({ onEnterApp, onOpenAuth }: LandingPageProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    basePrice: '1000',
    about: '',
    location: 'New York Metro'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rolesList = [
    { id: 'bride', label: 'Bride / Customer', icon: '👰', desc: 'Discover certified artists, compare multi-factor trust metrics, and consult with our AI assistant.' },
    { id: 'makeup_artist', label: 'Makeup Artist', icon: '💄', desc: 'Showcase elite makeup looks, build verified credentials, and secure wedding bookings.' },
    { id: 'hair_stylist', label: 'Hair Stylist', icon: '💇', desc: 'Sculpt romantic bridal updos, integrate extensions, and manage your custom schedule.' },
    { id: 'mehendi_artist', label: 'Mehendi Artist', icon: '🎨', desc: 'Highlight traditional Rajasthani and contemporary Henna styling.' },
    { id: 'nail_artist', label: 'Nail Artist', icon: '💅', desc: 'Exhibit premium custom gel extensions, pearl overlays, and custom nail art.' },
    { id: 'salon', label: 'Salon', icon: '🏢', desc: 'List your private VIP suites, blowout stations, facials, and group bookings.' },
    { id: 'bridal_studio', label: 'Bridal Studio', icon: '👑', desc: 'Offer premium all-in-one wardrobe, hair styling, and skincare packages.' },
    { id: 'wedding_beauty_partner', label: 'Beauty Partner / Concierge', icon: '📸', desc: 'Coordinate wedding-day beauty timelines, trial schedules, and backup coverage.' }
  ];

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          businessName: formData.businessName,
          category: selectedCategory,
          basePrice: Number(formData.basePrice),
          about: formData.about,
          location: formData.location
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.provider) {
          localStorage.setItem('active_provider_id', data.provider.id);
          onEnterApp('provider');
        }
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
      setIsJoinModalOpen(false);
    }
  };
  return (
    <div className="bg-brand-ivory min-h-screen text-brand-charcoal selection:bg-brand-gold/20 selection:text-brand-dark font-sans">
      
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-brand-ivory/80 backdrop-blur-md border-b border-brand-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-charcoal flex items-center justify-center text-brand-ivory font-bold shadow-sm">
              BT
            </div>
            <span className="text-xl font-medium font-serif tracking-tight text-brand-dark">
              Bridal<span className="text-brand-gold font-light italic">Trust</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider font-medium text-brand-muted">
            <a href="#how-it-works" className="hover:text-brand-gold transition-colors">How it Works</a>
            <a href="#trust-intelligence" className="hover:text-brand-gold transition-colors">Trust Intelligence</a>
            <a href="#testimonials" className="hover:text-brand-gold transition-colors font-serif italic font-semibold normal-case">Vetted Vibe</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenAuth}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-ivory bg-brand-charcoal hover:bg-brand-dark rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Sign In / Join
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:py-32">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-gradient-to-bl from-brand-gold/10 via-brand-panel/30 to-transparent rounded-full filter blur-3xl opacity-80" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-gradient-to-tr from-brand-panel/40 to-transparent rounded-full filter blur-2xl" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-panel rounded-full text-[10px] uppercase tracking-wider font-semibold text-brand-gold border border-brand-border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wedding Day Beauty Assurance</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-light leading-[1.1] text-brand-dark">
              Your Wedding Day Beauty, <br />
              <span className="font-semibold text-brand-gold italic">
                Guaranteed by Trust.
              </span>
            </h1>

            <p className="text-sm md:text-base text-brand-muted max-w-xl font-sans leading-relaxed">
              Discover, evaluate, and book elite bridal makeup artists and hair stylists with complete security. Powered by dynamic Trust scoring, verified authentic reviews, and a pre-contracted standby Emergency Backup System.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-8 py-4 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-ivory bg-brand-gold hover:bg-brand-gold/90 shadow-md shadow-brand-gold/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Get Started (Sign In / Register) <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-brand-border max-w-md mx-auto md:mx-0">
              <div>
                <p className="text-xl font-serif font-bold text-brand-dark">99.8%</p>
                <p className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Attendance Rate</p>
              </div>
              <div>
                <p className="text-xl font-serif font-bold text-brand-dark">100%</p>
                <p className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Backup Coverage</p>
              </div>
              <div>
                <p className="text-xl font-serif font-bold text-brand-dark">2.4k+</p>
                <p className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Brides Protected</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup card */}
          <div className="md:col-span-5 relative">
            <div className="relative z-10 bg-white rounded-2xl p-6 border border-brand-border shadow-xs max-w-sm mx-auto">
              <div className="flex items-center justify-between border-b border-brand-panel pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Sophia"
                    className="w-10 h-10 rounded-full object-cover border border-brand-border"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-brand-dark">Sophia Moretti</h3>
                    <p className="text-[10px] text-brand-gold font-medium">Luxury Makeup Artist</p>
                  </div>
                </div>
                <div className="bg-brand-panel px-2.5 py-1 rounded text-[10px] font-bold text-brand-gold flex items-center gap-1 border border-brand-border">
                  <Star className="w-3 h-3 fill-brand-gold stroke-none" />
                  <span>4.9</span>
                </div>
              </div>

              {/* Dynamic Score widget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted font-medium">Trust Score:</span>
                  <span className="font-bold text-brand-gold font-mono">98%</span>
                </div>
                <div className="w-full bg-brand-panel h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-gold h-full rounded-full w-[98%]" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-brand-muted">
                  <span>Reliability: 100%</span>
                  <span>Authenticity: 96%</span>
                </div>
              </div>

              {/* Security Shield Tag */}
              <div className="mt-5 p-3.5 bg-brand-panel rounded-xl flex items-center gap-3 border border-brand-border">
                <div className="p-2 rounded bg-brand-gold text-brand-ivory">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-dark leading-tight">Emergency Backup Secured</p>
                  <p className="text-[9px] text-brand-muted leading-normal">Alternative Standby artist locked in automatically.</p>
                </div>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-brand-gold/5 rounded-full filter blur-xl -z-10" />
          </div>
        </div>
      </section>

      {/* Trust Intelligence Section */}
      <section id="trust-intelligence" className="bg-white py-24 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold">The Trust Intelligence Layer</h2>
            <p className="text-3xl md:text-4xl font-serif text-brand-dark leading-tight">
              Why We Are Not Just Another Beauty Marketplace.
            </p>
            <p className="text-sm text-brand-muted leading-relaxed">
              Every year, thousands of brides face double-bookings, late cancellations, and unverified portfolio reviews. Our multi-factor security engine removes the anxiety completely.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-brand-ivory rounded-2xl border border-brand-border hover:border-brand-gold transition-colors space-y-4">
              <div className="w-12 h-12 rounded bg-brand-panel text-brand-gold flex items-center justify-center border border-brand-border">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-brand-dark">Rigorous Identity & Skill Screening</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                We verify every professional’s business credentials, check license histories, and manually audit raw, unedited camera files of past bridal work to ensure portfolios are authentic.
              </p>
            </div>

            <div className="p-8 bg-brand-ivory rounded-2xl border border-brand-border hover:border-brand-gold transition-colors space-y-4">
              <div className="w-12 h-12 rounded bg-brand-panel text-brand-gold flex items-center justify-center border border-brand-border">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-brand-dark">AI-Powered Review Validation</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Our semantic analyzer checks reviews for bot-like phrasing, competitor review bombs, and duplicate templates. Only authentic, booked customers contribute to an artist's Trust Score.
              </p>
            </div>

            <div className="p-8 bg-brand-ivory rounded-2xl border border-brand-border hover:border-brand-gold transition-colors space-y-4">
              <div className="w-12 h-12 rounded bg-brand-panel text-brand-gold flex items-center justify-center border border-brand-border">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-brand-dark">Contractual Emergency Backup</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                If an emergency occurs, our platform stands by. A high-trust alternative artist in the same style and category is pre-contracted and standby-allocated to take your slot instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-brand-panel">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Stress-Free Wedding Planning</h2>
            <p className="text-3xl font-serif text-brand-dark">How BridalTrust Protects You</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Steps line */}
            <div className="hidden md:block absolute top-1/4 left-[10%] right-[10%] h-0.5 bg-brand-border -z-10" />

            <div className="space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-ivory font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-xs">1</div>
              <h4 className="font-serif font-bold text-sm text-brand-dark">Set Wedding Details</h4>
              <p className="text-xs text-brand-muted">Share your date, location, style choices (Glam, Boho, Classic), and preferred budget.</p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-ivory font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-xs">2</div>
              <h4 className="font-serif font-bold text-sm text-brand-dark">Compare Real Trust Scores</h4>
              <p className="text-xs text-brand-muted">Review 5-dimensional scores encompassing response speed, attendance logs, and verified reviews.</p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-ivory font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-xs">3</div>
              <h4 className="font-serif font-bold text-sm text-brand-dark">Consult with AI Assistant</h4>
              <p className="text-xs text-brand-muted">Draft customized trial goals or consult on perfect matches with our context-aware AI planner.</p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-ivory font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-xs">4</div>
              <h4 className="font-serif font-bold text-sm text-brand-dark">Book with Standby Guarantee</h4>
              <p className="text-xs text-brand-muted">Confirm payment with our escrow holding. Enjoy 100% standby backup artist shielding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-24 bg-brand-charcoal text-brand-ivory relative border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight max-w-2xl mx-auto">
            Secure the Best Artists for Your Big Day with <span className="text-brand-gold italic font-semibold">Confidence.</span>
          </h2>
          <p className="text-xs md:text-sm text-brand-muted max-w-md mx-auto">
            Experience our high-fidelity startup prototype. Explore dashboards, write reviews, simulate emergencies, and plan with AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onEnterApp('bride')}
              className="px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-gold text-brand-ivory hover:bg-brand-gold/90 transition-all shadow-md shadow-brand-gold/10"
            >
              Enter Demo as Bride
            </button>
            <button
              onClick={() => {
                setStep(1);
                setIsJoinModalOpen(true);
              }}
              className="px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-panel text-brand-dark border border-brand-border hover:bg-brand-border transition-all"
            >
              Join the Network
            </button>
          </div>
        </div>
      </section>

      {/* JOIN OVERLAY MODAL */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border border-brand-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-panel">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <h3 className="text-sm font-serif font-bold text-brand-dark uppercase tracking-wider">
                  {step === 1 ? 'Join BridalTrust Network' : 'Partner Profile Setup'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setStep(1);
                }} 
                className="text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-lg font-serif font-medium text-brand-dark">How would you like to join?</p>
                    <p className="text-xs text-brand-muted">Select your bridal profile to unlock personalized features.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {rolesList.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'bride') {
                            onEnterApp('bride');
                            setIsJoinModalOpen(false);
                          } else {
                            setSelectedCategory(item.id);
                            setStep(2);
                          }
                        }}
                        className="p-4 rounded-xl border border-brand-border bg-brand-ivory hover:border-brand-gold hover:bg-white text-left transition-all group flex flex-col justify-between h-full cursor-pointer focus:outline-none"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-serif font-semibold text-xs text-brand-dark group-hover:text-brand-gold transition-colors">{item.label}</span>
                          </div>
                          <p className="text-[11px] text-brand-muted leading-relaxed leading-normal">{item.desc}</p>
                        </div>
                        <div className="text-[10px] text-brand-gold font-bold uppercase tracking-wider flex items-center gap-1 mt-3 group-hover:translate-x-1 transition-transform">
                          Select <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-brand-panel">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-brand-muted hover:text-brand-dark p-1 rounded hover:bg-brand-panel transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <span className="text-[11px] font-mono text-brand-gold bg-brand-panel px-2.5 py-0.5 rounded border border-brand-border uppercase">
                      Category: {selectedCategory?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Full Professional Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sarah Jennings"
                        className="w-full bg-brand-panel text-xs p-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Business / Studio Name</label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Jennings Luxury Artistry"
                        className="w-full bg-brand-panel text-xs p-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Base Package Price (₹ INR)</label>
                      <input
                        type="number"
                        required
                        min="50"
                        value={formData.basePrice}
                        onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                        placeholder="e.g. 950"
                        className="w-full bg-brand-panel text-xs p-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Primary Location</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. New York Metro"
                        className="w-full bg-brand-panel text-xs p-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted block">Artist Bio / About</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.about}
                      onChange={e => setFormData({ ...formData, about: e.target.value })}
                      placeholder="Tell brides about your signature styling approach, certifications, cosmetics kits, and years of experience..."
                      className="w-full bg-brand-panel text-xs p-2.5 border border-brand-border rounded-lg focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-brand-panel">
                    <button
                      type="button"
                      onClick={() => {
                        setIsJoinModalOpen(false);
                        setStep(1);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-ivory text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Onboarding...' : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-brand-dark text-brand-muted py-12 px-6 border-t border-brand-charcoal text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-gold flex items-center justify-center text-brand-dark font-bold text-xs">BT</div>
            <span className="text-sm font-medium text-brand-ivory font-serif">BridalTrust</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
            <p>
              &copy; 2026 BridalTrust Inc. Designed for premium, stress-free wedding beauty.
            </p>
            {/* Hidden Founder Access Easter Egg */}
            <button 
              onClick={() => onEnterApp('founder')}
              className="opacity-10 hover:opacity-100 text-[10px] font-mono text-brand-gold hover:underline transition-opacity cursor-pointer border border-brand-gold/20 px-2 py-0.5 rounded"
              title="Operator Console"
            >
              [Operator Center]
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
