/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI successfully initialized server-side.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI Client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY provided. Intelligence features will run in high-quality local fallback mode.');
}

// Ensure database file exists with initial mock data
function getInitialData() {
  const initialUsers = [
    {
      id: 'bride_demo',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      role: 'bride',
      weddingDate: '2026-10-17',
      budget: 2500,
      location: 'New York Metro',
      preferences: {
        style: 'Classic',
        skinType: 'Combination',
        hairType: 'Wavy',
        servicesNeeded: ['Makeup', 'Hair Styling']
      }
    },
    {
      id: 'provider_sophiamoretti',
      name: 'Sophia Moretti',
      email: 'sophia@morettibeauty.com',
      role: 'provider'
    },
    {
      id: 'founder_demo',
      name: 'Elena Vance',
      email: 'elena@bridaltrust.io',
      role: 'founder'
    }
  ];

  const initialProviders = [
    {
      id: 'prov_sophia',
      name: 'Sophia Moretti',
      businessName: 'Moretti Luxury Bridal Makeup',
      category: 'makeup_artist',
      location: 'New York Metro',
      rating: 4.9,
      reviewCount: 42,
      priceRange: '$$$',
      basePrice: 1200,
      about: 'Sophia Moretti is an award-winning bridal makeup artist specializing in flawless, long-lasting, skin-forward luxury bridal applications. With over a decade of experience, she combines red-carpet techniques with timeless wedding elegance to highlight your natural features.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Italian'],
      portfolio: [
        { id: 'p1_1', imageUrl: 'https://images.unsplash.com/photo-1596162954151-cd541786592c?w=400&auto=format&fit=crop&q=80', title: 'Radiant Classic Bride', description: 'Dewy skin with a soft smokey eye and timeless rosy pink lip.' },
        { id: 'p1_2', imageUrl: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=400&auto=format&fit=crop&q=80', title: 'Modern Soft Glam', description: 'Satin finish with champagne golds, soft winged liner, and subtle contouring.' },
        { id: 'p1_3', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80', title: 'High-Society Editorial Look', description: 'Matte elegant finish with neutral shades tailored for candlelit reception venues.' }
      ],
      services: [
        { id: 's1_1', name: 'Premium Bridal Makeup + Trial Session', price: 1200, durationMinutes: 180, description: 'Includes in-depth 90-minute trial consultation, skincare preparation, full airbrush or luxury traditional makeup application, lashes, and touch-up kit.' },
        { id: 's1_2', name: 'Bridal Party Makeup Application', price: 180, durationMinutes: 45, description: 'Flawless makeup for bridesmaids or mothers of the bride, including premium lash applications.' }
      ],
      trustScore: {
        score: 98,
        reliability: 100,
        authenticity: 96,
        repeatRate: 95,
        responseSpeed: 99,
        cancellationHistory: []
      },
      availability: ['2026-10-17T09:00:00Z', '2026-10-17T12:00:00Z', '2026-10-18T10:00:00Z', '2026-10-24T08:00:00Z'],
      featured: true,
      experienceYears: 12,
      certifications: ['MAC Pro Bridal Masterclass 2016', 'Certified Esthetician NY'],
      badges: ['🏆 Top Performer', '💎 Premium Partner', '🔥 Fast Responder'],
      verifiedStatus: 'premium',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "available",
        "2026-10-24": "available",
        "2026-10-25": "booked",
        "2026-10-31": "busy"
      }
    },
    {
      id: 'prov_elena',
      name: 'Elena Rostova',
      businessName: 'Rostova Bridal Hair Elite',
      category: 'hair_stylist',
      location: 'New York Metro',
      rating: 4.8,
      reviewCount: 35,
      priceRange: '$$',
      basePrice: 950,
      about: 'Elena Rostova is a master bridal hair sculptor trained in Paris and based in Brooklyn. She specializes in intricate romantic updos, cascading Hollywood waves, and modern botanical boho styles. Her hair designs are engineered to maintain volume and beauty from the walk down the aisle to the final dance.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Russian'],
      portfolio: [
        { id: 'p2_1', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&auto=format&fit=crop&q=80', title: 'Parisian Textured Updo', description: 'Effortless textured low bun with botanical pin inserts.' },
        { id: 'p2_2', imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=80', title: 'Signature Hollywood Waves', description: 'Sculpted, glossy vintage waves with deep side part and jeweled hair clip.' },
        { id: 'p2_3', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80', title: 'Braided Halo Boho style', description: 'Bohemian double crown braid blending into beachy voluminous curls.' }
      ],
      services: [
        { id: 's2_1', name: 'Master Bridal Hair Styling & Trial Consultation', price: 950, durationMinutes: 150, description: 'Includes 90-minute trial session, veil/hairpiece placement, deep texture engineering, extension integration, and high-performance humidity sealing.' },
        { id: 's2_2', name: 'Bridal Party Hair Style (Blowout or Updo)', price: 150, durationMinutes: 45, description: 'Custom hair styling for bridal party members.' }
      ],
      trustScore: {
        score: 95,
        reliability: 98,
        authenticity: 94,
        repeatRate: 92,
        responseSpeed: 96,
        cancellationHistory: []
      },
      availability: ['2026-10-17T10:00:00Z', '2026-10-17T14:00:00Z', '2026-10-18T13:00:00Z', '2026-10-24T09:00:00Z'],
      featured: false,
      experienceYears: 10,
      certifications: ['Parisian Couture Hair Styling diploma', 'NYC Bridal Hair Academy'],
      badges: ['⭐ Client Favorite', '🏆 Top Performer'],
      verifiedStatus: 'verified',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "busy",
        "2026-10-24": "available",
        "2026-10-25": "available",
        "2026-10-31": "booked"
      }
    },
    {
      id: 'prov_giakim',
      name: 'Gia Kim',
      businessName: 'Gia Kim Radiant Bridal',
      category: 'bridal_studio',
      location: 'New York Metro',
      rating: 4.95,
      reviewCount: 56,
      priceRange: '$$$$',
      basePrice: 2200,
      about: 'Gia Kim provides elite all-in-one luxury packages encompassing both couture hair artistry and glass-skin makeup. Catering to VIP brides and high-fashion weddings, Gia ensures single-artist visual cohesion, using exclusively ultra-premium products. Featured in top bridal magazines.',
      avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Korean'],
      portfolio: [
        { id: 'p3_1', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80', title: 'Couture Glass-Skin Bride', description: 'Supernatural high-gloss face paired with an architectural sleek low-ponytail.' },
        { id: 'p3_2', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80', title: 'Royal Sophistication Styling', description: 'Regal crown placement, rich gold eye shadow accents, and sleek chignon updo.' }
      ],
      services: [
        { id: 's3_1', name: 'Elite All-in-One Full Bridal Package (Makeup & Hair)', price: 2200, durationMinutes: 240, description: 'Complete beauty experience for the bride. Includes premium skincare prep, glass-skin makeup application, couture hair design, 2 customized trial sessions, pre-ceremony touchups up to 4 hours, and premium custom extensions.' },
        { id: 's3_2', name: 'Second Day Custom Touchup/Vibe Change', price: 800, durationMinutes: 120, description: 'Perfect for multi-day weddings or transition from ceremony to high-energy reception look.' }
      ],
      trustScore: {
        score: 99,
        reliability: 100,
        authenticity: 98,
        repeatRate: 98,
        responseSpeed: 100,
        cancellationHistory: []
      },
      availability: ['2026-10-17T08:00:00Z', '2026-10-24T07:00:00Z'],
      featured: true,
      experienceYears: 14,
      certifications: ['Vidal Sassoon Academy London', 'Seoul Glass-Skin Master Certified'],
      badges: ['🏆 Top Performer', '💎 Premium Partner', '🔥 Fast Responder'],
      verifiedStatus: 'premium',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "booked",
        "2026-10-24": "available",
        "2026-10-25": "busy",
        "2026-10-31": "available"
      }
    },
    {
      id: 'prov_chloe',
      name: 'Chloe Dupre',
      businessName: 'Chloe Boho Bridal Hair',
      category: 'hair_stylist',
      location: 'New York Metro',
      rating: 4.7,
      reviewCount: 29,
      priceRange: '$$',
      basePrice: 800,
      about: 'Chloe specializes in airy, whimsical, dreamlike boho styles. Ideal for backyard, beach, vineyard, or barn weddings, she works with soft wisps, crown braids, and integrates real wildflowers into stunning, relaxed styles.',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'French'],
      portfolio: [
        { id: 'p4_1', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', title: 'Beachy Vine Crown', description: 'Relaxed messy waves with fresh eucalyptus and white rose vine crown.' }
      ],
      services: [
        { id: 's4_1', name: 'Bohemian Bridal Style and Wildflower integration', price: 800, durationMinutes: 120, description: 'Includes trial session, customized braided layout, botanical or floral weave, and high-hold flexible aerosol set.' }
      ],
      trustScore: {
        score: 92,
        reliability: 95,
        authenticity: 92,
        repeatRate: 88,
        responseSpeed: 93,
        cancellationHistory: []
      },
      availability: ['2026-10-17T11:00:00Z', '2026-10-18T10:00:00Z', '2026-10-24T12:00:00Z'],
      featured: false,
      experienceYears: 6,
      certifications: ['Paris Organic Hair Styling workshop'],
      badges: ['⭐ Client Favorite'],
      verifiedStatus: 'verified',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "available",
        "2026-10-24": "available"
      }
    },
    {
      id: 'prov_zara',
      name: 'Zara Ahmed',
      businessName: 'Zara Ahmed Editorial Beauty',
      category: 'makeup_artist',
      location: 'New York Metro',
      rating: 4.6,
      reviewCount: 22,
      priceRange: '$$$',
      basePrice: 1400,
      about: 'Zara Ahmed is an editorial bridal artist bringing runway-precision makeup to New York brides. She excels in dramatic smokey eyes, bold lip statements, and structured airbrushed complexions. Zara has a high cancellation rate in her past history (due to high-profile runway emergencies), which is strictly flagged on our platform as a risk metric, triggering the Emergency Backup System.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Urdu', 'Hindi'],
      portfolio: [
        { id: 'p5_1', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', title: 'High Contrast Glam', description: 'Deep plum lips, cut crease golden eye makeup, and razor sharp winged eyeliner.' }
      ],
      services: [
        { id: 's5_1', name: 'Editorial Bridal Airbrush Application', price: 1400, durationMinutes: 150, description: 'Complete high-definition airbrushed makeup session with customized faux-mink individual lashes and luxury standard trial.' }
      ],
      trustScore: {
        score: 72,
        reliability: 60,
        authenticity: 95,
        repeatRate: 85,
        responseSpeed: 75,
        cancellationHistory: ['Cancelled Booking #9021 within 48 hours in Oct 2025 due to Paris Fashion Week commitment.', 'Late cancellation of Booking #3121 in May 2025 due to agency schedule clash.']
      },
      availability: ['2026-10-17T09:00:00Z', '2026-10-24T10:00:00Z'],
      featured: false,
      experienceYears: 8,
      certifications: ['Runway Esthetics Certified 2019'],
      badges: ['🔥 Fast Responder'],
      verifiedStatus: 'none',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "busy",
        "2026-10-24": "available",
        "2026-10-31": "busy"
      }
    },
    {
      id: 'prov_marcella',
      name: 'Marcella De Luca',
      businessName: 'Marcella & Co. Full Bridal Atelier',
      category: 'bridal_studio',
      location: 'New York Metro',
      rating: 4.9,
      reviewCount: 61,
      priceRange: '$$$$',
      basePrice: 2500,
      about: 'Marcella & Co. offers elite full-atelier luxury services with hair, makeup, wardrobe styling, and on-site dressing assistance. A team of three senior artists ensures complete styling for the bride and up to four VIP guests with seamless precision.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Spanish'],
      portfolio: [
        { id: 'p6_1', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80', title: 'Luxury Estate Wedding Look', description: 'Perfect classical makeup paired with a clean chignon and customized white satin hairband.' }
      ],
      services: [
        { id: 's6_1', name: 'Platinum Full Atelier Package (Includes Bride & 4 Guests)', price: 2500, durationMinutes: 300, description: 'The absolute pinnacle of bridal styling. Complete makeup, hair, skincare prep, veil setting, and custom jewelry pairing. Accommodates the bride and 4 close wedding party members.' }
      ],
      trustScore: {
        score: 97,
        reliability: 99,
        authenticity: 95,
        repeatRate: 96,
        responseSpeed: 98,
        cancellationHistory: []
      },
      availability: ['2026-10-17T08:00:00Z', '2026-10-18T09:00:00Z', '2026-10-24T08:00:00Z'],
      featured: true,
      experienceYears: 15,
      certifications: ['Atelier Milani Bridal Wardrobe', 'Board Certified Cosmetologist'],
      badges: ['🏆 Top Performer', '⭐ Client Favorite'],
      verifiedStatus: 'premium',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "available",
        "2026-10-24": "available"
      }
    },
    {
      id: 'prov_priya',
      name: 'Priya Patel',
      businessName: 'Priya Patel Henna Couture',
      category: 'mehendi_artist',
      location: 'New York Metro',
      rating: 4.95,
      reviewCount: 48,
      priceRange: '$$',
      basePrice: 650,
      about: 'Priya Patel is a world-renowned Mehendi / Henna artist specializing in custom intricate bridal designs that blend traditional Rajasthani motifs with modern geometric concepts. Her custom stain formulation ensures rich, long-lasting mahogany coloration for your special celebrations.',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Gujarati', 'Hindi'],
      portfolio: [
        { id: 'p7_1', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', title: 'Royal Rajasthani Bridal Henna', description: 'Exquisite wrist-to-elbow patterns detailing standard wedding mandalas and narrative skylines.' }
      ],
      services: [
        { id: 's7_1', name: 'Premium Full Bridal Henna (Hands & Feet)', price: 650, durationMinutes: 240, description: 'Intricate custom henna application for both hands (front & back, up to elbows) and feet (up to ankles), including organic, chemical-free custom paste.' }
      ],
      trustScore: {
        score: 98,
        reliability: 100,
        authenticity: 98,
        repeatRate: 94,
        responseSpeed: 98,
        cancellationHistory: []
      },
      availability: ['2026-10-16T10:00:00Z', '2026-10-17T09:00:00Z'],
      featured: true,
      experienceYears: 9,
      certifications: ['Certified Organic Henna Artisan', 'Traditional Henna Guild'],
      badges: ['🏆 Top Performer', '🔥 Fast Responder'],
      verifiedStatus: 'premium',
      availabilityCalendar: {
        "2026-10-16": "available",
        "2026-10-17": "available",
        "2026-10-24": "available"
      }
    },
    {
      id: 'prov_luna',
      name: 'Luna Thorne',
      businessName: 'Luna Thorne Bridal Nail Artistry',
      category: 'nail_artist',
      location: 'New York Metro',
      rating: 4.85,
      reviewCount: 31,
      priceRange: '$$',
      basePrice: 250,
      about: 'Luna specializes in premium bridal nail styling, including delicate 3D lace overlays, hand-painted floral details, and luxury gel-extensions. Every set is structurally customized to withstand all wedding week activities without lifting.',
      avatarUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&auto=format&fit=crop&q=80',
      languages: ['English'],
      portfolio: [
        { id: 'p8_1', imageUrl: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=400&auto=format&fit=crop&q=80', title: 'Pearl Lace Gel Set', description: 'Intricate hand-painted white lace with authentic Swarovski mini pearl accents.' }
      ],
      services: [
        { id: 's8_1', name: 'Signature Bridal Gel Extension Package', price: 250, durationMinutes: 90, description: 'Premium soft gel full-extensions with choice of customized hand-painted nail art, crystal decals, and nourishing rosewater manicure prep.' }
      ],
      trustScore: {
        score: 94,
        reliability: 98,
        authenticity: 92,
        repeatRate: 90,
        responseSpeed: 95,
        cancellationHistory: []
      },
      availability: ['2026-10-15T11:00:00Z', '2026-10-17T13:00:00Z'],
      featured: false,
      experienceYears: 7,
      certifications: ['Gelish Elite Master Educator', 'Swarovski Authorized Nail Artist'],
      badges: ['⭐ Client Favorite'],
      verifiedStatus: 'verified',
      availabilityCalendar: {
        "2026-10-15": "available",
        "2026-10-17": "available",
        "2026-10-24": "available"
      }
    },
    {
      id: 'prov_vogue',
      name: 'Marcus Vance',
      businessName: 'Vogue Chelsea Bridal Salon',
      category: 'salon',
      location: 'New York Metro',
      rating: 4.75,
      reviewCount: 40,
      priceRange: '$$$',
      basePrice: 850,
      about: 'Vogue Chelsea is a full-service luxury bridal salon with a dedicated private wedding suite. We provide unified hair styling, facial treatments, and cosmetic prep for the bride and her bridal party with complete catering.',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'Spanish'],
      portfolio: [
        { id: 'p9_1', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&auto=format&fit=crop&q=80', title: 'Bridal Party Suite Experience', description: 'Unified sleek blowout styles for the bride and her 4 bridesmaids in our VIP suite.' }
      ],
      services: [
        { id: 's9_1', name: 'Private Suite Hair & Prep Package', price: 850, durationMinutes: 180, description: 'Private suite booking for 3 hours, includes custom hydrating facial prep, luxury master stylists, sparkling cider bar, and professional makeup touchups.' }
      ],
      trustScore: {
        score: 96,
        reliability: 98,
        authenticity: 95,
        repeatRate: 94,
        responseSpeed: 96,
        cancellationHistory: []
      },
      availability: ['2026-10-17T09:00:00Z', '2026-10-24T09:00:00Z'],
      featured: false,
      experienceYears: 15,
      certifications: ['Vogue Global Salon Partner', 'Esthetics Elite Certified'],
      badges: ['🏆 Top Performer', '⭐ Client Favorite'],
      verifiedStatus: 'top_rated',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-24": "available"
      }
    },
    {
      id: 'prov_glowco',
      name: 'Cynthia Sterling',
      businessName: 'Glow & Co. Bridal Beauty Concierge',
      category: 'wedding_beauty_partner',
      location: 'New York Metro',
      rating: 4.9,
      reviewCount: 52,
      priceRange: '$$$$',
      basePrice: 1500,
      about: 'Glow & Co. is a luxury wedding beauty concierge that coordinates multi-vendor beauty planning, trials, and standby emergency protection. We source pre-vetted specialists and provide full on-site coordination to ensure flawless timelines.',
      avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      languages: ['English', 'French'],
      portfolio: [
        { id: 'p10_1', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80', title: 'Flawless Multi-Artist Coordination', description: 'Seamless coordination for a wedding party of 12 with staggered beauty timelines.' }
      ],
      services: [
        { id: 's10_1', name: 'Complete Beauty Concierge & Timeline Management', price: 1500, durationMinutes: 360, description: 'Full coordination including personal beauty coordinator, timeline scheduling for up to 8 artists, skin-analysis consult, on-site assistance, and guaranteed emergency standby coverage.' }
      ],
      trustScore: {
        score: 98,
        reliability: 100,
        authenticity: 96,
        repeatRate: 97,
        responseSpeed: 99,
        cancellationHistory: []
      },
      availability: ['2026-10-17T08:00:00Z', '2026-10-24T08:00:00Z'],
      featured: true,
      experienceYears: 11,
      certifications: ['Certified Wedding Planner Association'],
      badges: ['🏆 Top Performer', '💎 Premium Partner'],
      verifiedStatus: 'premium',
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-18": "busy",
        "2026-10-24": "available"
      }
    }
  ];

  const initialBookings = [
    {
      id: 'b1_completed',
      userId: 'bride_demo',
      providerId: 'prov_sophia',
      providerBusinessName: 'Moretti Luxury Bridal Makeup',
      providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      date: '2026-05-15T10:00:00Z',
      serviceName: 'Premium Bridal Makeup + Trial Session',
      price: 1200,
      status: 'completed',
      notes: 'Completed trial session. Highlighted skin-forward tones, bride was extremely pleased.',
      createdAt: '2026-04-10T14:30:00Z'
    },
    {
      id: 'b2_confirmed',
      userId: 'bride_demo',
      providerId: 'prov_elena',
      providerBusinessName: 'Rostova Bridal Hair Elite',
      providerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      date: '2026-10-17T10:00:00Z',
      serviceName: 'Master Bridal Hair Styling & Trial Consultation',
      price: 950,
      status: 'confirmed',
      notes: 'Wedding day booking scheduled at hotel room.',
      createdAt: '2026-06-20T09:15:00Z'
    }
  ];

  const initialReviews = [
    {
      id: 'rev_1',
      providerId: 'prov_sophia',
      userId: 'bride_u1',
      userName: 'Isabella C.',
      userImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      content: 'Sophia is absolute magic! She did my wedding makeup in April, and I have never felt more radiant. She takes her time preparing the skin so the makeup literally stayed locked in place through 8 hours of sweating and tearful reception speeches! Literally worth every single dollar.',
      date: '2026-04-28',
      isGenuine: true,
      suspiciousFlags: [],
      createdAt: '2026-04-28T18:32:00Z'
    },
    {
      id: 'rev_2',
      providerId: 'prov_sophia',
      userId: 'bride_u2',
      userName: 'Megan K.',
      rating: 5,
      content: 'Highly professional experience from start to finish. Her attention to hygiene and customized makeup techniques was incredible. Truly a trust-first experience.',
      date: '2026-05-12',
      isGenuine: true,
      suspiciousFlags: [],
      createdAt: '2026-05-12T11:20:00Z'
    },
    {
      id: 'rev_fake_sophia',
      providerId: 'prov_sophia',
      userId: 'competitor_bot_3',
      userName: 'Ashley Smith',
      rating: 1,
      content: 'HORRIBLE EXPERIENCE!!!! SHE CANCELLED ON ME AT THE LAST MINUTE AND RUINED MY LITERALLY WEDDING!!!!! NEVER TRUST THIS PERSON!!!!! SCAM ALERT SCAM ALERT DO NOT BOOK!!!!!',
      date: '2026-06-18',
      isGenuine: false,
      suspiciousFlags: ['exclamation_spam', 'keyword_repetition', 'high_caps_density'],
      analysisReasoning: 'Review flagged automatically by local rule analyzer due to extreme capital letters, spam phrasing (SCAM ALERT, LITERALLY), multiple rapid exclamation marks, and complete lack of booking confirmation matching the reviewer identity.',
      createdAt: '2026-06-18T05:10:00Z'
    },
    {
      id: 'rev_3',
      providerId: 'prov_elena',
      userId: 'bride_u3',
      userName: 'Catherine L.',
      rating: 5,
      content: 'Elena sculpted the most beautiful vintage Hollywood waves for my wedding! Living in a high-humidity area, I was terrified they would fall flat, but they looked phenomenal and structured until 2 AM! Incredible craftsmanship.',
      date: '2026-05-30',
      isGenuine: true,
      suspiciousFlags: [],
      createdAt: '2026-05-30T22:15:00Z'
    }
  ];

  const initialSavedProviders = [
    { id: 's1', userId: 'bride_demo', providerId: 'prov_sophia', createdAt: '2026-06-20T10:00:00Z' }
  ];

  const initialInspirations = [
    {
      id: 'ins_1',
      userId: 'bride_demo',
      imageUrl: 'https://images.unsplash.com/photo-1596162954151-cd541786592c?w=500&auto=format&fit=crop&q=80',
      title: 'Dewy Skin & Classic Liner',
      category: 'Makeup',
      tags: ['Dewy', 'Classic', 'Neutral'],
      createdAt: '2026-06-21T11:00:00Z'
    },
    {
      id: 'ins_2',
      userId: 'bride_demo',
      imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
      title: 'Romantic Loose Chignon Updo',
      category: 'Hair',
      tags: ['Textured', 'Updo', 'Floral'],
      createdAt: '2026-06-22T09:30:00Z'
    }
  ];

  const initialPlannerTasks = [
    { id: 't1', userId: 'bride_demo', title: 'Book Makeup Trial Consultation', dueDate: '2026-07-15', category: 'Trial', completed: true },
    { id: 't2', userId: 'bride_demo', title: 'Finalize Hair Styling Look & extensions', dueDate: '2026-08-01', category: 'Trial', completed: false },
    { id: 't3', userId: 'bride_demo', title: 'Hydration skincare regime daily lock-in', dueDate: '2026-09-01', category: 'Skincare', completed: false },
    { id: 't4', userId: 'bride_demo', title: 'Approve backup artist allocation & trust metrics', dueDate: '2026-09-15', category: 'Booking', completed: false }
  ];

  const initialRiskAlerts = [
    {
      id: 'alt_1',
      type: 'suspicious_review',
      severity: 'high',
      title: 'Malicious Competitor Bot Pattern Detected',
      description: 'A 1-star review written by user Ashley Smith against Moretti Luxury Bridal Makeup was flagged as highly probable malicious intent due to exclamation spamming, capital lock, and copy-pasted fraud phrases.',
      targetId: 'prov_sophia',
      targetName: 'Sophia Moretti',
      date: '2026-06-18T05:10:00Z',
      resolved: false
    },
    {
      id: 'alt_2',
      type: 'high_cancellation',
      severity: 'medium',
      title: 'Provider Autumn Runway Schedule Clashing',
      description: 'Zara Ahmed has a historic cancellations score below 70% during New York Fashion Week dates (Oct 12-20). Auto-assigned Emergency Backup is standby-ready.',
      targetId: 'prov_zara',
      targetName: 'Zara Ahmed',
      date: '2026-06-24T14:22:00Z',
      resolved: false
    }
  ];

  return {
    users: initialUsers,
    providers: initialProviders,
    bookings: initialBookings,
    reviews: initialReviews,
    savedProviders: initialSavedProviders,
    inspirations: initialInspirations,
    plannerTasks: initialPlannerTasks,
    riskAlerts: initialRiskAlerts
  };
}

