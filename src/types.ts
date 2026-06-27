/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  BRIDE = 'bride',
  PROVIDER = 'provider',
  FOUNDER = 'founder'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  weddingDate?: string;
  budget?: number;
  location?: string;
  preferences?: {
    style: string;         // e.g. "Natural", "Glamour", "Classic", "Bohemian"
    skinType: string;      // e.g. "Dry", "Oily", "Combination", "Normal"
    hairType: string;      // e.g. "Straight", "Wavy", "Curly", "Coily"
    servicesNeeded: string[]; // e.g. ["Makeup", "Hair Styling", "Lash Extension"]
  };
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface ServiceDetail {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface TrustScoreDetails {
  score: number;             // Overall Trust Score (0-100)
  reliability: number;       // Keep commitments, attendance (0-100)
  authenticity: number;      // Review verification rate (0-100)
  repeatRate: number;        // Brides returning or referring (0-100)
  responseSpeed: number;     // Average response time score (0-100)
  cancellationHistory: string[]; // List of historical cancellation notes (or empty if clean)
}

export interface CompatibilityScoreDetails {
  overall: number;           // Calculated compatibility percentage (0-100)
  budgetFit: number;         // Score on how well budget aligns (0-100)
  locationFit: number;       // Distance/willingness to travel (0-100)
  styleFit: number;          // Match between requested & portfolio styles (0-100)
  serviceFit: number;        // Availability of desired services (0-100)
}

export interface BeautyProvider {
  id: string;
  name: string;
  businessName: string;
  category: 'Makeup' | 'Hair' | 'Stylist' | 'All-in-One' | 'makeup_artist' | 'hair_stylist' | 'mehendi_artist' | 'nail_artist' | 'salon' | 'bridal_studio' | 'wedding_beauty_partner';
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: '$$' | '$$$' | '$$$$';
  basePrice: number;
  about: string;
  avatarUrl: string;
  languages: string[];
  portfolio: PortfolioItem[];
  services: ServiceDetail[];
  trustScore: TrustScoreDetails;
  availability: string[]; // array of ISO date strings or timeslot keys
  featured?: boolean;
  experienceYears?: number;
  certifications?: string[];
  badges?: string[];
  verifiedStatus?: 'verified' | 'premium' | 'top_rated' | 'none';
  availabilityCalendar?: { [dateStr: string]: 'available' | 'busy' | 'booked' };
}

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  providerBusinessName: string;
  providerAvatar: string;
  date: string;
  serviceName: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  emergencyBackupAssigned?: boolean;
  backupProviderId?: string;
  backupProviderName?: string;
}

export interface Review {
  id: string;
  providerId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  content: string;
  date: string;
  isGenuine: boolean;
  suspiciousFlags: string[];
  analysisReasoning?: string;
  createdAt: string;
}

export interface SavedProvider {
  id: string;
  userId: string;
  providerId: string;
  createdAt: string;
}

export interface InspirationItem {
  id: string;
  userId: string;
  imageUrl: string;
  title: string;
  category: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface PlannerTask {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  category: 'Skincare' | 'Trial' | 'Booking' | 'General';
  completed: boolean;
}

export interface RiskAlert {
  id: string;
  type: 'suspicious_review' | 'high_cancellation' | 'low_response' | 'unusual_pricing';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  targetId: string; // e.g. providerId or reviewId
  targetName: string;
  date: string;
  resolved: boolean;
}

export interface FounderAnalytics {
  totalUsers: number;
  totalProviders: number;
  activeBookings: number;
  totalRevenue: number;
  averageTrustScore: number;
  flaggedReviewsCount: number;
  growthRate: number; // e.g. percentage monthly growth
}
