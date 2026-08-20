import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Blog posts collection ──
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('NailSet Gallery'),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    category: z.enum(['colors', 'styles', 'seasons', 'trends', 'tutorials']),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    authorBio: z.string().optional(),
    reviewer: z.string().optional(),
    reviewerRole: z.string().optional(),
    lastReviewedDate: z.coerce.date().optional(),
    medicalDisclaimer: z.boolean().default(false),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    timeEstimate: z.string().optional(),
    costEstimate: z.string().optional(),
    testingNotes: z.string().optional(),
    isPillar: z.boolean().default(false),
    pillarUrl: z.string().optional(),
  }),
});

// ── Gallery entries collection ──
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    category: z.enum(['colors', 'styles', 'seasons', 'trends']),
    tags: z.array(z.string()).default([]),
    color: z.string().optional(),
    shape: z.string().optional(),
    season: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, gallery };

