export type SpecialtyCategory = 
  | 'General SEO'
  | 'Technical SEO'
  | 'Content SEO'
  | 'Local SEO'
  | 'E-commerce SEO'
  | 'Link Building'
  | 'AI SEO'
  | 'Affiliate SEO'
  | 'Community & Education';

export const SPECIALTY_CATEGORIES: SpecialtyCategory[] = [
  'General SEO',
  'Technical SEO',
  'Content SEO',
  'Local SEO',
  'E-commerce SEO',
  'Link Building',
  'AI SEO',
  'Affiliate SEO',
  'Community & Education'
];

export type FirestoreDateValue = {
  toDate?: () => Date;
} | Date | string | number | null | undefined;

export type EnrichmentStatus =
  | 'pending'
  | 'processing'
  | 'needs_review'
  | 'enriched'
  | 'failed'
  | 'excluded'
  | 'rejected';

export interface SpecialistEnrichmentDraft {
  headline?: string;
  summary?: string;
  website?: string;
  social?: string;
  linkedinUrl?: string;
  xUrl?: string;
  githubUrl?: string;
  otherSocialUrl?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  currentCompany?: string;
  specialties?: string[];
  secondaryCategories?: string[];
  servicesOffered?: string[];
  problemsTheySolve?: string[];
  notableAchievements?: string[];
  confidenceScore?: number;
  notes?: string;
  sourceUrls?: string[];
  generatedAt?: string;
  version?: string;
}

export interface Specialist {
  id?: string;
  slug?: string;
  name: string;
  role: string;
  contribution: string;
  category: SpecialtyCategory;
  website?: string;
  social?: string;
  summary?: string;
  submittedAt?: FirestoreDateValue;
  createdAt?: FirestoreDateValue;
  updatedAt?: FirestoreDateValue;
  status?: 'pending' | 'approved';
  avatar?: string;
  headline?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  currentCompany?: string;
  specialties?: string[];
  secondaryCategories?: string[];
  servicesOffered?: string[];
  problemsTheySolve?: string[];
  notableAchievements?: string[];
  enrichmentStatus?: EnrichmentStatus;
  enrichmentRequestedAt?: FirestoreDateValue;
  enrichmentLastAttemptAt?: FirestoreDateValue;
  enrichmentLastSuccessAt?: FirestoreDateValue;
  enrichmentApprovedAt?: FirestoreDateValue;
  enrichmentPendingApproval?: boolean;
  enrichmentConfidence?: number;
  enrichmentSourceUrls?: string[];
  enrichmentNotes?: string;
  enrichmentVersion?: string;
  enrichmentDraft?: SpecialistEnrichmentDraft;
}

export interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  rateLimitEnabled?: boolean;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  coverImage?: string;
  status: 'draft' | 'published';
  createdAt?: FirestoreDateValue;
  updatedAt?: FirestoreDateValue;
  publishedAt?: FirestoreDateValue;
}

export const BLOG_CATEGORIES = [
  'SEO Strategy',
  'Technical SEO',
  'Content Marketing',
  'Link Building',
  'Local SEO',
  'AI & SEO',
  'Industry News',
  'Case Studies',
  'Tools & Resources',
] as const;

declare global {
  interface Window {
    __APP_CONFIG__: AppConfig;
  }
}
