import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().transform((val) => new Date(val)),
    author: z.string(),
    // Sistema antiguo (para compatibilidad)
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    // Nuevo sistema de imágenes
    postId: z.string().optional(),
    imageAlt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
    slug: z.string().optional()
  })
});

export const collections = {
  blog: blogCollection
};

