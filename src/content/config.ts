import { defineCollection, z } from 'astro:content';

/**
 * Enhanced Blog Post Schema with Professional Standards
 * Replaces custom validation logic with Zod schema validation
 */
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields with validation
    title: z.string()
      .min(10, 'Title must be at least 10 characters')
      .max(80, 'Title must be at most 80 characters for SEO'),

    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(300, 'Description must be at most 300 characters for SEO'),

    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .transform((val) => new Date(val)),

    author: z.string()
      .min(2, 'Author name must be at least 2 characters'),

    // Tags with validation
    tags: z.array(z.string().min(1, 'Tag cannot be empty'))
      .min(1, 'At least one tag is required')
      .max(15, 'Maximum 15 tags allowed')
      .optional()
      .default([]),

    // Image system (backward compatibility)
    image: z.object({
      url: z.string().min(1, 'Image URL cannot be empty'),
      alt: z.string().min(5, 'Alt text must be descriptive (min 5 chars)').max(200, 'Alt text should be concise (max 200 chars)')
    }).optional(),

    // New image system
    postId: z.string().optional(),

    imageAlt: z.string()
      .min(5, 'Image alt text must be descriptive (min 5 chars)')
      .max(200, 'Alt text should be concise (max 200 chars)')
      .optional(),

    // Optional fields
    draft: z.boolean().optional().default(false),
    slug: z.string().optional(),

    // SEO and metadata
    excerpt: z.string()
      .max(160, 'Excerpt should be max 160 characters')
      .optional(),

    // Reading time (auto-calculated, but can be overridden)
    readingTime: z.number().positive().optional(),

    // Publication status
    featured: z.boolean().optional().default(false),

    // Categories/pillars
    pillar: z.enum(['desarrollo', 'seo', 'performance', 'accesibilidad', 'general'])
      .optional()
      .default('general')
  })
});

export const collections = {
  blog: blogCollection
};