// Load database state
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error loading database.json, re-initializing...', e);
      const data = getInitialData();
      saveDB(data);
      return data;
    }
  } else {
    const data = getInitialData();
    saveDB(data);
    return data;
  }
}

// Save database state
function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database.json:', e);
  }
}

// Helper to compute compatibility score dynamically
function computeCompatibilityScore(bride: any, provider: any) {
  if (!bride || bride.role !== 'bride') return { overall: 85, budgetFit: 85, locationFit: 90, styleFit: 80, serviceFit: 85 };

  // 1. Budget Fit (0-100)
  // If base price is below or equal to budget, 100%. If more, score scales down.
  const budget = bride.budget || 2000;
  let budgetFit = 100;
  if (provider.basePrice > budget) {
    const differenceRatio = (provider.basePrice - budget) / budget;
    budgetFit = Math.max(20, Math.round(100 - differenceRatio * 150));
  } else {
    // If provider is way below budget, it is also a great fit
    const unusedRatio = (budget - provider.basePrice) / budget;
    budgetFit = Math.round(100 - unusedRatio * 30); // small penalty if too cheap for high luxury preferences
  }

  // 2. Location Fit (0-100)
  const brideLoc = bride.location || 'New York Metro';
  const locationFit = provider.location === brideLoc ? 100 : 40;

  // 3. Style Fit (0-100)
  const preferredStyle = (bride.preferences && bride.preferences.style) || 'Classic';
  // Check portfolio details or defaults
  let styleFit = 80;
  const portfolioMatches = provider.portfolio.some((p: any) =>
    p.title.toLowerCase().includes(preferredStyle.toLowerCase()) ||
    p.description.toLowerCase().includes(preferredStyle.toLowerCase())
  );
  if (portfolioMatches) {
    styleFit = 100;
  } else if (provider.about.toLowerCase().includes(preferredStyle.toLowerCase())) {
    styleFit = 95;
  } else {
    styleFit = 75; // general beauty artist compatibility
  }

  // 4. Service Fit (0-100)
  const neededServices = (bride.preferences && bride.preferences.servicesNeeded) || ['Makeup'];
  let matchedCount = 0;
  neededServices.forEach((service: string) => {
    // Check if category matches or services array matches
    const hasCategory = provider.category === 'All-in-One' ||
      (provider.category === 'Makeup' && service.toLowerCase().includes('makeup')) ||
      (provider.category === 'Hair' && service.toLowerCase().includes('hair'));

    const hasServiceInList = provider.services.some((s: any) =>
      s.name.toLowerCase().includes(service.toLowerCase())
    );

    if (hasCategory || hasServiceInList) {
      matchedCount++;
    }
  });
  const serviceFit = neededServices.length > 0 ? Math.round((matchedCount / neededServices.length) * 100) : 100;

  const overall = Math.round((budgetFit * 0.35) + (locationFit * 0.20) + (styleFit * 0.25) + (serviceFit * 0.20));

  return {
    overall,
    budgetFit,
    locationFit,
    styleFit,
    serviceFit
  };
}

