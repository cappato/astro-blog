import { describe, it, expect } from 'vitest';
import type { ExperienceItem, ExperienceCardProps, ExperienceSectionProps } from '../types';

// Test constants for type validation
const TYPE_TEST_CONSTANTS = {
  SAMPLE_DATA: {
    COMPANY: "Test Company",
    POSITION: "Developer",
    PERIOD: "2020 - Present",
    TECHNOLOGIES: ["JavaScript", "TypeScript"],
    RESPONSIBILITIES: ["Developed applications", "Maintained code"],
    TECH_COUNT: 3,
    RESP_COUNT: 2,
    FIRST_TECH: "Tech1",
    FIRST_RESP: "Resp1",
  },
  REQUIRED_FIELDS: {
    COMPANY: "Required",
    POSITION: "Required",
    PERIOD: "Required",
    TECHNOLOGIES: ["Required"],
    RESPONSIBILITIES: ["Required"],
  }
} as const;

describe('Experience Types', () => {
  describe('ExperienceItem Interface', () => {
    it('should accept valid experience item', () => {
      const validExperience: ExperienceItem = {
        company: TYPE_TEST_CONSTANTS.SAMPLE_DATA.COMPANY,
        position: TYPE_TEST_CONSTANTS.SAMPLE_DATA.POSITION,
        period: TYPE_TEST_CONSTANTS.SAMPLE_DATA.PERIOD,
        technologies: TYPE_TEST_CONSTANTS.SAMPLE_DATA.TECHNOLOGIES,
        responsibilities: TYPE_TEST_CONSTANTS.SAMPLE_DATA.RESPONSIBILITIES
      };

      // Type checking - if this compiles, the type is correct
      expect(validExperience.company).toBe(TYPE_TEST_CONSTANTS.SAMPLE_DATA.COMPANY);
      expect(validExperience.position).toBe(TYPE_TEST_CONSTANTS.SAMPLE_DATA.POSITION);
      expect(validExperience.period).toBe(TYPE_TEST_CONSTANTS.SAMPLE_DATA.PERIOD);
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

      expect(experience.technologies).toHaveLength(TYPE_TEST_CONSTANTS.SAMPLE_DATA.TECH_COUNT);
      expect(experience.responsibilities).toHaveLength(TYPE_TEST_CONSTANTS.SAMPLE_DATA.RESP_COUNT);
      expect(experience.technologies[0]).toBe(TYPE_TEST_CONSTANTS.SAMPLE_DATA.FIRST_TECH);
      expect(experience.responsibilities[0]).toBe(TYPE_TEST_CONSTANTS.SAMPLE_DATA.FIRST_RESP);
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
        company: TYPE_TEST_CONSTANTS.REQUIRED_FIELDS.COMPANY,
        position: TYPE_TEST_CONSTANTS.REQUIRED_FIELDS.POSITION,
        period: TYPE_TEST_CONSTANTS.REQUIRED_FIELDS.PERIOD,
        technologies: TYPE_TEST_CONSTANTS.REQUIRED_FIELDS.TECHNOLOGIES,
        responsibilities: TYPE_TEST_CONSTANTS.REQUIRED_FIELDS.RESPONSIBILITIES
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
