/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Sparkles, DollarSign, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { TrustScoreDetails, CompatibilityScoreDetails } from '../types';

interface TrustScoreProps {
  metrics: TrustScoreDetails;
  compact?: boolean;
}

export function TrustScoreBadge({ metrics, compact = false }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-brand-gold bg-brand-panel border-brand-gold/30';
    if (score >= 85) return 'text-brand-muted bg-brand-panel border-brand-border';
    return 'text-brand-charcoal bg-brand-panel border-brand-border';
  };

  const scoreColor = getScoreColor(metrics.score);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${scoreColor}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
        <span>Trust Score: {metrics.score}%</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-brand-border shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider font-mono">Trust Intelligence</h4>
          <p className="text-lg font-serif font-medium text-brand-dark">Verified Trust Matrix</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-gold animate-pulse" />
            <span className="text-3xl font-serif font-bold text-brand-gold">{metrics.score}%</span>
          </div>
          <span className="text-[10px] text-brand-muted uppercase tracking-wider font-mono">Platform Bonded</span>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Reliability */}
        <div>
          <div className="flex justify-between text-xs font-medium text-brand-charcoal mb-1">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-600" /> Contractual Reliability</span>
            <span className="font-mono text-brand-dark">{metrics.reliability}%</span>
          </div>
          <div className="w-full bg-brand-panel h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.reliability}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-emerald-600 h-full rounded-full"
            />
          </div>
        </div>

        {/* Authenticity */}
        <div>
          <div className="flex justify-between text-xs font-medium text-brand-charcoal mb-1">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-gold" /> Review Authenticity</span>
            <span className="font-mono text-brand-dark">{metrics.authenticity}%</span>
          </div>
          <div className="w-full bg-brand-panel h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.authenticity}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="bg-brand-gold h-full rounded-full"
            />
          </div>
        </div>

        {/* Repeat Rate */}
        <div>
          <div className="flex justify-between text-xs font-medium text-brand-charcoal mb-1">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-brand-gold/70" /> Repeat Bride Recommendation</span>
            <span className="font-mono text-brand-dark">{metrics.repeatRate}%</span>
          </div>
          <div className="w-full bg-brand-panel h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.repeatRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="bg-brand-gold/60 h-full rounded-full"
            />
          </div>
        </div>

        {/* Response Speed */}
        <div>
          <div className="flex justify-between text-xs font-medium text-brand-charcoal mb-1">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-brand-muted" /> Inquiries Response Speed</span>
            <span className="font-mono text-brand-dark">{metrics.responseSpeed}%</span>
          </div>
          <div className="w-full bg-brand-panel h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.responseSpeed}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="bg-brand-muted h-full rounded-full"
            />
          </div>
        </div>
      </div>

      {metrics.cancellationHistory && metrics.cancellationHistory.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-800 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Risk Alert: Past Cancellations Documented</span>
          </div>
          <ul className="text-[11px] text-red-700 space-y-1 list-disc pl-3 font-sans">
            {metrics.cancellationHistory.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface CompatibilityProps {
  score: CompatibilityScoreDetails;
}

export function CompatibilityBreakdown({ score }: CompatibilityProps) {
  return (
    <div className="bg-brand-panel border border-brand-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted font-mono">Dynamic Alignment</span>
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded shadow-2xs border border-brand-border text-xs font-bold text-brand-gold">
          <Sparkles className="w-3 h-3" />
          <span>{score.overall}% Match</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Budget Match */}
        <div className="bg-white p-3 rounded border border-brand-border flex items-center gap-2.5">
          <div className="p-2 rounded bg-brand-panel text-brand-gold border border-brand-border">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-brand-muted text-[10px]">Budget Fit</p>
            <p className="font-bold text-brand-dark font-mono">{score.budgetFit}%</p>
          </div>
        </div>

        {/* Style Match */}
        <div className="bg-white p-3 rounded border border-brand-border flex items-center gap-2.5">
          <div className="p-2 rounded bg-brand-panel text-brand-gold border border-brand-border">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-brand-muted text-[10px]">Style Alignment</p>
            <p className="font-bold text-brand-dark font-mono">{score.styleFit}%</p>
          </div>
        </div>

        {/* Location Match */}
        <div className="bg-white p-3 rounded border border-brand-border flex items-center gap-2.5">
          <div className="p-2 rounded bg-brand-panel text-brand-gold border border-brand-border">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-brand-muted text-[10px]">Location Radius</p>
            <p className="font-bold text-brand-dark font-mono">{score.locationFit}%</p>
          </div>
        </div>

        {/* Service Match */}
        <div className="bg-white p-3 rounded border border-brand-border flex items-center gap-2.5">
          <div className="p-2 rounded bg-brand-panel text-brand-gold border border-brand-border">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-brand-muted text-[10px]">Service Capability</p>
            <p className="font-bold text-brand-dark font-mono">{score.serviceFit}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