// Local regex and keyword Review Analyzer (fallback or pre-filter)
function analyzeReviewTextLocally(content: string, rating: number): { isGenuine: boolean; suspiciousFlags: string[]; explanation: string } {
  const flags: string[] = [];
  const lower = content.toLowerCase();

  // Exclamation abuse
  const exclamations = (content.match(/!/g) || []).length;
  if (exclamations > 4) {
    flags.push('exclamation_spam');
  }

  // Caps density
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const lettersCount = (content.match(/[a-zA-Z]/g) || []).length;
  if (lettersCount > 20 && (capsCount / lettersCount) > 0.4) {
    flags.push('high_caps_density');
  }

  // Suspicious repetitive competitor/spam word triggers
  const scamKeywords = ['scam', 'fraud', 'ruined my wedding', 'competitor', 'fake profile', 'stole my money', 'do not book', 'never book', 'scam alert'];
  const matchedKeywords = scamKeywords.filter(k => lower.includes(k));
  if (matchedKeywords.length >= 2) {
    flags.push('keyword_repetition');
  }

  // Highly extreme ratings paired with brief, hyperbolic phrasing
  if (rating === 1 && content.length < 50 && (lower.includes('worst') || lower.includes('hate') || lower.includes('awful'))) {
    flags.push('low_substance_hyperbole');
  }

  const isGenuine = flags.length < 2;
  let explanation = '';
  if (!isGenuine) {
    explanation = `Flagged automatically due to: ${flags.join(', ')}. Review exhibits high caps density, repetitive exclamation use, or specific competitor defamation keywords without standard verification.`;
  }

  return { isGenuine, suspiciousFlags: flags, explanation };
}

