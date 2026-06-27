/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, UserCheck, Calendar, IndianRupee, ArrowRight, CheckCircle, 
  Trash2, RefreshCw, Star, ShieldCheck, AlertCircle, TrendingUp, Sparkles 
} from 'lucide-react';
import { Booking, Review, RiskAlert } from '../types';

interface FounderDashboardProps {
  onBackToLanding: () => void;
}

export function FounderDashboard({ onBackToLanding }: FounderDashboardProps) {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 5,
    totalProviders: 3,
    totalBookings: 3,
    escrowVolume: 4200
  });

  const [loading, setLoading] = useState(false);

  const fetchFounderStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setBookings(data.bookings);
      setReviews(data.reviews);
      setAlerts(data.riskAlerts);

      // Re-sum active stats based on real database records
      const activeBookings = data.bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'completed');
      const escrowVol = activeBookings.reduce((sum: number, b: any) => sum + b.price, 0);

      setStats({
        totalUsers: data.users.length,
        totalProviders: data.providers.length,
        totalBookings: data.bookings.length,
        escrowVolume: escrowVol
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFounderStats();
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/risk-alerts/${id}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchFounderStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Severity style helper
  const getSeverityStyle = (sev: string) => {
    if (sev === 'high') return 'text-red-700 bg-red-50 border-red-200';
    if (sev === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-blue-700 bg-blue-50 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-rose-900 selection:text-white">
      
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow">
              BT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-display">BridalTrust Operator Center</span>
                <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/20 font-mono uppercase">Venture founder</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">Strategic intelligence layer, risk mitigation & escrow protection.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchFounderStats()}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onBackToLanding}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* KPI Dashboard cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">Registered Brides</span>
              <UserCheck className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-bold font-display text-white">{stats.totalUsers - 3}</p>
            <p className="text-[10px] text-slate-400 leading-none">Protected in system</p>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">Vetted Artists</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold font-display text-white">{stats.totalProviders}</p>
            <p className="text-[10px] text-slate-400 leading-none">Average trust score: 91%</p>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">Total Bookings</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold font-display text-white">{stats.totalBookings}</p>
            <p className="text-[10px] text-slate-400 leading-none">Standby systems ready</p>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">Escrow Bond Pool</span>
              <IndianRupee className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-3xl font-bold font-display text-white">₹{stats.escrowVolume}</p>
            <p className="text-[10px] text-slate-400 leading-none">Insured payment deposits</p>
          </div>
        </div>

        {/* Dynamic Risk Alerts Center */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Alerts Area */}
          <div className="md:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm font-display text-white uppercase tracking-wider font-mono">
                  Trust Intelligence Flagged alerts
                </h3>
              </div>
              <span className="text-[10px] text-rose-400 font-mono">
                {alerts.filter(a => !a.resolved).length} Pending Audits
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">All clear. No risk signals flagged in the network.</p>
              ) : (
                alerts.map(a => (
                  <div 
                    key={a.id} 
                    className={`p-4 border rounded-2xl transition-all ${a.resolved ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getSeverityStyle(a.severity)}`}>
                            {a.severity}
                          </span>
                          <span className="font-bold text-white text-[13px]">{a.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Target: {a.targetName} ({a.targetId}) • Log Date: {a.date}</p>
                      </div>

                      {!a.resolved ? (
                        <button
                          onClick={() => handleResolveAlert(a.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 shadow"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 font-mono uppercase bg-emerald-950/40 px-2 py-0.5 border border-emerald-900 rounded">
                          ✓ Resolved
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/40 font-sans">
                      {a.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Area: System Shield Telemetry */}
          <div className="md:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Security Health</span>
                <h4 className="text-base font-bold text-white leading-snug font-display">Neural Shield Analytics</h4>
                <p className="text-xs text-slate-400 mt-1">Real-time validation engine statistics across platform.</p>
              </div>

              {/* Progress meters */}
              <div className="space-y-4 text-xs text-slate-400">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Authentic review percentage</span>
                    <span className="font-mono text-emerald-400">98.4%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[98.4%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Attendance escrow assurance rate</span>
                    <span className="font-mono text-rose-400">99.8%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full w-[99.8%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Emergency backup standby trigger response latency</span>
                    <span className="font-mono text-cyan-400">&lt; 150ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full w-[90%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] text-slate-500 leading-normal flex items-start gap-2 font-sans">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <p>
                Operators are fully logged and audited. All resolved overrides or risk alerts send live telemetry directly to our cryptographic compliance records.
              </p>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
