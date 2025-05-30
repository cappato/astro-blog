import { describe, it, expect } from 'vitest';
import type { ExperienceItem, ExperienceCardProps, ExperienceSectionProps } from '../types';

describe('Experience Types', () => {
  describe('ExperienceItem Interface', () => {
    it('should accept valid experience item', () => {
      const validExperience: ExperienceItem = {
        company: "Test Company",
        position: "Developer",
        period: "2020 - Present",
        technologies: ["JavaScript", "TypeScript"],
        responsibilities: ["Developed applications", "Maintained code"]
      };

      // Type checking - if this compiles, the type is correct
      expect(validExperience.company).toBe("Test Company");
      expect(validExperience.position).toBe("Developer");
      expect(validExperience.period).toBe("2020 - Present");
      expect(Array.isArray(validExperience.technologies)).toBe(true);
      expect(Array.isArray(validExperience.responsibilities)).toBe(true);
    });

    it('should accept experience item with optional fields', () => {
      const experienceWithOptionals: ExperienceItem = {
        company: "Test Company",
        position: "Developer",
        period: "2020 - Present",
        location: "Remote",
        technologies: ["JavaScript"],
        responsibilities: ["Developed apps"],
        description: "A great company",
        website: "https://example.com",
        current: true
      };

      expect(experienceWithOptionals.location).toBe("Remote");
      expect(experienceWithOptionals.description).toBe("A great company");
      expect(experienceWithOptionals.website).toBe("https://example.com");
      expect(experienceWithOptionals.current).toBe(true);
    });

    it('should handle arrays correctly', () => {
      const experience: ExperienceItem = {
        company: "Test",
        position: "Dev",
        period: "2020",
        technologies: ["Tech1", "Tech2", "Tech3"],
        responsibilities: ["Resp1", "Resp2"]
      };

      expect(experience.technologies).toHaveLength(3);
      expect(experience.responsibilities).toHaveLength(2);
      expect(experience.technologies[0]).toBe("Tech1");
      expect(experience.responsibilities[0]).toBe("Resp1");
    });
  });

  describe('ExperienceCardProps Interface', () => {
    it('should accept valid card props', () => {
      const experience: ExperienceItem = {
        company: "Test Company",
        position: "Developer",
        period: "2020 - Present",
        technologies: ["JavaScript"],
        responsibilities: ["Developed apps"]
      };

      const cardProps: ExperienceCardProps = {
        experience,
        className: "custom-class"
      };

      expect(cardProps.experience).toBe(experience);
      expect(cardProps.className).toBe("custom-class");
    });

    it('should accept props without optional className', () => {
      const experience: ExperienceItem = {
        company: "Test Company",
        position: "Developer",
        period: "2020 - Present",
        technologies: ["JavaScript"],
        responsibilities: ["Developed apps"]
      };

      const cardProps: ExperienceCardProps = {
        experience
      };

      expect(cardProps.experience).toBe(experience);
      expect(cardProps.className).toBeUndefined();
    });
  });

  describe('ExperienceSectionProps Interface', () => {
    it('should accept valid section props', () => {
      const experiences: ExperienceItem[] = [
        {
          company: "Company 1",
          position: "Dev 1",
          period: "2020",
          technologies: ["Tech1"],
          responsibilities: ["Resp1"]
        },
        {
          company: "Company 2",
          position: "Dev 2",
          period: "2021",
          technologies: ["Tech2"],
          responsibilities: ["Resp2"]
        }
      ];

      const sectionProps: ExperienceSectionProps = {
        experiences,
        title: "My Experience",
        className: "section-class"
      };

      expect(sectionProps.experiences).toHaveLength(2);
      expect(sectionProps.title).toBe("My Experience");
      expect(sectionProps.className).toBe("section-class");
    });

    it('should accept props with only required fields', () => {
      const experiences: ExperienceItem[] = [
        {
          company: "Company 1",
          position: "Dev 1",
          period: "2020",
          technologies: ["Tech1"],
          responsibilities: ["Resp1"]
        }
      ];

      const sectionProps: ExperienceSectionProps = {
        experiences
      };

      expect(sectionProps.experiences).toHaveLength(1);
      expect(sectionProps.title).toBeUndefined();
      expect(sectionProps.className).toBeUndefined();
    });

    it('should handle empty experiences array', () => {
      const sectionProps: ExperienceSectionProps = {
        experiences: []
      };

      expect(sectionProps.experiences).toHaveLength(0);
      expect(Array.isArray(sectionProps.experiences)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should enforce required fields', () => {
      // This test ensures TypeScript compilation catches missing required fields
      // If any of these cause compilation errors, the types are working correctly
      
      const validExperience: ExperienceItem = {
        company: "Required",
        position: "Required", 
        period: "Required",
        technologies: ["Required"],
        responsibilities: ["Required"]
      };

      expect(validExperience).toBeDefined();
    });

    it('should allow optional fields to be undefined', () => {
      const experience: ExperienceItem = {
        company: "Test",
        position: "Test",
        period: "Test",
        technologies: ["Test"],
        responsibilities: ["Test"],
        location: undefined,
        description: undefined,
        website: undefined,
        current: undefined
      };

      expect(experience.location).toBeUndefined();
      expect(experience.description).toBeUndefined();
      expect(experience.website).toBeUndefined();
      expect(experience.current).toBeUndefined();
    });

    it('should enforce array types', () => {
      const experience: ExperienceItem = {
        company: "Test",
        position: "Test",
        period: "Test",
        technologies: [], // Empty array should be valid
        responsibilities: [] // Empty array should be valid
      };

      expect(Array.isArray(experience.technologies)).toBe(true);
      expect(Array.isArray(experience.responsibilities)).toBe(true);
    });
  });

  describe('Interface Documentation', () => {
    it('should have meaningful property names', () => {
      // This test documents the expected interface structure
      const experience: ExperienceItem = {
        company: "Company name should be descriptive",
        position: "Position should indicate job role",
        period: "Period should show employment duration",
        location: "Location is optional geographic info",
        technologies: ["Technologies should list tools and frameworks"],
        responsibilities: ["Responsibilities should describe key achievements"],
        description: "Description provides additional context",
        website: "Website should be a valid URL",
        current: true // Current indicates if this is an active position
      };

      // Verify the structure makes sense
      expect(typeof experience.company).toBe('string');
      expect(typeof experience.position).toBe('string');
      expect(typeof experience.period).toBe('string');
      expect(Array.isArray(experience.technologies)).toBe(true);
      expect(Array.isArray(experience.responsibilities)).toBe(true);
      expect(typeof experience.location).toBe('string');
      expect(typeof experience.description).toBe('string');
      expect(typeof experience.website).toBe('string');
      expect(typeof experience.current).toBe('boolean');
    });
  });
});