function getUserIdFromRequest(req: any): string {
  if (req.headers['x-user-id']) {
    return req.headers['x-user-id'] as string;
  }
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c: string) => {
      const parts = c.trim().split('=');
      const key = parts[0];
      const val = parts.slice(1).join('=');
      if (key && val) acc[key] = decodeURIComponent(val);
      return acc;
    }, {});
    if (cookies.active_user_uid) {
      return cookies.active_user_uid;
    }
  }
  if (req.query.userId) {
    return req.query.userId as string;
  }
  return 'bride_demo';
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // SEED AND GET DATA API
  app.get('/api/data', (req, res) => {
    const dbData = loadDB();
    const userId = getUserIdFromRequest(req);
    
    // Auto-create basic user profile if not exists
    let user = dbData.users.find((u: any) => u.id === userId);
    if (!user && userId !== 'bride_demo' && userId !== 'provider_sophiamoretti' && userId !== 'founder_demo') {
      user = {
        id: userId,
        name: (req.query.name as string) || 'New Bride',
        email: (req.query.email as string) || '',
        role: (req.query.role as string) || 'bride',
        weddingDate: '2026-10-17',
        budget: 2500,
        location: 'New York Metro',
        preferences: {
          style: 'Classic',
          skinType: 'Combination',
          hairType: 'Wavy',
          servicesNeeded: ['Makeup', 'Hair Styling']
        }
      };
      dbData.users.push(user);
      saveDB(dbData);
    }
    res.json(dbData);
  });

  app.post('/api/init-database', (req, res) => {
    const freshData = getInitialData();
    saveDB(freshData);
    res.json({ message: 'Database reset successfully', data: freshData });
  });

  // GET PROVIDERS WITH COMPATIBILITY
  app.get('/api/providers', (req, res) => {
    const dbData = loadDB();
    const userId = getUserIdFromRequest(req);
    const brideUser = dbData.users.find((u: any) => u.id === userId);

    // Append computed compatibility scores
    const mappedProviders = dbData.providers.map((p: any) => {
      const compatibility = computeCompatibilityScore(brideUser, p);
      return {
        ...p,
        compatibilityScore: compatibility
      };
    });

    res.json(mappedProviders);
  });

  // UPDATE BRIDE PROFILE
  app.post('/api/profile', (req, res) => {
    const dbData = loadDB();
    const { name, weddingDate, budget, location, preferences } = req.body;
    const userId = getUserIdFromRequest(req);

    const brideIndex = dbData.users.findIndex((u: any) => u.id === userId);
    if (brideIndex !== -1) {
      dbData.users[brideIndex] = {
        ...dbData.users[brideIndex],
        name: name || dbData.users[brideIndex].name,
        weddingDate: weddingDate || dbData.users[brideIndex].weddingDate,
        budget: Number(budget) || dbData.users[brideIndex].budget,
        location: location || dbData.users[brideIndex].location,
        preferences: preferences || dbData.users[brideIndex].preferences
      };
      saveDB(dbData);
      res.json({ success: true, user: dbData.users[brideIndex] });
    } else {
      res.status(404).json({ error: 'Bride profile not found' });
    }
  });

  // SAVED PROVIDERS TOGGLE
  app.post('/api/saved-providers', (req, res) => {
    const dbData = loadDB();
    const { providerId } = req.body;
    const userId = getUserIdFromRequest(req);

    const existingIndex = dbData.savedProviders.findIndex((sp: any) => sp.userId === userId && sp.providerId === providerId);

    if (existingIndex !== -1) {
      // Remove
      dbData.savedProviders.splice(existingIndex, 1);
      saveDB(dbData);
      res.json({ success: true, saved: false, message: 'Provider removed from favorites' });
    } else {
      // Add
      const newSaved = {
        id: 'sp_' + Math.random().toString(36).substring(2, 9),
        userId,
        providerId,
        createdAt: new Date().toISOString()
      };
      dbData.savedProviders.push(newSaved);
      saveDB(dbData);
      res.json({ success: true, saved: true, item: newSaved, message: 'Provider added to favorites!' });
    }
  });

  // BOOKING CREATION WITH AUTOMATIC EMERGENCY BACKUP ALLOCATION
  app.post('/api/bookings', (req, res) => {
    const dbData = loadDB();
    const { providerId, date, serviceName, price, notes } = req.body;
    const userId = getUserIdFromRequest(req);

    const provider = dbData.providers.find((p: any) => p.id === providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Beauty artist not found' });
    }

    const newBooking = {
      id: 'b_' + Math.random().toString(36).substring(2, 9),
      userId,
      providerId,
      providerBusinessName: provider.businessName,
      providerAvatar: provider.avatarUrl,
      date,
      serviceName,
      price: Number(price),
      status: 'pending' as const,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    dbData.bookings.push(newBooking);
    saveDB(dbData);
    res.json({ success: true, booking: newBooking });
  });

  // STATUS CHANGE WITH EMERGENCY BACKUP CO-TRIGGERING
  app.post('/api/bookings/:id/status', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;
    const { status } = req.body;

    const bookingIndex = dbData.bookings.findIndex((b: any) => b.id === id);
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const originalBooking = dbData.bookings[bookingIndex];
    let updatedBooking = { ...originalBooking, status };

    // Emergency Backup System:
    // If a booking is cancelled, or explicitly triggers cancellation, allocate alternative
    if (status === 'cancelled') {
      // Find a highly compatible provider in the same category to allocate as fallback
      const originalProvider = dbData.providers.find((p: any) => p.id === originalBooking.providerId);
      const category = originalProvider ? originalProvider.category : 'Makeup';

      // Find alternative provider who is NOT the original one and has a very high trust score (>94)
      const standbyProvider = dbData.providers.find((p: any) =>
        p.id !== originalBooking.providerId &&
        (p.category === category || p.category === 'All-in-One') &&
        p.trustScore.score >= 94
      );

      if (standbyProvider) {
        updatedBooking.emergencyBackupAssigned = true;
        updatedBooking.backupProviderId = standbyProvider.id;
        updatedBooking.backupProviderName = standbyProvider.businessName;

        // Log a system backup alert in risk alerts or notifications
        dbData.riskAlerts.push({
          id: 'alt_backup_' + Math.random().toString(36).substring(2, 9),
          type: 'high_cancellation',
          severity: 'medium',
          title: 'Emergency Backup Protection Triggered',
          description: `Booking #${id} with ${originalBooking.providerBusinessName} was cancelled. BridalTrust automated Emergency Backup instantly routed standby-ready ${standbyProvider.businessName} (Trust Score: ${standbyProvider.trustScore.score}%) to lock down the slot.`,
          targetId: standbyProvider.id,
          targetName: standbyProvider.businessName,
          date: new Date().toISOString(),
          resolved: true
        });
      }
    }

    dbData.bookings[bookingIndex] = updatedBooking;
    saveDB(dbData);
    res.json({ success: true, booking: updatedBooking });
  });

  // POST REVIEW WITH AI INTELLIGENCE REVIEW ANALYZER
  app.post('/api/reviews', async (req, res) => {
    const dbData = loadDB();
    const { providerId, content, rating } = req.body;
    const userId = getUserIdFromRequest(req);
    const userProfile = dbData.users.find((u: any) => u.id === userId) || { name: 'Sarah Jenkins' };

    const providerIndex = dbData.providers.findIndex((p: any) => p.id === providerId);
    if (providerIndex === -1) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const reviewId = 'rev_' + Math.random().toString(36).substring(2, 9);
    const newReview: any = {
      id: reviewId,
      providerId,
      userId,
      userName: `${userProfile.name} (You)`,
      rating: Number(rating),
      content,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      isGenuine: true,
      suspiciousFlags: []
    };

    // Stage 1: Local inspection
    const localResult = analyzeReviewTextLocally(content, rating);
    newReview.isGenuine = localResult.isGenuine;
    newReview.suspiciousFlags = localResult.suspiciousFlags;
    newReview.analysisReasoning = localResult.explanation;

    // Stage 2: Gemini Deep Review Analyzer (if available)
    if (ai) {
      try {
        const prompt = `Analyze this bridal beauty professional review for authenticity and flags.
Professional: ${dbData.providers[providerIndex].businessName}
Reviewer: Sarah Jenkins
Rating: ${rating} out of 5 stars
Review Content: "${content}"

Analyze if this exhibits signs of:
1. Fake review bot pattern / competitor attack (highly toxic, generic, exclamation-point spamming, extreme caps).
2. Competitor self-promotion (e.g. promoting another service in review).
3. Copy-pasted standard marketing templates.

Provide your output in valid raw JSON with this exact schema:
{
  "isGenuine": boolean,
  "suspiciousFlags": string[], // Choose from: ["exclamation_spam", "high_caps_density", "keyword_repetition", "marketing_jargon", "competitor_clash", "low_substance_hyperbole"]
  "analysisReasoning": "Provide brief 2-sentence explanation of why it is flagged or marked genuine"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isGenuine: { type: Type.BOOLEAN },
                suspiciousFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                analysisReasoning: { type: Type.STRING }
              },
              required: ['isGenuine', 'suspiciousFlags', 'analysisReasoning']
            }
          }
        });

        const rawText = response.text || '{}';
        const aiResult = JSON.parse(rawText.trim());

        newReview.isGenuine = aiResult.isGenuine;
        newReview.suspiciousFlags = aiResult.suspiciousFlags || [];
        newReview.analysisReasoning = `[AI Verified Analyzer] ${aiResult.analysisReasoning}`;

      } catch (err) {
        console.error('Gemini Review Analysis error, defaulting to local rules:', err);
      }
    }

    // If the review is malicious or suspicious, register risk alerts on Founder dashboard
    if (!newReview.isGenuine) {
      dbData.riskAlerts.push({
        id: 'alt_' + Math.random().toString(36).substring(2, 9),
        type: 'suspicious_review',
        severity: 'high',
        title: 'Review Authenticity Alert triggered',
        description: `Review #${reviewId} on ${dbData.providers[providerIndex].businessName} was auto-flagged. Flags: ${newReview.suspiciousFlags.join(', ')}. Details: ${newReview.analysisReasoning}`,
        targetId: providerId,
        targetName: dbData.providers[providerIndex].businessName,
        date: new Date().toISOString(),
        resolved: false
      });

      // Recalculate provider's Trust Score (decrease authenticity metric)
      const currentTrust = dbData.providers[providerIndex].trustScore;
      currentTrust.authenticity = Math.max(40, currentTrust.authenticity - 15);
      currentTrust.score = Math.round(
        (currentTrust.reliability * 0.3) +
        (currentTrust.authenticity * 0.3) +
        (currentTrust.repeatRate * 0.2) +
        (currentTrust.responseSpeed * 0.2)
      );
    } else {
      // Normal behavior: recalculate rating and count
      const currentReviews = dbData.reviews.filter((r: any) => r.providerId === providerId && r.isGenuine);
      const totalRatingsSum = currentReviews.reduce((sum: number, r: any) => sum + r.rating, 0) + Number(rating);
      const newCount = currentReviews.length + 1;
      dbData.providers[providerIndex].rating = Number((totalRatingsSum / newCount).toFixed(2));
      dbData.providers[providerIndex].reviewCount = newCount;
    }

    dbData.reviews.unshift(newReview);
    saveDB(dbData);
    res.json({ success: true, review: newReview, provider: dbData.providers[providerIndex] });
  });

  // INSPIRATION AND TASKS
  app.post('/api/inspirations', (req, res) => {
    const dbData = loadDB();
    const { title, imageUrl, category, tags, notes } = req.body;
    const userId = getUserIdFromRequest(req);

    const newItem = {
      id: 'ins_' + Math.random().toString(36).substring(2, 9),
      userId,
      imageUrl,
      title,
      category,
      tags: tags || [],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    dbData.inspirations.unshift(newItem);
    saveDB(dbData);
    res.json({ success: true, item: newItem });
  });

  app.delete('/api/inspirations/:id', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;

    const index = dbData.inspirations.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      dbData.inspirations.splice(index, 1);
      saveDB(dbData);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Inspiration not found' });
    }
  });

  app.post('/api/planner-tasks', (req, res) => {
    const dbData = loadDB();
    const { title, dueDate, category } = req.body;
    const userId = getUserIdFromRequest(req);

    const newTask = {
      id: 't_' + Math.random().toString(36).substring(2, 9),
      userId,
      title,
      dueDate,
      category: category || 'General',
      completed: false
    };

    dbData.plannerTasks.push(newTask);
    saveDB(dbData);
    res.json({ success: true, task: newTask });
  });

  app.post('/api/planner-tasks/:id/toggle', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;

    const index = dbData.plannerTasks.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      dbData.plannerTasks[index].completed = !dbData.plannerTasks[index].completed;
      saveDB(dbData);
      res.json({ success: true, task: dbData.plannerTasks[index] });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  });

  app.delete('/api/planner-tasks/:id', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;

    const index = dbData.plannerTasks.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      dbData.plannerTasks.splice(index, 1);
      saveDB(dbData);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  });

  // RESOLVE RISK ALERT (FOUNDER MODE)
  app.post('/api/risk-alerts/:id/resolve', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;

    const index = dbData.riskAlerts.findIndex((alt: any) => alt.id === id);
    if (index !== -1) {
      dbData.riskAlerts[index].resolved = true;
      saveDB(dbData);
      res.json({ success: true, alert: dbData.riskAlerts[index] });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  // PROVIDER PORTFOLIO UPLOAD SIMULATION
  app.post('/api/providers/:id/portfolio', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;
    const { imageUrl, title, description } = req.body;

    const providerIndex = dbData.providers.findIndex((p: any) => p.id === id);
    if (providerIndex === -1) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const newItem = {
      id: 'p_port_' + Math.random().toString(36).substring(2, 9),
      imageUrl,
      title,
      description
    };

    dbData.providers[providerIndex].portfolio.push(newItem);
    saveDB(dbData);
    res.json({ success: true, item: newItem, provider: dbData.providers[providerIndex] });
  });

  // PROVIDER GENERAL PROFILE UPDATE
  app.post('/api/providers/:id/profile', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;
    const { businessName, about, basePrice, languages, category } = req.body;

    const index = dbData.providers.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    dbData.providers[index] = {
      ...dbData.providers[index],
      businessName: businessName || dbData.providers[index].businessName,
      about: about || dbData.providers[index].about,
      basePrice: basePrice ? Number(basePrice) : dbData.providers[index].basePrice,
      languages: languages || dbData.providers[index].languages,
      category: category || dbData.providers[index].category
    };

    saveDB(dbData);
    res.json({ success: true, provider: dbData.providers[index] });
  });

  // UPDATE PROVIDER CALENDAR
  app.post('/api/providers/:id/calendar', (req, res) => {
    const dbData = loadDB();
    const { id } = req.params;
    const { calendar } = req.body;

    const index = dbData.providers.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    dbData.providers[index].availabilityCalendar = {
      ...dbData.providers[index].availabilityCalendar,
      ...calendar
    };

    saveDB(dbData);
    res.json({ success: true, calendar: dbData.providers[index].availabilityCalendar });
  });

  // REGISTER NEW PARTNER/PROVIDER
  app.post('/api/providers/register', (req, res) => {
    const dbData = loadDB();
    const { id, name, businessName, category, basePrice, location, about } = req.body;

    const newId = id || 'prov_' + Math.random().toString(36).substring(2, 9);
    const newProvider = {
      id: newId,
      name,
      businessName: businessName || `${name} Bridal Styling`,
      category: category || 'makeup_artist',
      location: location || 'New York Metro',
      rating: 5.0,
      reviewCount: 0,
      priceRange: '$$$' as const,
      basePrice: Number(basePrice) || 800,
      about: about || 'A passion-driven bridal beauty artist committed to making you look stunning and feel completely confident on your wedding day.',
      avatarUrl: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1544005313-94ddf0286df2', '1508214751196-bcfd4ca60f91', '1580489944761-15a19d654956'][Math.floor(Math.random() * 4)]}?w=150&auto=format&fit=crop&q=80`,
      languages: ['English'],
      portfolio: [],
      services: [
        { id: 's_' + Math.random().toString(36).substring(2, 5), name: 'Standard Bridal Package', price: Number(basePrice) || 800, durationMinutes: 120, description: 'Complete personalized styling including detailed consultation and wedding-day session.' }
      ],
      trustScore: {
        score: 95,
        reliability: 100,
        authenticity: 100,
        repeatRate: 90,
        responseSpeed: 95,
        cancellationHistory: []
      },
      availability: ['2026-10-17T10:00:00Z', '2026-10-24T10:00:00Z'],
      featured: false,
      experienceYears: 5,
      certifications: ['Certified Wedding Specialist'],
      badges: ['⭐ Client Favorite'],
      verifiedStatus: 'verified' as const,
      availabilityCalendar: {
        "2026-10-17": "available",
        "2026-10-24": "available"
      }
    };

    dbData.providers.push(newProvider);
    saveDB(dbData);
    res.json({ success: true, provider: newProvider });
  });

  // AI BRIDAL BEAUTY ASSISTANT PROXY HANDLER (using Gemini 3.5 Flash)
  app.post('/api/gemini/assistant', async (req, res) => {
    const { message, chatHistory } = req.body;
    const dbData = loadDB();
    const userId = getUserIdFromRequest(req);

    // Prepare information about our trusted beauty providers to give highly contextual answers!
    const providerListSummary = dbData.providers.map((p: any) => {
      return `- **${p.businessName}** (${p.category} Specialist based in ${p.location}). Base Price: ₹${p.basePrice}. Overall Trust Score: ${p.trustScore.score}%. Key styles: ${p.portfolio.map((port: any) => port.title).join(', ')}. Languages: ${p.languages.join(', ')}.`;
    }).join('\n');

    const brideUser = dbData.users.find((u: any) => u.id === userId);
    const brideContext = brideUser
      ? `Current Bride: ${brideUser.name}. Wedding Date: ${brideUser.weddingDate}. Budget: ₹${brideUser.budget}. Location: ${brideUser.location}. Style Preference: ${brideUser.preferences?.style}. Hair Type: ${brideUser.preferences?.hairType}. Skin Type: ${brideUser.preferences?.skinType}. Services Needed: ${brideUser.preferences?.servicesNeeded?.join(', ')}.`
      : 'No specific bride profile active yet.';

    const systemInstruction = `You are the BridalTrust AI Beauty Assistant, a highly sophisticated, sympathetic, and professional beauty planner. 
You help brides plan their wedding skincare routines, find perfect hair and makeup styles (timeless classic, boho-chic, red carpet soft-glam, bold editorial), and suggest suitable elite beauty professionals from our highly trusted, screened, and verified list.

Here is the current bride context to customize your suggestions:
${brideContext}

Our curated database of trusted, verified beauty professionals on the BridalTrust platform:
${providerListSummary}

Guidelines for your responses:
1. Speak with elegant, luxury wedding tone (warm, supportive, confident, and premium).
2. Use formatting (bullet points, bold highlights) to make reading delightful and stress-free.
3. Suggest specific skincare preparation advice or hair styles matching the bride's details (e.g. skinType: ${brideUser?.preferences?.skinType || 'Combination'}, hairType: ${brideUser?.preferences?.hairType || 'Wavy'}).
4. Recommend matching professionals from our database based on their requested style, services needed, budget alignment, and high trust ratings.
5. Emphasize that BridalTrust verifies every professional's trust metrics (authenticity, reliability, response speed) to protect their big day. Mention our automated Emergency Backup Standby System that guarantees alternative elite talent instantly if any cancellation occurs.

Be friendly, direct, and concise (do not make your replies overly long; keep them engaging).`;

    if (ai) {
      try {
        // Construct standard contents format with history if present
        const contents: any[] = [];

        // Map previous history if passed
        if (chatHistory && Array.isArray(chatHistory)) {
          chatHistory.forEach((msg: { role: string; content: string }) => {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            });
          });
        }

        // Add latest message
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        res.json({ reply: response.text });
      } catch (err: any) {
        console.error('Gemini Assistant call failed:', err);
        res.json({
          reply: `I would love to help you plan your bridal look, but my AI core is currently refreshing. 

Let me give you some quick local guidance: based on your preferences, I highly recommend checking out **${dbData.providers[0]?.businessName}** for classic beauty or **${dbData.providers[1]?.businessName}** for beautiful hair waves. Both maintain perfect Trust Scores above 95% on our platform!`,
          error: err.message
        });
      }
    } else {
      // Local fallback simulation if API key is not present
      res.json({
        reply: `Hello Sarah! As your BridalTrust Assistant, I am here to design your wedding day look. 

Based on your active profile:
- **Wedding Date:** ${brideUser?.weddingDate || 'October 17'}
- **Style Preference:** **${brideUser?.preferences?.style || 'Classic'}**
- **Budget:** Up to **₹${brideUser?.budget || '2500'}**

Here is my bespoke recommendation:
1. **Skincare prep:** Since you have **${brideUser?.preferences?.skinType || 'Combination'}** skin, focus on daily lightweight double-hydration and avoid raw exfoliants 3 weeks prior to trial day.
2. **Bespeak Professional matches:**
   - **Moretti Luxury Bridal Makeup** (${dbData.providers[0]?.name}) is a flawless match for your **Classic** style and fits within your budget perfectly! Her trust score is a perfect **98%**.
   - **Rostova Bridal Hair Elite** is your hair booking. She has beautiful textured updos matching your **wavy** hair!

How can I help you customize your planner or schedule your upcoming trials?`
      });
    }
  });

  // VITE DEVELOPMENT MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BridalTrust Startup Server booting in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server ingress established at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal Server Boot Error:', error);
});
