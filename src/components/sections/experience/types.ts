/**
 * TypeScript types for Experience section components
 */

export interface ExperienceItem {
  /** Company name */
  company: string;
  /** Job position/title */
  position: string;
  /** Employment period */
  period: string;
  /** Location (optional) */
  location?: string;
  /** Technologies and tools used */
  technologies: string[];
  /** Key responsibilities and achievements */
  responsibilities: string[];
  /** Company description or additional context (optional) */
  description?: string;
  /** Company website URL (optional) */
  website?: string;
  /** Whether this is a current position */
  current?: boolean;
}

export interface ExperienceCardProps {
  /** Experience item data */
  experience: ExperienceItem;
  /** Additional CSS classes */
  className?: string;
}

export interface ExperienceSectionProps {
  /** List of experience items */
  experiences: ExperienceItem[];
  /** Section title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}
