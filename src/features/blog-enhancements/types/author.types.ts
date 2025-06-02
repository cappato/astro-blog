/**
 * Blog Enhancement Feature - Author Types
 * 
 * Tipos TypeScript para el sistema de autor mejorado
 */

export interface AuthorCardProps {
  variant?: 'compact' | 'standard' | 'full' | 'inline';
  className?: string;
  showBio?: 'short' | 'medium' | 'extended' | false;
  showStats?: boolean;
  showAchievements?: boolean;
  showSkills?: boolean;
  showSocial?: boolean;
  maxSocialLinks?: number;
  layout?: 'horizontal' | 'vertical';
  imageSize?: 'tiny' | 'small' | 'medium' | 'large';
  customConfig?: Partial<AuthorVariantConfig>;
}

export interface AuthorVariantConfig {
  showBio: 'short' | 'medium' | 'extended' | false;
  showStats: boolean;
  showAchievements: boolean;
  showSkills: boolean;
  showSocial: boolean;
  maxSocialLinks: number;
  layout: 'horizontal' | 'vertical';
  imageSize: 'tiny' | 'small' | 'medium' | 'large';
}

export interface AuthorPersonalInfo {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  tagline: string;
  location: string;
  timezone: string;
  languages: string[];
}

export interface AuthorBiography {
  short: string;
  medium: string;
  extended: string;
}

export interface AuthorExperience {
  years: string;
  currentRole: string;
  company?: string;
  specialties: string[];
  skills: string[];
  achievements: string[];
}

export interface AuthorImages {
  avatar: string;
  avatarHigh: string;
  og: string;
  banner?: string;
}

export interface AuthorSocialLinks {
  github: string;
  linkedin: string;
  twitter?: string;
  email: string;
  website: string;
  youtube?: string;
  instagram?: string;
}

export interface AuthorStats {
  articles: number;
  projects: number;
  experience: string;
  followers?: number;
}

export interface AuthorDisplayConfig {
  showStats: boolean;
  showAchievements: boolean;
  showSkills: boolean;
  showLocation: boolean;
  showAvailability: boolean;
}

export interface AuthorExtraInfo {
  availability: 'available' | 'busy' | 'unavailable';
  workingHours: string;
  preferredContact: 'email' | 'linkedin' | 'twitter';
  interests: string[];
  currentProjects: string[];
}

export interface AuthorProfile {
  personal: AuthorPersonalInfo;
  bio: AuthorBiography;
  experience: AuthorExperience;
  images: AuthorImages;
  social: AuthorSocialLinks;
  stats: AuthorStats;
  display: AuthorDisplayConfig;
  extra: AuthorExtraInfo;
}

export interface AuthorStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  jobTitle: string;
  description: string;
  image: string;
  url: string;
  sameAs: string[];
  knowsAbout: string[];
  worksFor: {
    "@type": string;
    name: string;
  };
  address?: {
    "@type": string;
    addressCountry: string;
    addressRegion: string;
  };
}
