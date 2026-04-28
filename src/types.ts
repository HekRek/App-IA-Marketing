
export interface OwnerProfile {
  name: string;
  email: string;
  personalUrl: string;
  companyUrl: string;
  sector: string;
  location: string;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  sector: string;
  location: string;
  strengths: string[];
  weaknesses: string[];
  valueProposition: string;
}

export interface AuditResult {
  improvements: string[];
  lastUpdate: string;
}

export interface ICP {
  sector: string;
  companySize: string;
  location: string;
  problemSolved: string;
  budgetRange: string;
  preferredChannel: string;
  urgency: 'Alta' | 'Media' | 'Baja';
  marketingIdeas?: string[];
}

export interface Lead {
  id: string;
  companyName: string;
  sector: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  source: string;
  estimatedRevenue: string;
  addedAt: string;
  notes: string;
  score: number; // Precision result (0-100)
}

export interface NewsletterTemplate {
  subject: string;
  intro: string;
  body: string;
  cta: string;
}

export interface BannerTemplate {
  title: string;
  subtitle: string;
  ctaButton: string;
}

export interface MarketingCampaign {
  id: string;
  timestamp: string;
  type: string; // "Lab Result" or "Campaign"
  title: string;
  slogan?: string;
  ideas?: string[];
  newsletter?: NewsletterTemplate;
  flyer?: string;
  banner?: BannerTemplate;
  imageUrl?: string;
}

export type SocialStatus = 'Borrador' | 'Programado' | 'Publicado' | 'Cancelado';
export type SocialPlatform = 'Facebook' | 'Instagram' | 'X' | 'LinkedIn' | 'TikTok';

export interface SocialPost {
  id: string;
  date: string;
  content: string;
  platform: SocialPlatform;
  imageUrl?: string;
  status: SocialStatus;
}

export interface ROIReport {
  id: string;
  date: string;
  investment: number;
  leadsGenerated: number;
  salesMade: number;
  revenue: number;
  roiPercentage: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  details?: string;
}
