import { describe, it, expect } from 'vitest';
import { experienceData } from '../experienceData';
import type { ExperienceItem } from '../types';

describe('Experience Data', () => {
  describe('Data Structure Validation', () => {
    it('should have experience data array', () => {
      expect(experienceData).toBeDefined();
      expect(Array.isArray(experienceData)).toBe(true);
      expect(experienceData.length).toBeGreaterThan(0);
    });

    it('should have valid experience items structure', () => {
      experienceData.forEach((experience, index) => {
        expect(experience).toBeDefined();
        expect(typeof experience.company).toBe('string');
        expect(typeof experience.position).toBe('string');
        expect(typeof experience.period).toBe('string');
        expect(Array.isArray(experience.technologies)).toBe(true);
        expect(Array.isArray(experience.responsibilities)).toBe(true);

        // Optional fields
        if (experience.location) {
          expect(typeof experience.location).toBe('string');
        }
        if (experience.description) {
          expect(typeof experience.description).toBe('string');
        }
        if (experience.website) {
          expect(typeof experience.website).toBe('string');
        }
        if (experience.current !== undefined) {
          expect(typeof experience.current).toBe('boolean');
        }
      });
    });

    it('should have non-empty required fields', () => {
      experienceData.forEach((experience, index) => {
        expect(experience.company.trim()).not.toBe('');
        expect(experience.position.trim()).not.toBe('');
        expect(experience.period.trim()).not.toBe('');
        expect(experience.technologies.length).toBeGreaterThan(0);
        expect(experience.responsibilities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Content Validation', () => {
    it('should have current position marked correctly', () => {
      const currentPositions = experienceData.filter(exp => exp.current === true);

      // Should have at least one current position
      expect(currentPositions.length).toBeGreaterThanOrEqual(1);

      // Current positions should have "Present" in period
      currentPositions.forEach(exp => {
        expect(exp.period.toLowerCase()).toContain('present');
      });
    });

    it('should have valid website URLs when provided', () => {
      const experiencesWithWebsites = experienceData.filter(exp => exp.website);

      experiencesWithWebsites.forEach(exp => {
        expect(exp.website).toMatch(/^https?:\/\/.+/);
      });
    });

    it('should have technologies as non-empty strings', () => {
      experienceData.forEach((experience, expIndex) => {
        experience.technologies.forEach((tech, techIndex) => {
          expect(typeof tech).toBe('string');
          expect(tech.trim()).not.toBe('');
        });
      });
    });

    it('should have responsibilities as non-empty strings', () => {
      experienceData.forEach((experience, expIndex) => {
        experience.responsibilities.forEach((resp, respIndex) => {
          expect(typeof resp).toBe('string');
          expect(resp.trim()).not.toBe('');
        });
      });
    });
  });

  describe('Data Quality Checks', () => {
    it('should have experiences in chronological order (newest first)', () => {
      // Check that current positions are at the beginning
      const currentIndex = experienceData.findIndex(exp => exp.current === true);
      if (currentIndex !== -1) {
        expect(currentIndex).toBe(0); // Current position should be first
      }
    });

    it('should have reasonable number of technologies per experience', () => {
      experienceData.forEach((experience, index) => {
        expect(experience.technologies.length).toBeGreaterThan(0);
        expect(experience.technologies.length).toBeLessThan(20); // Reasonable upper limit
      });
    });

    it('should have reasonable number of responsibilities per experience', () => {
      experienceData.forEach((experience, index) => {
        expect(experience.responsibilities.length).toBeGreaterThan(0);
        expect(experience.responsibilities.length).toBeLessThan(15); // Reasonable upper limit
      });
    });

    it('should have consistent company name formatting', () => {
      experienceData.forEach((experience, index) => {
        // Company names should not start or end with whitespace
        expect(experience.company).toBe(experience.company.trim());
        // Should not be all uppercase or all lowercase
        expect(experience.company).not.toBe(experience.company.toUpperCase());
        expect(experience.company).not.toBe(experience.company.toLowerCase());
      });
    });

    it('should have consistent position title formatting', () => {
      experienceData.forEach((experience, index) => {
        // Position titles should not start or end with whitespace
        expect(experience.position).toBe(experience.position.trim());
      });
    });
  });

  describe('Specific Data Validation', () => {
    it('should include Doppler as current position', () => {
      const doppler = experienceData.find(exp =>
        exp.company.toLowerCase().includes('doppler')
      );

      expect(doppler).toBeDefined();
      expect(doppler?.current).toBe(true);
      expect(doppler?.period.toLowerCase()).toContain('present');
    });

    it('should have diverse technology stack across experiences', () => {
      const allTechnologies = experienceData
        .flatMap(exp => exp.technologies)
        .join(' ')
        .toLowerCase();

      // Should include various technology categories
      expect(allTechnologies).toContain('javascript');
      expect(allTechnologies).toContain('php');
      expect(allTechnologies).toContain('node');
      expect(allTechnologies).toContain('react');
    });

    it('should have meaningful responsibility descriptions', () => {
      experienceData.forEach((experience, index) => {
        experience.responsibilities.forEach((resp, respIndex) => {
          // Responsibilities should be reasonably long (not just single words)
          expect(resp.length).toBeGreaterThan(20);
          // Should be descriptive sentences (contain periods or meaningful content)
          const isDescriptive = resp.includes('.') || resp.length > 50 || /[a-z].*[A-Z]/.test(resp);
          expect(isDescriptive).toBe(true);
        });
      });
    });
  });
});
