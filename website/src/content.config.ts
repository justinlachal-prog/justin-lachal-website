import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const audienceEnum = z.enum(['boards', 'councils', 'nfps', 'smes', 'individuals']);
const topicEnum = z.enum(['costing', 'strategy', 'reviews', 'property', 'governance', 'finance-function']);

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    headline: z.string(),
    icon: z.string(),
    order: z.number(),
    forWhom: z.string(),
    whatYouGet: z.array(z.string()),
    topics: z.array(topicEnum).optional(),
  }),
});

const models = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/models' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    sheetUrl: z.string().optional(),
    downloadUrl: z.string().optional(),
    assumptions: z.string(),
    verdict: z.string(),
    caveats: z.string(),
    audience: z.array(audienceEnum).optional(),
    topics: z.array(topicEnum).optional(),
    featured: z.boolean().default(false),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    downloadUrl: z.string().optional(),
    audience: z.array(audienceEnum).optional(),
    topics: z.array(topicEnum).optional(),
    format: z.enum(['model', 'checklist', 'template', 'worksheet', 'reading-list']),
    featured: z.boolean().default(false),
  }),
});

const caseNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    audience: z.array(audienceEnum).optional(),
    topics: z.array(topicEnum).optional(),
    featured: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    audience: z.array(audienceEnum).optional(),
    topics: z.array(topicEnum).optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { services, models, resources, 'case-notes': caseNotes, articles };
