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

export interface Specialist {
  id?: string; // Firestore document ID
  slug?: string;
  name: string;
  role: string;
  contribution: string;
  category: SpecialtyCategory;
  website?: string;
  social?: string;
  summary?: string;
  submittedAt?: any; // Firestore Timestamp
  createdAt?: any;
  updatedAt?: any;
  status?: 'pending' | 'approved';
  avatar?: string;
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
  content: string; // Markdown content
  author: string;
  category: string;
  tags: string[];
  coverImage?: string;
  status: 'draft' | 'published';
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
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
