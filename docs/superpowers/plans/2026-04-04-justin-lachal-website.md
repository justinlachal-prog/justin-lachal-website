# Justin Lachal Consulting Website — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static consulting website for Justin Lachal using Astro 5, Tailwind CSS 4, and GitHub Pages — as specified in `docs/superpowers/specs/2026-04-04-justin-lachal-website-design.md`.

**Architecture:** Astro 5 static site with content collections for 5 content types (services, models, resources, case-notes, articles). All content in Markdown with typed Zod frontmatter schemas. Client-side JS only for resource filtering. Formspree for contact form. GitHub Actions for CI/CD.

**Tech Stack:** Astro 5, Tailwind CSS 4 (`@tailwindcss/vite`), TypeScript, Zod, Google Fonts (Source Serif 4, Inter), Formspree, GitHub Actions, Playwright (e2e tests).

**Important base path note:** The site uses `base: '/website'` for GitHub Pages project repo hosting. All internal `href` values throughout components must use a `resolveUrl()` helper (defined in Task 1) that prepends `import.meta.env.BASE_URL`. When a custom domain is configured, `base` is removed and the helper becomes a no-op.

---

## Chunk 1: Project Scaffold + Design System + Content Schemas

### Task 1: Scaffold Astro 5 project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`

- [ ] **Step 1: Initialize Astro project**

Run inside `/Users/dewoller/code/people/justin_lachal/`:

```bash
npm create astro@latest website -- --template minimal --no-install --no-git
```

This creates a `website/` subdirectory. We'll work inside it from now on.

- [ ] **Step 2: Install dependencies**

```bash
cd website && npm install
```

- [ ] **Step 3: Add Tailwind CSS 4**

```bash
npx astro add tailwind --yes
```

This installs `@tailwindcss/vite` and `tailwindcss`, adds the vite plugin to `astro.config.mjs`, and creates the CSS import file.

- [ ] **Step 4: Configure astro.config.mjs**

Replace the generated config with:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://justinlachal.github.io',
  base: '/website',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Note: `base` is set for GitHub Pages project repo. Remove it when a custom domain is configured.

- [ ] **Step 5: Create URL helper utility**

This helper prepends `BASE_URL` to all internal links, solving the base path problem site-wide.

`website/src/utils/url.ts`:
```typescript
// website/src/utils/url.ts
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  if (path.startsWith('http') || path.startsWith('#')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
```

All components must import and use `url()` for internal hrefs: `url('/services')` instead of `'/services'`.

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add website/
git commit -m "feat: scaffold Astro 5 project with Tailwind CSS 4 and URL helper"
```

---

### Task 2: Global styles + design tokens

**Files:**
- Create: `website/src/styles/global.css`

- [ ] **Step 1: Create global.css with Tailwind 4 @theme tokens**

```css
/* website/src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Color palette — using oklch for Tailwind 4 opacity modifier support */
  --color-charcoal: oklch(0.279 0.006 247);
  --color-cream: oklch(0.971 0.007 83);
  --color-teal: oklch(0.467 0.089 168);
  --color-teal-light: oklch(0.946 0.022 168);
  --color-teal-dark: oklch(0.397 0.076 168);
  --color-gold: oklch(0.674 0.117 75);
  --color-gold-light: oklch(0.976 0.018 83);
  --color-grey-200: oklch(0.918 0.004 264);
  --color-grey-500: oklch(0.553 0.013 264);

  /* Typography */
  --font-heading: 'Source Serif 4', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font sizes — major third scale (1.25) */
  --font-size-sm: 0.8rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.563rem;
  --font-size-2xl: 1.953rem;
  --font-size-3xl: 2.441rem;
  --font-size-4xl: 3.052rem;
}

/* Base styles */
html {
  font-family: var(--font-body);
  color: var(--color-charcoal);
  background-color: var(--color-cream);
  line-height: 1.65;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
}

a {
  color: var(--color-teal);
  text-decoration: none;
}

a:hover {
  color: var(--color-teal-dark);
}

/* Readable line length */
.prose {
  max-width: 65ch;
}
```

- [ ] **Step 2: Verify build**

```bash
cd website && npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add website/src/styles/
git commit -m "feat: add design system tokens and global styles"
```

---

### Task 3: Content collection schemas

**Files:**
- Create: `website/src/content.config.ts`

- [ ] **Step 1: Write content.config.ts with all 5 collection schemas**

```typescript
// website/src/content.config.ts
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
```

- [ ] **Step 2: Create placeholder content directories**

Create each directory with a `.gitkeep`:

```bash
mkdir -p website/src/content/{services,models,resources,case-notes,articles}
touch website/src/content/{resources,case-notes,articles}/.gitkeep
```

(Services and models will be populated in later tasks.)

- [ ] **Step 3: Verify build**

```bash
cd website && npm run build
```

Expected: Build succeeds. Content collections registered with zero entries.

- [ ] **Step 4: Commit**

```bash
git add website/src/content.config.ts website/src/content/
git commit -m "feat: define content collection schemas for all 5 content types"
```

---

### Task 4: Base layouts

**Files:**
- Create: `website/src/layouts/BaseLayout.astro`
- Create: `website/src/layouts/PageLayout.astro`

- [ ] **Step 1: Create BaseLayout.astro**

This is the HTML shell — fonts, meta, global styles. No header/footer (those go in PageLayout).

```astro
---
// website/src/layouts/BaseLayout.astro
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

import '../styles/global.css';

const { title, description = 'Better financial judgment for real-world decisions', ogImage } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{title} | Justin Lachal</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />

    <!-- Open Graph -->
    <meta property="og:title" content={`${title} | Justin Lachal`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    {ogImage && <meta property="og:image" content={ogImage} />}

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" />

  </head>
  <body class="min-h-screen flex flex-col">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create PageLayout.astro**

Wraps BaseLayout and adds Header + Footer + main content area.

```astro
---
// website/src/layouts/PageLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description, ogImage } = Astro.props;
---
<BaseLayout title={title} description={description} ogImage={ogImage}>
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 3: Create stub Header and Footer**

These will be fleshed out in the next task. Create minimal stubs so PageLayout compiles.

`website/src/components/layout/Header.astro`:
```astro
---
// Stub — implemented in Task 5
---
<header class="border-b border-grey-200 bg-white">
  <div class="mx-auto max-w-[1200px] px-6 py-4">
    <span class="font-heading text-xl font-bold text-charcoal">Justin Lachal</span>
  </div>
</header>
```

`website/src/components/layout/Footer.astro`:
```astro
---
// Stub — implemented in Task 5
---
<footer class="border-t border-grey-200 bg-white py-12">
  <div class="mx-auto max-w-[1200px] px-6 text-center text-grey-500 text-sm">
    &copy; {new Date().getFullYear()} Justin Lachal. All rights reserved.
  </div>
</footer>
```

- [ ] **Step 4: Create a minimal index.astro to test layouts**

Replace the generated `website/src/pages/index.astro`:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout title="Home">
  <section class="mx-auto max-w-[1200px] px-6 py-20">
    <h1 class="font-heading text-4xl font-bold text-charcoal">
      Better financial judgment for real-world decisions
    </h1>
    <p class="mt-4 text-lg text-grey-500">Site under construction.</p>
  </section>
</PageLayout>
```

- [ ] **Step 5: Verify dev server renders correctly**

```bash
cd website && npm run dev
```

Open `http://localhost:4321/website/` in a browser. Confirm:
- Cream background
- Source Serif heading
- Inter body text
- Header with "Justin Lachal" name
- Footer with copyright

- [ ] **Step 6: Verify build**

```bash
cd website && npm run build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add website/src/layouts/ website/src/components/layout/ website/src/pages/index.astro
git commit -m "feat: add BaseLayout, PageLayout, stub Header/Footer"
```

---

## Chunk 2: Navigation + UI Components

### Task 5: Full navigation (Header, Footer, MobileMenu)

**Files:**
- Modify: `website/src/components/layout/Header.astro`
- Modify: `website/src/components/layout/Footer.astro`
- Create: `website/src/components/layout/Navigation.astro`
- Create: `website/src/components/layout/MobileMenu.astro`

- [ ] **Step 1: Create Navigation.astro**

```astro
---
// website/src/components/layout/Navigation.astro
import { url } from '../../utils/url';

const navItems = [
  { label: 'Home', href: url('/') },
  { label: 'Services', href: url('/services') },
  { label: 'Spreadsheet Says', href: url('/spreadsheet-says') },
  { label: 'Resources', href: url('/resources') },
  { label: 'About', href: url('/about') },
  { label: 'Contact', href: url('/contact') },
];

const currentPath = Astro.url.pathname;
---
<nav class="hidden md:flex items-center gap-8">
  {navItems.map(item => (
    <a
      href={item.href}
      class:list={[
        'text-sm font-medium transition-colors',
        currentPath === item.href || currentPath.startsWith(item.href + '/')
          ? 'text-teal'
          : 'text-charcoal hover:text-teal',
      ]}
    >
      {item.label}
    </a>
  ))}
</nav>
```

**IMPORTANT:** All components that use `href` for internal links must `import { url } from '../../utils/url'` and wrap paths in `url()`. This applies to: `Navigation.astro`, `MobileMenu.astro`, `Header.astro`, `Footer.astro`, `Button.astro` (when passed internal hrefs), `ContactCTA.astro`, `ServiceLayout.astro`, `ContentCard.astro`, and all page files that generate links to other pages (e.g., `services/index.astro` using `url(\`/services/\${s.id}\`)`). The implementing agent must apply this pattern consistently everywhere an internal `href` appears.

- [ ] **Step 2: Create MobileMenu.astro**

Uses a native `<details>` element for toggle — no JS framework needed.

```astro
---
// website/src/components/layout/MobileMenu.astro
import { url } from '../../utils/url';

const navItems = [
  { label: 'Home', href: url('/') },
  { label: 'Services', href: url('/services') },
  { label: 'Spreadsheet Says', href: url('/spreadsheet-says') },
  { label: 'Resources', href: url('/resources') },
  { label: 'About', href: url('/about') },
  { label: 'Contact', href: url('/contact') },
];
---
<div class="md:hidden">
  <button
    id="mobile-menu-toggle"
    class="p-2 text-charcoal hover:text-teal"
    aria-label="Toggle menu"
    aria-expanded="false"
  >
    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
  <div id="mobile-menu" class="hidden absolute left-0 right-0 top-full bg-white border-b border-grey-200 shadow-lg z-50">
    <div class="px-6 py-4 flex flex-col gap-4">
      {navItems.map(item => (
        <a href={item.href} class="text-charcoal hover:text-teal font-medium py-2">
          {item.label}
        </a>
      ))}
    </div>
  </div>
</div>

<script>
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu?.classList.toggle('hidden');
  });
</script>
```

- [ ] **Step 3: Update Header.astro**

```astro
---
// website/src/components/layout/Header.astro
import Navigation from './Navigation.astro';
import MobileMenu from './MobileMenu.astro';
import { url } from '../../utils/url';
---
<header class="sticky top-0 z-40 border-b border-grey-200 bg-white/95 backdrop-blur-sm">
  <div class="relative mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
    <a href={url('/')} class="font-heading text-xl font-bold text-charcoal hover:text-teal transition-colors">
      Justin Lachal
    </a>
    <Navigation />
    <MobileMenu />
  </div>
</header>
```

- [ ] **Step 4: Update Footer.astro**

```astro
---
// website/src/components/layout/Footer.astro
import { url } from '../../utils/url';

const footerLinks = [
  { label: 'Pricing', href: url('/pricing') },
  { label: 'FAQ', href: url('/faq') },
  { label: 'Capability Statement (PDF)', href: url('/downloads/capability-statement.pdf') },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];
---
<footer class="border-t border-grey-200 bg-white">
  <div class="mx-auto max-w-[1200px] px-6 py-12">
    <div class="flex flex-col items-center gap-6 md:flex-row md:justify-between">
      <div>
        <p class="font-heading text-lg font-bold text-charcoal">Justin Lachal</p>
        <p class="text-sm text-grey-500">Better financial judgment for real-world decisions</p>
      </div>
      <nav class="flex flex-wrap justify-center gap-6" aria-label="Footer">
        {footerLinks.map(link => (
          <a href={link.href} class="text-sm text-grey-500 hover:text-teal transition-colors">
            {link.label}
          </a>
        ))}
      </nav>
    </div>
    <div class="mt-8 border-t border-grey-200 pt-8 text-center text-sm text-grey-500">
      &copy; {new Date().getFullYear()} Justin Lachal. All rights reserved.
    </div>
  </div>
</footer>
```

- [ ] **Step 5: Verify build + dev server**

```bash
cd website && npm run build
```

Start dev server and check: sticky header, responsive nav (desktop shows links, mobile shows hamburger), footer links.

- [ ] **Step 6: Commit**

```bash
git add website/src/components/layout/
git commit -m "feat: add full responsive navigation, header, and footer"
```

---

### Task 6: UI component library

**Files:**
- Create: `website/src/components/ui/Button.astro`
- Create: `website/src/components/ui/Card.astro`
- Create: `website/src/components/ui/Tag.astro`
- Create: `website/src/components/ui/SectionHeading.astro`
- Create: `website/src/components/ui/CredibilityStrip.astro`

- [ ] **Step 1: Create Button.astro**

```astro
---
// website/src/components/ui/Button.astro
interface Props {
  href: string;
  variant?: 'primary' | 'secondary';
  class?: string;
}

const { href, variant = 'primary', class: className } = Astro.props;

const baseClasses = 'inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-colors';
const variants = {
  primary: 'bg-teal text-white hover:bg-teal-dark',
  secondary: 'border-2 border-teal text-teal hover:bg-teal-light',
};
---
<a href={href} class:list={[baseClasses, variants[variant], className]}>
  <slot />
</a>
```

- [ ] **Step 2: Create Card.astro**

```astro
---
// website/src/components/ui/Card.astro
interface Props {
  href?: string;
  class?: string;
}

const { href, class: className } = Astro.props;
const Tag = href ? 'a' : 'div';
---
<Tag
  href={href}
  class:list={[
    'block rounded-lg border border-grey-200 bg-white p-6 shadow-sm',
    href && 'hover:shadow-md hover:border-teal/30 transition-shadow',
    className,
  ]}
>
  <slot />
</Tag>
```

- [ ] **Step 3: Create Tag.astro**

```astro
---
// website/src/components/ui/Tag.astro
interface Props {
  label: string;
  active?: boolean;
  class?: string;
}

const { label, active = false, class: className } = Astro.props;
---
<span
  class:list={[
    'inline-block rounded-full px-3 py-1 text-xs font-medium',
    active ? 'bg-teal text-white' : 'bg-grey-200 text-grey-500',
    className,
  ]}
>
  {label}
</span>
```

- [ ] **Step 4: Create SectionHeading.astro**

```astro
---
// website/src/components/ui/SectionHeading.astro
interface Props {
  title: string;
  subtitle?: string;
}

const { title, subtitle } = Astro.props;
---
<div class="mb-12 text-center">
  <h2 class="font-heading text-3xl font-bold text-charcoal">{title}</h2>
  {subtitle && <p class="mt-4 text-lg text-grey-500">{subtitle}</p>}
</div>
```

- [ ] **Step 5: Create CredibilityStrip.astro**

```astro
---
// website/src/components/ui/CredibilityStrip.astro
const credentials = [
  'Fellow-qualified accountant',
  "30 years' experience",
  'Former professor of accounting, La Trobe University',
];
---
<div class="bg-teal-light py-4">
  <p class="mx-auto max-w-[1200px] px-6 text-center text-sm text-grey-500">
    {credentials.map((c, i) => (
      <>
        {i > 0 && <span class="mx-3 text-grey-200">|</span>}
        <span>{c}</span>
      </>
    ))}
  </p>
</div>
```

- [ ] **Step 6: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add website/src/components/ui/
git commit -m "feat: add UI component library — Button, Card, Tag, SectionHeading, CredibilityStrip"
```

---

### Task 7: Shared components

**Files:**
- Create: `website/src/components/shared/ContentCard.astro`
- Create: `website/src/components/shared/ContactCTA.astro`
- Create: `website/src/components/shared/RelatedContent.astro`

- [ ] **Step 1: Create ContentCard.astro**

Generic card for listing content items (models, articles, case notes, resources).

```astro
---
// website/src/components/shared/ContentCard.astro
import Card from '../ui/Card.astro';
import Tag from '../ui/Tag.astro';

interface Props {
  title: string;
  description: string;
  href: string;
  topics?: string[];
  date?: Date;
}

const { title, description, href, topics = [], date } = Astro.props;
---
<Card href={href}>
  {date && (
    <p class="text-xs text-grey-500 mb-2">
      {date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  )}
  <h3 class="font-heading text-xl font-bold text-charcoal">{title}</h3>
  <p class="mt-2 text-grey-500 text-sm">{description}</p>
  {topics.length > 0 && (
    <div class="mt-4 flex flex-wrap gap-2">
      {topics.map(t => <Tag label={t} />)}
    </div>
  )}
</Card>
```

- [ ] **Step 2: Create ContactCTA.astro**

Reusable call-to-action block used at the bottom of service pages, model pages, etc.

```astro
---
// website/src/components/shared/ContactCTA.astro
import Button from '../ui/Button.astro';
import { url } from '../../utils/url';

interface Props {
  heading?: string;
  text?: string;
}

const {
  heading = 'Bring me your decision',
  text = 'Whether it\'s a costing question, a review, or a strategy problem — let\'s talk.',
} = Astro.props;
---
<section class="bg-teal-light py-16">
  <div class="mx-auto max-w-[1200px] px-6 text-center">
    <h2 class="font-heading text-2xl font-bold text-charcoal">{heading}</h2>
    <p class="mt-4 text-grey-500">{text}</p>
    <div class="mt-8">
      <Button href={url('/contact')}>Get in touch</Button>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create RelatedContent.astro**

Displays a row of related content cards based on shared topics.

```astro
---
// website/src/components/shared/RelatedContent.astro
import ContentCard from './ContentCard.astro';

interface ContentItem {
  title: string;
  description: string;
  href: string;
  topics?: string[];
  date?: Date;
}

interface Props {
  items: ContentItem[];
  heading?: string;
}

const { items, heading = 'Related' } = Astro.props;
---
{items.length > 0 && (
  <section class="py-16">
    <div class="mx-auto max-w-[1200px] px-6">
      <h2 class="font-heading text-2xl font-bold text-charcoal mb-8">{heading}</h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map(item => (
          <ContentCard {...item} />
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 4: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add website/src/components/shared/
git commit -m "feat: add shared components — ContentCard, ContactCTA, RelatedContent"
```

---

## Chunk 3: Home Page + Service Pages + Spreadsheet Says

### Task 8: Home page — all sections

**Files:**
- Create: `website/src/components/home/Hero.astro`
- Create: `website/src/components/home/DecisionExamples.astro`
- Create: `website/src/components/home/ServicePillars.astro`
- Create: `website/src/components/home/SpreadsheetTeaser.astro`
- Create: `website/src/components/home/HowHeWorks.astro`
- Create: `website/src/components/home/PricingPhilosophy.astro`
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Create Hero.astro**

```astro
---
// website/src/components/home/Hero.astro
import Button from '../ui/Button.astro';
---
<section class="py-20 md:py-28">
  <div class="mx-auto max-w-[1200px] px-6">
    <div class="flex flex-col items-center gap-12 md:flex-row">
      <div class="flex-1">
        <h1 class="font-heading text-4xl font-bold text-charcoal md:text-4xl leading-tight">
          Better financial judgment for real-world decisions
        </h1>
        <p class="mt-6 text-lg text-grey-500 max-w-[540px]">
          Justin helps boards, councils, leaders and organisations make better decisions through practical costing, post-implementation reviews, performance reviews and clear strategic thinking.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <Button href="/contact">Work with Justin</Button>
          <Button href="/spreadsheet-says" variant="secondary">Explore free tools</Button>
        </div>
      </div>
      <div class="w-64 h-64 md:w-80 md:h-80 rounded-full bg-grey-200 flex items-center justify-center text-grey-500 text-sm shrink-0">
        [PLACEHOLDER: Headshot]
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create DecisionExamples.astro**

```astro
---
// website/src/components/home/DecisionExamples.astro
const questions = [
  'Caravan or motels?',
  'Outsource finance or build the team?',
  'Buy the software or wait?',
  'Did the project deliver its promised benefits?',
  'Which measures actually matter?',
];
---
<section class="bg-white py-12">
  <div class="mx-auto max-w-[1200px] px-6">
    <div class="flex flex-wrap justify-center gap-3">
      {questions.map(q => (
        <span class="rounded-full border border-grey-200 bg-cream px-5 py-2 text-sm text-charcoal font-medium">
          {q}
        </span>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create ServicePillars.astro**

```astro
---
// website/src/components/home/ServicePillars.astro
import Card from '../ui/Card.astro';
import SectionHeading from '../ui/SectionHeading.astro';

const services = [
  { title: 'Costing and commercial decisions', desc: 'Test the decision before you commit.', href: '/services/costing', icon: 'calculator' },
  { title: 'Post-implementation reviews', desc: 'Find out what actually happened.', href: '/services/reviews', icon: 'search' },
  { title: 'Performance and governance reviews', desc: 'Independent reviews of controls and reporting.', href: '/services/performance', icon: 'clipboard-check' },
  { title: 'Strategy and decision support', desc: 'Simple tools for difficult choices.', href: '/services/strategy', icon: 'compass' },
  { title: 'Finance function strategy', desc: 'Build a finance function that helps people decide.', href: '/services/finance-function', icon: 'building-2' },
  { title: 'Workshops and speaking', desc: 'Teaching, workshops and public talks.', href: '/services/workshops', icon: 'presentation' },
];
---
<section class="py-20">
  <div class="mx-auto max-w-[1200px] px-6">
    <SectionHeading title="How Justin helps" subtitle="Six areas of independent advice" />
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map(s => (
        <Card href={s.href}>
          <h3 class="font-heading text-lg font-bold text-charcoal">{s.title}</h3>
          <p class="mt-2 text-sm text-grey-500">{s.desc}</p>
        </Card>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create SpreadsheetTeaser.astro**

```astro
---
// website/src/components/home/SpreadsheetTeaser.astro
import Button from '../ui/Button.astro';
---
<section class="bg-gold-light py-20">
  <div class="mx-auto max-w-[1200px] px-6">
    <div class="flex flex-col items-center gap-8 md:flex-row">
      <div class="flex-1">
        <h2 class="font-heading text-3xl font-bold text-charcoal">Spreadsheet Says</h2>
        <p class="mt-4 text-lg text-grey-500">
          Run the numbers. Then talk about what the numbers miss.
        </p>
        <p class="mt-4 text-grey-500">
          Free financial models you can download, adapt, and use. Each one shows the assumptions,
          the verdict, and — just as importantly — what the spreadsheet cannot tell you.
        </p>
        <div class="mt-6">
          <Button href="/spreadsheet-says">Explore models</Button>
        </div>
      </div>
      <div class="w-full max-w-md rounded-lg border border-grey-200 bg-white p-4 shadow-sm">
        <div class="h-48 bg-cream rounded flex items-center justify-center text-grey-500 text-sm">
          [PLACEHOLDER: Spreadsheet screenshot]
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Create HowHeWorks.astro**

```astro
---
// website/src/components/home/HowHeWorks.astro
import SectionHeading from '../ui/SectionHeading.astro';

const steps = [
  { number: '1', title: 'Frame the decision' },
  { number: '2', title: 'Surface the assumptions' },
  { number: '3', title: 'Model what can be modeled' },
  { number: '4', title: 'Name what cannot be modeled' },
  { number: '5', title: 'Recommend action' },
  { number: '6', title: 'Review the outcome later' },
];
---
<section class="py-20">
  <div class="mx-auto max-w-[1200px] px-6">
    <SectionHeading title="How Justin works" />
    <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {steps.map(step => (
        <div class="text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white font-bold">
            {step.number}
          </div>
          <p class="mt-3 text-sm font-medium text-charcoal">{step.title}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Create PricingPhilosophy.astro**

```astro
---
// website/src/components/home/PricingPhilosophy.astro
---
<section class="bg-white py-16">
  <div class="mx-auto max-w-[1200px] px-6 text-center">
    <h2 class="font-heading text-2xl font-bold text-charcoal">Transparent and accessible</h2>
    <p class="mx-auto mt-4 max-w-[540px] text-grey-500">
      Fixed-fee options where possible. Modest rates. Community and public-interest concessions.
      Scoped to fit the problem, not the budget.
    </p>
    <a href="/pricing" class="mt-4 inline-block text-sm font-medium text-teal hover:text-teal-dark">
      See pricing pathways &rarr;
    </a>
  </div>
</section>
```

- [ ] **Step 7: Create ResourcesPreview.astro**

```astro
---
// website/src/components/home/ResourcesPreview.astro
import { getCollection } from 'astro:content';
import Card from '../ui/Card.astro';
import SectionHeading from '../ui/SectionHeading.astro';
import { url } from '../../utils/url';

const resources = (await getCollection('resources'))
  .filter(r => r.data.featured)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
---
{resources.length > 0 && (
  <section class="bg-white py-16">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading title="Free resources" subtitle="Download and use right now." />
      <div class="grid gap-6 md:grid-cols-3">
        {resources.map(r => (
          <Card>
            <span class="inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold mb-3">
              {r.data.format}
            </span>
            <h3 class="font-heading text-lg font-bold text-charcoal">{r.data.title}</h3>
            <p class="mt-2 text-sm text-grey-500">{r.data.description}</p>
          </Card>
        ))}
      </div>
      <p class="mt-8 text-center">
        <a href={url('/resources')} class="text-sm font-medium text-teal hover:text-teal-dark">
          Browse all resources &rarr;
        </a>
      </p>
    </div>
  </section>
)}
```

- [ ] **Step 8: Create PublicWorkPreview.astro**

```astro
---
// website/src/components/home/PublicWorkPreview.astro
import { getCollection } from 'astro:content';
import ContentCard from '../shared/ContentCard.astro';
import SectionHeading from '../ui/SectionHeading.astro';
import { url } from '../../utils/url';

const articles = await getCollection('articles');
const caseNotes = await getCollection('case-notes');

const allWork = [
  ...articles.map(a => ({ ...a, type: 'article' as const })),
  ...caseNotes.map(c => ({ ...c, type: 'case-note' as const })),
]
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
---
{allWork.length > 0 && (
  <section class="py-16">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading title="Public work" subtitle="Latest thinking, models, and case notes." />
      <div class="grid gap-6 md:grid-cols-3">
        {allWork.map(item => (
          <ContentCard
            title={item.data.title}
            description={item.data.description}
            href={url(item.type === 'article' ? `/public-work/${item.id}` : `/case-notes/${item.id}`)}
            topics={item.data.topics}
            date={item.data.date}
          />
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 9: Assemble index.astro**

```astro
---
// website/src/pages/index.astro
import PageLayout from '../layouts/PageLayout.astro';
import Hero from '../components/home/Hero.astro';
import CredibilityStrip from '../components/ui/CredibilityStrip.astro';
import DecisionExamples from '../components/home/DecisionExamples.astro';
import ServicePillars from '../components/home/ServicePillars.astro';
import SpreadsheetTeaser from '../components/home/SpreadsheetTeaser.astro';
import HowHeWorks from '../components/home/HowHeWorks.astro';
import ResourcesPreview from '../components/home/ResourcesPreview.astro';
import PublicWorkPreview from '../components/home/PublicWorkPreview.astro';
import PricingPhilosophy from '../components/home/PricingPhilosophy.astro';
import ContactCTA from '../components/shared/ContactCTA.astro';
---
<PageLayout title="Home" description="Justin Lachal — better financial judgment for real-world decisions. Independent accounting, costing and strategy advice.">
  <Hero />
  <CredibilityStrip />
  <DecisionExamples />
  <ServicePillars />
  <SpreadsheetTeaser />
  <HowHeWorks />
  <ResourcesPreview />
  <PublicWorkPreview />
  <PricingPhilosophy />
  <ContactCTA />
</PageLayout>
```

Note: `ResourcesPreview` and `PublicWorkPreview` conditionally render — they show nothing if their collections are empty, and auto-populate as content is added.

- [ ] **Step 8: Verify build + visual check**

```bash
cd website && npm run build
```

Start dev server and verify all home page sections render correctly.

- [ ] **Step 9: Commit**

```bash
git add website/src/components/home/ website/src/pages/index.astro
git commit -m "feat: build complete home page with all sections"
```

---

### Task 9: Service content + pages

**Files:**
- Create: `website/src/content/services/costing.md` (and 5 more)
- Create: `website/src/layouts/ServiceLayout.astro`
- Create: `website/src/pages/services/[slug].astro`
- Create: `website/src/pages/services/index.astro`

- [ ] **Step 1: Create all 6 service .md files**

Each file follows this pattern. Here is `costing.md` in full — the other 5 follow the same structure with content from spec sections 6.4.1–6.4.6:

`website/src/content/services/costing.md`:
```markdown
---
title: "Costing and Commercial Decisions"
description: "Test the decision before you commit. Practical financial models for buy/lease, make/buy, hire/outsource, and other consequential choices."
headline: "Before you buy it, build it, outsource it, or shut it down — test the decision."
icon: "calculator"
order: 1
forWhom: "Boards, executives, and managers facing significant financial decisions."
whatYouGet:
  - "One-page assumptions sheet"
  - "Working spreadsheet model"
  - "Short decision memo"
  - "Board-ready summary"
  - "Discussion session if needed"
topics:
  - costing
---

## The problem

Many consequential decisions — buy or lease, outsource or build internally, hold or sell — are made on gut feeling, boardroom politics, or incomplete analysis. A clear model changes the conversation.

## Examples

- Caravan versus motels — what does a lifetime of travel really cost each way?
- Outsource finance versus build an internal team
- Buy software now versus keep the current system
- Hold or sell a property
- Employ versus contract
- Standardise or customise

## The A/B/C/D decision framework

Not every decision needs the same approach:

- **A: Strategic** — values-laden decisions that need judgment and conversation
- **B: Modelable** — judgment-heavy but quantifiable, needing models plus conversation
- **C: Routine** — repetitive enough that a spreadsheet should do the heavy lifting
- **D: Trivial** — don't waste time

## How it works

1. Scoping call to frame the question
2. Gather assumptions and existing data
3. Build or adapt a one-page model
4. Present findings and discuss what the numbers miss
5. Deliver decision memo and working model
```

`website/src/content/services/reviews.md`:
```markdown
---
title: "Post-Implementation Reviews"
description: "Find out what actually happened after a project or initiative — lessons, benefits, and what to do next."
headline: "Once the project is done, find out what actually happened."
icon: "search"
order: 2
forWhom: "Councils, boards, NFPs, and leadership teams reviewing past projects."
whatYouGet:
  - "Benefits assessment"
  - "Lessons learned register"
  - "Strengths and weaknesses summary"
  - "Follow-up action plan"
  - "Board summary"
  - "Optional workshop to discuss findings"
topics:
  - reviews
---

## The problem

Projects finish. People move on. Nobody goes back to ask: did this actually deliver what was promised? Post-implementation reviews close that gap — not to assign blame, but to learn.

## When to do a review

- 6–12 months after a major project completes
- When benefits were promised but not tracked
- When a board or council wants accountability
- Before committing to a similar initiative

## What the review covers

- Were the planned benefits delivered?
- What worked well and what did not?
- What should change next time?
- What follow-up actions are needed?
```

`website/src/content/services/performance.md`:
```markdown
---
title: "Performance and Governance Reviews"
description: "Independent reviews of controls, reporting quality, and organisational performance."
headline: "Independent reviews of controls, reporting and organisational performance."
icon: "clipboard-check"
order: 3
forWhom: "Organisations wanting an independent look at how their finance and governance functions operate."
whatYouGet:
  - "Findings report"
  - "Improvement recommendations"
  - "Priority action plan"
  - "Optional presentation to board or leadership"
topics:
  - reviews
  - governance
---

## The problem

Controls drift. Reporting becomes routine rather than useful. Nobody checks whether the month-end process still makes sense. An independent review surfaces what internal eyes miss.

## What can be reviewed

- Finance control reviews
- Reporting pack reviews
- Process walk-throughs
- Bank reconciliation and cash control
- Aged receivables
- Budgeting and forecasting processes
- KPI and performance measures
- Grant or program governance

## Review Packs

Each review area has a structured checklist. You can download the free summary checklist and do it yourself, or engage Justin for the facilitated version with findings and recommendations.
```

`website/src/content/services/strategy.md`:
```markdown
---
title: "Strategy and Decision Support"
description: "Simple, practical tools for difficult strategic choices — force-field analysis, 80/20 prioritisation, and clear thinking."
headline: "Simple tools for difficult choices."
icon: "compass"
order: 4
forWhom: "Leaders and teams facing messy strategic issues where numbers matter but don't settle the question alone."
whatYouGet:
  - "Half-day strategy workshop"
  - "Decision briefing note"
  - "Option comparison framework"
  - "Facilitation session"
  - "Follow-up memo"
topics:
  - strategy
---

## The problem

Real decisions are rarely settled by one ratio. They need a sensible model, a clear conversation, and an honest look at trade-offs.

## The toolkit

- **Force-field analysis** — map the equilibrium, the driving forces, and the restraining forces
- **80/20 prioritisation** — stop wasting time on the noise
- **Option framing** — lay out the choices clearly before arguing about them
- **Scenario thinking** — what happens if the key assumption is wrong?

## How it works

1. Scoping conversation to understand the decision
2. Prepare frameworks and initial analysis
3. Run a facilitated workshop or discussion session
4. Deliver decision briefing note with clear options
5. Follow-up memo after the decision is made
```

`website/src/content/services/finance-function.md`:
```markdown
---
title: "Finance Function Strategy"
description: "Design or improve how finance work gets done — reporting, team structure, month-end, management information."
headline: "Build a finance function that helps people decide."
icon: "building-2"
order: 5
forWhom: "Organisations building, restructuring, or improving their finance operations."
whatYouGet:
  - "Finance diagnostic"
  - "Target operating model"
  - "Reporting redesign"
  - "Role clarity document"
  - "90-day improvement plan"
topics:
  - finance-function
---

## The problem

Many finance functions evolved by accident. The reporting pack was built for a previous CEO. Month-end takes too long. Nobody is sure which KPIs matter. A finance function strategy fixes this deliberately.

## Questions this service answers

- Should finance be in-house or outsourced?
- What should the reporting pack look like?
- Which KPIs actually matter?
- How should month-end work?
- What does a sensible planning cycle look like?
- What should a lean finance team actually do?
```

`website/src/content/services/workshops.md`:
```markdown
---
title: "Workshops, Speaking and Mentoring"
description: "Teaching, workshops and public talks on finance, decisions and strategy — drawing on 30 years of practice and academia."
headline: "Teaching, workshops and public talks on finance, decisions and strategy."
icon: "presentation"
order: 6
forWhom: "Boards, leadership teams, and practitioner groups wanting practical finance and strategy education."
whatYouGet:
  - "Full-day or half-day facilitated workshop"
  - "Tailored presentation on your topic"
  - "Practitioner seminar"
  - "Follow-up resources and materials"
topics:
  - strategy
---

## Offerings

- Board workshops
- Leadership offsites
- Short courses
- Public-interest talks
- Mentoring and coaching
- University-style seminars for practitioners

## Topics

- Better decisions with simple financial models
- What post-implementation reviews teach
- Lessons from financial history
- Finance strategy for non-finance leaders
- What a board should ask before approving major spend
```

- [ ] **Step 2: Create ServiceLayout.astro**

```astro
---
// website/src/layouts/ServiceLayout.astro
import PageLayout from './PageLayout.astro';
import ContactCTA from '../components/shared/ContactCTA.astro';

interface Props {
  title: string;
  description: string;
  headline: string;
  whatYouGet: string[];
}

const { title, description, headline, whatYouGet } = Astro.props;
---
<PageLayout title={title} description={description}>
  <article>
    <!-- Hero -->
    <section class="py-16 md:py-20">
      <div class="mx-auto max-w-[1200px] px-6">
        <h1 class="font-heading text-3xl font-bold text-charcoal md:text-4xl max-w-[720px]">
          {headline}
        </h1>
      </div>
    </section>

    <!-- Body content -->
    <section class="pb-16">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="grid gap-12 lg:grid-cols-3">
          <div class="lg:col-span-2 prose max-w-none">
            <slot />
          </div>
          <aside>
            <div class="sticky top-24 rounded-lg border border-grey-200 bg-white p-6">
              <h3 class="font-heading text-lg font-bold text-charcoal">What you get</h3>
              <ul class="mt-4 space-y-2">
                {whatYouGet.map(item => (
                  <li class="flex items-start gap-2 text-sm text-grey-500">
                    <span class="mt-1 text-teal">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                class="mt-6 block rounded-md bg-teal px-4 py-3 text-center text-sm font-medium text-white hover:bg-teal-dark transition-colors"
              >
                Discuss this with Justin
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <ContactCTA heading="Ready to talk?" text="Book a short scoping call to discuss your situation." />
  </article>
</PageLayout>
```

- [ ] **Step 3: Create services/[slug].astro**

```astro
---
// website/src/pages/services/[slug].astro
import { getCollection, render } from 'astro:content';
import ServiceLayout from '../../layouts/ServiceLayout.astro';

export async function getStaticPaths() {
  const services = await getCollection('services');
  return services.map(service => ({
    params: { slug: service.id },
    props: { service },
  }));
}

const { service } = Astro.props;
const { Content } = await render(service);
---
<ServiceLayout
  title={service.data.title}
  description={service.data.description}
  headline={service.data.headline}
  whatYouGet={service.data.whatYouGet}
>
  <Content />
</ServiceLayout>
```

- [ ] **Step 4: Create services/index.astro**

```astro
---
// website/src/pages/services/index.astro
import { getCollection } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';
import Card from '../../components/ui/Card.astro';
import SectionHeading from '../../components/ui/SectionHeading.astro';
import ContactCTA from '../../components/shared/ContactCTA.astro';

const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
---
<PageLayout title="Services" description="Independent accounting, costing and strategy advice for consequential decisions.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading
        title="Services"
        subtitle="Six areas of independent advice — each focused on helping you make better decisions."
      />
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.map(s => (
          <Card href={`/services/${s.id}`}>
            <h3 class="font-heading text-lg font-bold text-charcoal">{s.data.title}</h3>
            <p class="mt-2 text-sm text-grey-500">{s.data.description}</p>
            <p class="mt-4 text-xs text-grey-500"><strong>For:</strong> {s.data.forWhom}</p>
            <p class="mt-4 text-sm font-medium text-teal">Learn more &rarr;</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
  <ContactCTA />
</PageLayout>
```

- [ ] **Step 5: Verify build**

```bash
cd website && npm run build
```

Expected: Build succeeds. Check `/services/` and `/services/costing/` etc. in the output.

- [ ] **Step 6: Visual check**

Start dev server, navigate to `/services/` and each service subpage. Confirm layout, sidebar deliverables, markdown content rendering.

- [ ] **Step 7: Commit**

```bash
git add website/src/content/services/ website/src/layouts/ServiceLayout.astro website/src/pages/services/
git commit -m "feat: add 6 service pages with content, layout, and dynamic routing"
```

---

### Task 10: Spreadsheet Says content + pages

**Files:**
- Create: `website/src/content/models/caravan-vs-motels.md` (and 4 more)
- Create: `website/src/pages/spreadsheet-says/index.astro`
- Create: `website/src/pages/spreadsheet-says/[slug].astro`

- [ ] **Step 1: Create 5 model .md files**

Full example for `caravan-vs-motels.md` — the other 4 follow the same structure:

`website/src/content/models/caravan-vs-motels.md`:
```markdown
---
title: "Caravan vs Motels"
description: "Should you buy a caravan or stay in motels? A lifetime cost comparison for Australian travellers."
date: 2026-04-01
sheetUrl: ""
downloadUrl: ""
assumptions: "20 years of travel. 6 trips per year averaging 5 nights each. Caravan purchase price $40,000. Depreciation over 20 years. Motel average $150/night. Caravan park fees $45/night. Fuel differential and maintenance included."
verdict: "Over 20 years the caravan saves roughly $60,000 compared to motel-based travel — but only if you actually use it regularly."
caveats: "This model cannot capture the social value of owning a caravan, the flexibility of choosing accommodation on the road, or the personal enjoyment factor. It also assumes consistent travel frequency."
audience:
  - individuals
topics:
  - costing
featured: true
---

## The question

If you love travelling around Australia, is it cheaper to buy a caravan or to drive a sedan and stay in motels?

## What might change the answer

- Travel frequency — fewer than 4 trips a year and the motel option starts winning
- Caravan purchase price — a $80,000 caravan changes the equation significantly
- How long you keep the caravan — resale value after 10 years versus 20
- Whether you factor in the time cost of towing and setup

## [PLACEHOLDER: Embed Google Sheet here when available]
```

Create similar files for the remaining 4:

`website/src/content/models/outsource-vs-internal.md` — outsource finance vs internal team, audience: `[boards, smes]`, topics: `[costing, finance-function]`

`website/src/content/models/buy-now-vs-wait.md` — buy software/equipment now vs wait, audience: `[boards, smes]`, topics: `[costing]`

`website/src/content/models/own-vs-lease.md` — own vs lease equipment or premises, audience: `[boards, smes]`, topics: `[costing]`

`website/src/content/models/property-hold-vs-sell.md` — hold vs sell investment property, audience: `[individuals]`, topics: `[costing, property]`

Each should follow the same frontmatter schema with appropriate `assumptions`, `verdict`, and `caveats` fields filled with realistic placeholder content.

- [ ] **Step 2: Create spreadsheet-says/[slug].astro**

```astro
---
// website/src/pages/spreadsheet-says/[slug].astro
import { getCollection, render } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';
import Button from '../../components/ui/Button.astro';
import ContactCTA from '../../components/shared/ContactCTA.astro';

export async function getStaticPaths() {
  const models = await getCollection('models');
  return models.map(model => ({
    params: { slug: model.id },
    props: { model },
  }));
}

const { model } = Astro.props;
const { Content } = await render(model);
---
<PageLayout title={model.data.title} description={model.data.description}>
  <article class="py-16">
    <div class="mx-auto max-w-[1200px] px-6">
      <h1 class="font-heading text-3xl font-bold text-charcoal md:text-4xl">
        {model.data.title}
      </h1>
      <p class="mt-4 text-lg text-grey-500">{model.data.description}</p>

      <!-- Assumptions -->
      <section class="mt-12 rounded-lg border border-grey-200 bg-white p-6">
        <h2 class="font-heading text-xl font-bold text-charcoal">The assumptions</h2>
        <p class="mt-3 text-grey-500">{model.data.assumptions}</p>
      </section>

      <!-- Embedded model -->
      {model.data.sheetUrl && (
        <section class="mt-8">
          <h2 class="font-heading text-xl font-bold text-charcoal mb-4">The model</h2>
          <iframe
            src={model.data.sheetUrl}
            class="w-full h-[500px] rounded-lg border border-grey-200"
            title={`${model.data.title} spreadsheet model`}
          />
        </section>
      )}

      <!-- What the spreadsheet says -->
      <section class="mt-12 rounded-lg bg-teal-light p-6">
        <h2 class="font-heading text-xl font-bold text-charcoal">What the spreadsheet says</h2>
        <p class="mt-3 text-charcoal">{model.data.verdict}</p>
      </section>

      <!-- Caveats -->
      <section class="mt-8 rounded-lg bg-gold-light p-6">
        <h2 class="font-heading text-xl font-bold text-charcoal">What the spreadsheet cannot say</h2>
        <p class="mt-3 text-charcoal">{model.data.caveats}</p>
      </section>

      <!-- Markdown body (sensitivity analysis, extra notes) -->
      <section class="mt-12 prose max-w-none">
        <Content />
      </section>

      <!-- Actions -->
      <div class="mt-12 flex flex-wrap gap-4">
        {model.data.downloadUrl && (
          <Button href={model.data.downloadUrl} variant="secondary">Download the model</Button>
        )}
        <Button href="/contact">Hire Justin to adapt this to your situation</Button>
      </div>
    </div>
  </article>
  <ContactCTA />
</PageLayout>
```

- [ ] **Step 3: Create spreadsheet-says/index.astro**

```astro
---
// website/src/pages/spreadsheet-says/index.astro
import { getCollection } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';
import ContentCard from '../../components/shared/ContentCard.astro';
import SectionHeading from '../../components/ui/SectionHeading.astro';

const models = (await getCollection('models')).sort((a, b) =>
  b.data.date.getTime() - a.data.date.getTime()
);
---
<PageLayout title="Spreadsheet Says" description="Free financial models you can download, adapt, and use. Each shows the assumptions, the verdict, and what the spreadsheet cannot tell you.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading
        title="Spreadsheet Says"
        subtitle="Run the numbers. Then talk about what the numbers miss."
      />
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {models.map(m => (
          <ContentCard
            title={m.data.title}
            description={m.data.description}
            href={`/spreadsheet-says/${m.id}`}
            topics={m.data.topics}
            date={m.data.date}
          />
        ))}
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 4: Verify build**

```bash
cd website && npm run build
```

Expected: Build succeeds. Check output for `/spreadsheet-says/` and `/spreadsheet-says/caravan-vs-motels/`.

- [ ] **Step 5: Commit**

```bash
git add website/src/content/models/ website/src/pages/spreadsheet-says/
git commit -m "feat: add Spreadsheet Says hub with 5 model pages"
```

---

## Chunk 4: Remaining Pages + Contact Form

### Task 11: About page

**Files:**
- Create: `website/src/pages/about.astro`

- [ ] **Step 1: Create about.astro**

```astro
---
// website/src/pages/about.astro
import PageLayout from '../layouts/PageLayout.astro';
import Button from '../components/ui/Button.astro';
---
<PageLayout title="About" description="Justin Lachal — accountant, professor, adviser. 30 years of helping people make better financial decisions.">
  <article>
    <!-- Hero -->
    <section class="py-16 md:py-20">
      <div class="mx-auto max-w-[1200px] px-6">
        <div class="flex flex-col gap-12 md:flex-row items-start">
          <div class="flex-1">
            <h1 class="font-heading text-3xl font-bold text-charcoal md:text-4xl">
              Accountant. Professor. Adviser.
            </h1>
            <div class="mt-8 space-y-4 text-grey-500 max-w-[600px]">
              <p>[PLACEHOLDER: Justin's story — the accountant years. Career narrative describing his early career and building deep expertise in financial analysis, costing, and commercial decision-making.]</p>
              <p>[PLACEHOLDER: The professor years. His time at La Trobe University teaching accounting, developing a reputation for making finance accessible and practical.]</p>
              <p>[PLACEHOLDER: The adviser years. Why he moved into independent consulting, his philosophy of transparency and generosity, and what drives him today.]</p>
            </div>
          </div>
          <div class="w-64 h-80 rounded-lg bg-grey-200 flex items-center justify-center text-grey-500 text-sm shrink-0">
            [PLACEHOLDER: Portrait]
          </div>
        </div>
      </div>
    </section>

    <!-- Why free tools -->
    <section class="bg-white py-16">
      <div class="mx-auto max-w-[1200px] px-6">
        <h2 class="font-heading text-2xl font-bold text-charcoal">Why I give tools away for free</h2>
        <p class="mt-4 text-grey-500 max-w-[600px]">
          [PLACEHOLDER: Justin's explanation of his open-source consulting philosophy — the tools are free because better decisions shouldn't be trapped behind a sales conversation. If you want help interpreting the results or adapting the model, that's when you hire me.]
        </p>
      </div>
    </section>

    <!-- What I believe -->
    <section class="py-16">
      <div class="mx-auto max-w-[1200px] px-6">
        <h2 class="font-heading text-2xl font-bold text-charcoal">What I believe</h2>
        <ul class="mt-6 space-y-3 max-w-[600px]">
          <li class="flex items-start gap-3 text-grey-500">
            <span class="text-teal mt-1">&#10003;</span>
            Good decisions deserve clear assumptions
          </li>
          <li class="flex items-start gap-3 text-grey-500">
            <span class="text-teal mt-1">&#10003;</span>
            Public money deserves serious thought
          </li>
          <li class="flex items-start gap-3 text-grey-500">
            <span class="text-teal mt-1">&#10003;</span>
            Spreadsheets are useful servants and bad masters
          </li>
          <li class="flex items-start gap-3 text-grey-500">
            <span class="text-teal mt-1">&#10003;</span>
            Finance should help people decide, not intimidate them
          </li>
          <li class="flex items-start gap-3 text-grey-500">
            <span class="text-teal mt-1">&#10003;</span>
            Reviews should teach, not punish
          </li>
        </ul>
      </div>
    </section>

    <!-- Ethics -->
    <section class="bg-teal-light py-16">
      <div class="mx-auto max-w-[1200px] px-6">
        <h2 class="font-heading text-2xl font-bold text-charcoal">Ethics and independence</h2>
        <p class="mt-4 text-grey-500 max-w-[600px]">
          [PLACEHOLDER: Justin's commitment to the principles of APES 110 — integrity, objectivity, professional competence and due care, confidentiality, and professional behaviour — translated into plain English.]
        </p>
      </div>
    </section>

    <!-- Downloads -->
    <section class="py-16">
      <div class="mx-auto max-w-[1200px] px-6">
        <h2 class="font-heading text-2xl font-bold text-charcoal">Downloads</h2>
        <div class="mt-6 flex flex-wrap gap-4">
          <Button href="/downloads/cv-justin-lachal.pdf" variant="secondary">Download CV (PDF)</Button>
          <Button href="/downloads/capability-statement.pdf" variant="secondary">Capability Statement (PDF)</Button>
        </div>
      </div>
    </section>
  </article>
</PageLayout>
```

- [ ] **Step 2: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/about.astro
git commit -m "feat: add About page with placeholder content"
```

---

### Task 12: Pricing + FAQ pages

**Files:**
- Create: `website/src/pages/pricing.astro`
- Create: `website/src/pages/faq.astro`

- [ ] **Step 1: Create pricing.astro**

```astro
---
// website/src/pages/pricing.astro
import PageLayout from '../layouts/PageLayout.astro';
import Card from '../components/ui/Card.astro';
import ContactCTA from '../components/shared/ContactCTA.astro';

const tiers = [
  { name: 'Quick question', desc: 'Short call or written answer to a specific question.', note: 'Fixed fee' },
  { name: 'Spreadsheet review', desc: 'Review and annotate an existing financial model.', note: 'Fixed fee' },
  { name: 'Decision memo', desc: 'Assumptions sheet, working model, and written recommendation.', note: 'Fixed fee' },
  { name: 'Review sprint', desc: 'Focused 1–2 week review engagement with findings report.', note: 'Scoped fee' },
  { name: 'Workshop day', desc: 'Full-day facilitated session for your board or leadership team.', note: 'Fixed fee' },
  { name: 'Full review project', desc: 'Scoped multi-week engagement — post-implementation review, performance review, or strategy project.', note: 'Scoped fee' },
  { name: 'Ongoing advisory', desc: 'Retained arrangement for regular strategic and financial advice.', note: 'Monthly retainer' },
];
---
<PageLayout title="Pricing" description="Transparent, fixed-fee options. Modest rates. Community and public-interest concessions.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <h1 class="font-heading text-3xl font-bold text-charcoal md:text-4xl text-center">Pricing</h1>
      <p class="mt-4 text-center text-lg text-grey-500 max-w-[540px] mx-auto">
        Transparent fixed-fee options where possible. Modest rates. Community and public-interest concessions. Scoped to fit the problem, not the budget.
      </p>
      <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map(t => (
          <Card>
            <h3 class="font-heading text-lg font-bold text-charcoal">{t.name}</h3>
            <p class="mt-2 text-sm text-grey-500">{t.desc}</p>
            <p class="mt-4 text-xs font-medium text-teal">{t.note}</p>
          </Card>
        ))}
      </div>
      <p class="mt-12 text-center text-sm text-grey-500">
        All engagements begin with a free scoping conversation to understand your situation and agree on scope and fee.
      </p>
    </div>
  </section>
  <ContactCTA heading="Let's scope it" text="Book a short scoping call — no obligation, no pressure." />
</PageLayout>
```

- [ ] **Step 2: Create faq.astro**

```astro
---
// website/src/pages/faq.astro
import PageLayout from '../layouts/PageLayout.astro';

const faqs = [
  {
    q: 'What industries do you work with?',
    a: 'Any organisation that makes financial decisions — local councils, NFPs, SMEs, boards, and government agencies. The models and methods apply across sectors.',
  },
  {
    q: 'How is your work different from an audit?',
    a: 'My reviews are consulting engagements — independent assessments focused on learning and improvement. They are not statutory audits and do not carry the regulatory obligations of a registered company auditor engagement.',
  },
  {
    q: 'How long does a typical engagement take?',
    a: 'A decision memo might take a week. A post-implementation review typically takes 2–4 weeks. A full strategy project depends on scope — we agree timing before starting.',
  },
  {
    q: 'Can I use the free tools without hiring you?',
    a: 'Absolutely. That is the whole point. The models and checklists are designed to be useful on their own. If you want help adapting them to your situation, that is when you engage me.',
  },
  {
    q: 'How do you handle confidentiality?',
    a: 'All client work is treated as confidential. Case notes published on this site are always de-identified and shared only with permission.',
  },
  {
    q: 'What does a scoping call involve?',
    a: 'A short conversation — usually 15–30 minutes — to understand your situation, agree on the question to answer, and discuss scope and fee. No obligation.',
  },
];
---
<PageLayout title="FAQ" description="Common questions about how Justin works, what he charges, and how engagements are structured.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[800px] px-6">
      <h1 class="font-heading text-3xl font-bold text-charcoal md:text-4xl text-center">
        Frequently asked questions
      </h1>
      <div class="mt-12 space-y-8">
        {faqs.map(faq => (
          <div class="border-b border-grey-200 pb-8">
            <h2 class="font-heading text-lg font-bold text-charcoal">{faq.q}</h2>
            <p class="mt-3 text-grey-500">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 3: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add website/src/pages/pricing.astro website/src/pages/faq.astro
git commit -m "feat: add Pricing and FAQ pages"
```

---

### Task 13: Contact page with Formspree

**Files:**
- Create: `website/src/pages/contact.astro`

- [ ] **Step 1: Create contact.astro**

Note: Replace `YOUR_FORMSPREE_ID` with the actual Formspree endpoint ID once created at formspree.io.

```astro
---
// website/src/pages/contact.astro
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout title="Contact" description="Get in touch with Justin — whether you need help with a decision, a review, a workshop, or a public-interest idea.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[800px] px-6">
      <h1 class="font-heading text-3xl font-bold text-charcoal md:text-4xl text-center">
        Get in touch
      </h1>
      <p class="mt-4 text-center text-grey-500">
        Select the option that best describes your enquiry, then fill in the details below.
      </p>

      <!-- Pathway buttons -->
      <div class="mt-8 grid gap-3 sm:grid-cols-2" id="pathways">
        <button data-pathway="decision" class="pathway-btn rounded-lg border-2 border-grey-200 p-4 text-left text-sm font-medium text-charcoal hover:border-teal transition-colors">
          I need help with a decision
        </button>
        <button data-pathway="review" class="pathway-btn rounded-lg border-2 border-grey-200 p-4 text-left text-sm font-medium text-charcoal hover:border-teal transition-colors">
          I need a review
        </button>
        <button data-pathway="workshop" class="pathway-btn rounded-lg border-2 border-grey-200 p-4 text-left text-sm font-medium text-charcoal hover:border-teal transition-colors">
          I want a workshop or talk
        </button>
        <button data-pathway="public" class="pathway-btn rounded-lg border-2 border-grey-200 p-4 text-left text-sm font-medium text-charcoal hover:border-teal transition-colors">
          I want to discuss a public-interest idea
        </button>
      </div>

      <!-- Contact form -->
      <form
        action="https://formspree.io/f/YOUR_FORMSPREE_ID"
        method="POST"
        class="mt-10 space-y-6"
      >
        <input type="hidden" name="pathway" id="pathway-field" value="" />

        <div>
          <label for="description" class="block text-sm font-medium text-charcoal">
            What decision or review is involved?
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            required
            class="mt-2 w-full rounded-md border border-grey-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          ></textarea>
        </div>

        <div>
          <label for="organisation" class="block text-sm font-medium text-charcoal">
            Organisation
          </label>
          <input
            type="text"
            id="organisation"
            name="organisation"
            class="mt-2 w-full rounded-md border border-grey-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </div>

        <div>
          <label for="timing" class="block text-sm font-medium text-charcoal">
            Timing / urgency
          </label>
          <input
            type="text"
            id="timing"
            name="timing"
            class="mt-2 w-full rounded-md border border-grey-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </div>

        <div>
          <label for="documents" class="block text-sm font-medium text-charcoal">
            What documents already exist?
          </label>
          <input
            type="text"
            id="documents"
            name="documents"
            class="mt-2 w-full rounded-md border border-grey-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </div>

        <div>
          <label for="preference" class="block text-sm font-medium text-charcoal">
            Preference
          </label>
          <select
            id="preference"
            name="preference"
            class="mt-2 w-full rounded-md border border-grey-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          >
            <option value="">Select...</option>
            <option value="call">Call first</option>
            <option value="written">Written response first</option>
          </select>
        </div>

        <div>
          <label for="doc-links" class="block text-sm font-medium text-charcoal">
            Link to relevant documents (e.g., Google Drive, Dropbox) — optional
          </label>
          <input
            type="url"
            id="doc-links"
            name="doc-links"
            class="mt-2 w-full rounded-md border border-grey-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-md bg-teal px-6 py-3 text-sm font-medium text-white hover:bg-teal-dark transition-colors"
        >
          Send enquiry
        </button>
      </form>
    </div>
  </section>
</PageLayout>

<script>
  const buttons = document.querySelectorAll('.pathway-btn');
  const field = document.getElementById('pathway-field') as HTMLInputElement;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('border-teal', 'bg-teal-light'));
      btn.classList.add('border-teal', 'bg-teal-light');
      field.value = (btn as HTMLElement).dataset.pathway || '';
    });
  });
</script>
```

- [ ] **Step 2: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/contact.astro
git commit -m "feat: add Contact page with Formspree form and pathway buttons"
```

---

### Task 14: Resources page with client-side filtering

**Files:**
- Create: `website/src/pages/resources.astro`
- Create: `website/src/content/resources/` (9 placeholder .md files)

- [ ] **Step 1: Create 9 resource placeholder .md files**

Each file follows this pattern:

`website/src/content/resources/financial-model-template.md`:
```markdown
---
title: "One-Page Financial Model Template"
description: "A clean template for building one-page financial models with separated assumptions and outputs."
date: 2026-04-01
downloadUrl: ""
audience:
  - boards
  - smes
topics:
  - costing
format: template
featured: true
---

[PLACEHOLDER: Description of the template and how to use it.]
```

Create similarly for: `board-decision-memo.md`, `post-implementation-review-kit.md`, `month-end-health-check.md`, `aged-receivables-checklist.md`, `force-field-analysis-worksheet.md`, `eighty-twenty-prioritisation.md`, `program-benefits-register.md`, `sample-assumptions-sheet.md`.

Use appropriate `format` values: `template`, `checklist`, `worksheet`, `model`.

- [ ] **Step 2: Create resources.astro with client-side filtering**

```astro
---
// website/src/pages/resources.astro
import { getCollection } from 'astro:content';
import PageLayout from '../layouts/PageLayout.astro';
import Card from '../components/ui/Card.astro';
import SectionHeading from '../components/ui/SectionHeading.astro';

const resources = (await getCollection('resources')).sort((a, b) =>
  b.data.date.getTime() - a.data.date.getTime()
);

const formats = [...new Set(resources.map(r => r.data.format))].sort();
const topics = [...new Set(resources.flatMap(r => r.data.topics || []))].sort();
---
<PageLayout title="Resources" description="Free downloadable models, checklists, templates and worksheets. Use them yourself or hire Justin to adapt them.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading
        title="Resources"
        subtitle="Free tools you can download and use right now."
      />

      <!-- Filter bar -->
      <div class="mb-8 flex flex-wrap gap-2" id="filter-bar">
        <button class="filter-btn active rounded-full bg-teal px-4 py-1.5 text-xs font-medium text-white" data-filter="all">
          All
        </button>
        {formats.map(f => (
          <button class="filter-btn rounded-full bg-grey-200 px-4 py-1.5 text-xs font-medium text-grey-500 hover:bg-teal hover:text-white transition-colors" data-filter={`format:${f}`}>
            {f}
          </button>
        ))}
        {topics.map(t => (
          <button class="filter-btn rounded-full bg-grey-200 px-4 py-1.5 text-xs font-medium text-grey-500 hover:bg-teal hover:text-white transition-colors" data-filter={`topic:${t}`}>
            {t}
          </button>
        ))}
      </div>

      <!-- Resource grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="resource-grid">
        {resources.map(r => (
          <div class="resource-card" data-format={r.data.format} data-topics={(r.data.topics || []).join(',')}>
            <Card>
              <span class="inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold mb-3">
                {r.data.format}
              </span>
              <h3 class="font-heading text-lg font-bold text-charcoal">{r.data.title}</h3>
              <p class="mt-2 text-sm text-grey-500">{r.data.description}</p>
              {r.data.downloadUrl ? (
                <a href={r.data.downloadUrl} class="mt-4 inline-block text-sm font-medium text-teal hover:text-teal-dark">
                  Download &darr;
                </a>
              ) : (
                <span class="mt-4 inline-block text-sm text-grey-500">[Coming soon]</span>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  </section>
</PageLayout>

<script>
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.resource-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('active', 'bg-teal', 'text-white');
        b.classList.add('bg-grey-200', 'text-grey-500');
      });
      btn.classList.add('active', 'bg-teal', 'text-white');
      btn.classList.remove('bg-grey-200', 'text-grey-500');

      const filter = (btn as HTMLElement).dataset.filter || 'all';

      cards.forEach(card => {
        const el = card as HTMLElement;
        if (filter === 'all') {
          el.style.display = '';
        } else if (filter.startsWith('format:')) {
          const val = filter.replace('format:', '');
          el.style.display = el.dataset.format === val ? '' : 'none';
        } else if (filter.startsWith('topic:')) {
          const val = filter.replace('topic:', '');
          const topics = (el.dataset.topics || '').split(',');
          el.style.display = topics.includes(val) ? '' : 'none';
        }
      });
    });
  });
</script>
```

- [ ] **Step 3: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add website/src/content/resources/ website/src/pages/resources.astro
git commit -m "feat: add Resources page with client-side filtering and 9 placeholder resources"
```

---

### Task 15: Public Work + Case Notes pages

**Files:**
- Create: `website/src/pages/public-work/index.astro`
- Create: `website/src/pages/public-work/[slug].astro`
- Create: `website/src/pages/case-notes/index.astro`
- Create: `website/src/pages/case-notes/[slug].astro`
- Create: `website/src/layouts/ContentLayout.astro`
- Create: placeholder content in `articles/` and `case-notes/`

- [ ] **Step 1: Create ContentLayout.astro**

Shared layout for articles and case notes.

```astro
---
// website/src/layouts/ContentLayout.astro
import PageLayout from './PageLayout.astro';

interface Props {
  title: string;
  description: string;
  date: Date;
  backLink: string;
  backLabel: string;
}

const { title, description, date, backLink, backLabel } = Astro.props;
---
<PageLayout title={title} description={description}>
  <article class="py-16">
    <div class="mx-auto max-w-[800px] px-6">
      <a href={backLink} class="text-sm text-teal hover:text-teal-dark">&larr; {backLabel}</a>
      <h1 class="mt-6 font-heading text-3xl font-bold text-charcoal md:text-4xl">{title}</h1>
      <p class="mt-2 text-sm text-grey-500">
        {date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div class="mt-10 prose max-w-none">
        <slot />
      </div>
    </div>
  </article>
</PageLayout>
```

- [ ] **Step 2: Create placeholder article**

`website/src/content/articles/decisions-deserve-assumptions.md`:
```markdown
---
title: "Good Decisions Deserve Clear Assumptions"
description: "Why the assumptions page matters more than the model — and how to write one."
date: 2026-04-01
topics:
  - strategy
  - costing
featured: true
---

[PLACEHOLDER: Essay about why explicitly stating assumptions is the most important part of any financial model. How hidden assumptions cause bad decisions. How to write a one-page assumptions sheet.]
```

- [ ] **Step 3: Create placeholder case notes (3)**

`website/src/content/case-notes/costing-decision-example.md`:
```markdown
---
title: "Case Note: Testing a Lease-or-Buy Decision"
description: "How a simple model changed the conversation for a regional council considering new fleet vehicles."
date: 2026-04-01
topics:
  - costing
featured: true
---

## Context

[PLACEHOLDER: De-identified case about a council deciding whether to lease or purchase fleet vehicles.]

## The question

Should the council lease new vehicles or purchase outright?

## What we looked at

[PLACEHOLDER: The assumptions, model structure, and key variables examined.]

## What changed

[PLACEHOLDER: How the model revealed unexpected costs in the leasing option.]

## Lesson

[PLACEHOLDER: The broader principle this case illustrates about hidden costs in leasing arrangements.]
```

Create similarly: `post-implementation-review-example.md` (topics: reviews) and `finance-function-improvement.md` (topics: finance-function).

- [ ] **Step 4: Create public-work pages**

`website/src/pages/public-work/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';
import ContentCard from '../../components/shared/ContentCard.astro';
import SectionHeading from '../../components/ui/SectionHeading.astro';

const articles = (await getCollection('articles')).sort((a, b) =>
  b.data.date.getTime() - a.data.date.getTime()
);
---
<PageLayout title="Public Work" description="Essays, notes, and public thinking on finance, decisions, and strategy.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading
        title="Public Work"
        subtitle="I publish methods and models because better decisions should not be trapped behind a sales conversation."
      />
      {articles.length > 0 ? (
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(a => (
            <ContentCard
              title={a.data.title}
              description={a.data.description}
              href={`/public-work/${a.id}`}
              topics={a.data.topics}
              date={a.data.date}
            />
          ))}
        </div>
      ) : (
        <p class="text-center text-grey-500">Articles coming soon.</p>
      )}
    </div>
  </section>
</PageLayout>
```

`website/src/pages/public-work/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map(article => ({
    params: { slug: article.id },
    props: { article },
  }));
}

const { article } = Astro.props;
const { Content } = await render(article);
---
<ContentLayout
  title={article.data.title}
  description={article.data.description}
  date={article.data.date}
  backLink="/public-work"
  backLabel="Back to Public Work"
>
  <Content />
</ContentLayout>
```

- [ ] **Step 5: Create case-notes pages**

`website/src/pages/case-notes/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';
import ContentCard from '../../components/shared/ContentCard.astro';
import SectionHeading from '../../components/ui/SectionHeading.astro';

const caseNotes = (await getCollection('case-notes')).sort((a, b) =>
  b.data.date.getTime() - a.data.date.getTime()
);
---
<PageLayout title="Case Notes" description="De-identified case studies — each written as a teaching case with context, question, findings, and lessons.">
  <section class="py-16 md:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <SectionHeading
        title="Case Notes"
        subtitle="Real engagements, de-identified and written as teaching cases."
      />
      {caseNotes.length > 0 ? (
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caseNotes.map(c => (
            <ContentCard
              title={c.data.title}
              description={c.data.description}
              href={`/case-notes/${c.id}`}
              topics={c.data.topics}
              date={c.data.date}
            />
          ))}
        </div>
      ) : (
        <p class="text-center text-grey-500">Case notes coming soon.</p>
      )}
    </div>
  </section>
</PageLayout>
```

`website/src/pages/case-notes/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';

export async function getStaticPaths() {
  const caseNotes = await getCollection('case-notes');
  return caseNotes.map(note => ({
    params: { slug: note.id },
    props: { note },
  }));
}

const { note } = Astro.props;
const { Content } = await render(note);
---
<ContentLayout
  title={note.data.title}
  description={note.data.description}
  date={note.data.date}
  backLink="/case-notes"
  backLabel="Back to Case Notes"
>
  <Content />
</ContentLayout>
```

- [ ] **Step 6: Verify build**

```bash
cd website && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add website/src/layouts/ContentLayout.astro website/src/pages/public-work/ website/src/pages/case-notes/ website/src/content/articles/ website/src/content/case-notes/
git commit -m "feat: add Public Work, Case Notes pages with placeholder content"
```

---

## Chunk 5: SEO, Deploy Pipeline, E2E Tests

### Task 16: SEO and accessibility

**Files:**
- Modify: `website/src/layouts/BaseLayout.astro` (add JSON-LD)
- Modify: `website/astro.config.mjs` (add sitemap)
- Create: `website/public/favicon.svg`

- [ ] **Step 1: Install sitemap integration**

```bash
cd website && npx astro add sitemap --yes
```

- [ ] **Step 2: Add JSON-LD structured data to BaseLayout**

Add inside the `<head>` of `BaseLayout.astro`, after the OG meta tags:

```html
<!-- Structured data -->
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Justin Lachal",
  "description": "Independent accounting, costing and strategy advice for consequential decisions.",
  "url": Astro.site?.toString(),
  "founder": {
    "@type": "Person",
    "name": "Justin Lachal",
    "jobTitle": "Independent Adviser",
    "alumniOf": "La Trobe University"
  },
  "areaServed": "Australia",
  "serviceType": ["Financial Consulting", "Post-Implementation Reviews", "Strategy Consulting"]
})} />
```

- [ ] **Step 3: Create robots.txt**

`website/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://justinlachal.github.io/website/sitemap-index.xml
```

- [ ] **Step 4: Create minimal favicon**

`website/public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#1A6B5C"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="white">JL</text>
</svg>
```

- [ ] **Step 5: Add favicon link to BaseLayout.astro head**

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 6: Verify build**

```bash
cd website && npm run build
```

Confirm `sitemap-index.xml` appears in the build output.

- [ ] **Step 7: Commit**

```bash
git add website/src/layouts/BaseLayout.astro website/astro.config.mjs website/public/favicon.svg website/public/robots.txt
git commit -m "feat: add SEO — JSON-LD, sitemap, OG meta, favicon"
```

---

### Task 17: GitHub Actions deploy pipeline

**Files:**
- Create: `website/.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy.yml**

```yaml
# website/.github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: website/package-lock.json

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: npm ci
        working-directory: website

      - name: Build
        run: npm run build
        working-directory: website

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: website/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('website/.github/workflows/deploy.yml'))"
```

- [ ] **Step 3: Commit**

```bash
git add website/.github/
git commit -m "feat: add GitHub Actions deploy pipeline for GitHub Pages"
```

---

### Task 18: E2E tests with Playwright

**Files:**
- Create: `website/playwright.config.ts`
- Create: `website/e2e/navigation.spec.ts`
- Create: `website/e2e/pages.spec.ts`
- Create: `website/e2e/contact-form.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd website && npm install -D @playwright/test && npx playwright install chromium
```

- [ ] **Step 2: Create playwright.config.ts**

```typescript
// website/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:4321/website/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Create navigation.spec.ts**

```typescript
// website/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Home.*Justin Lachal/);
  });

  test('header contains all nav links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');
    await expect(nav.getByText('Services')).toBeVisible();
    await expect(nav.getByText('Spreadsheet Says')).toBeVisible();
    await expect(nav.getByText('Resources')).toBeVisible();
    await expect(nav.getByText('About')).toBeVisible();
    await expect(nav.getByText('Contact')).toBeVisible();
  });

  test('clicking Services navigates to services page', async ({ page }) => {
    await page.goto('/');
    await page.locator('header nav').getByText('Services').click();
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator('h1, h2').first()).toContainText('Services');
  });

  test('footer contains pricing and FAQ links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByText('Pricing')).toBeVisible();
    await expect(footer.getByText('FAQ')).toBeVisible();
  });
});
```

- [ ] **Step 4: Create pages.spec.ts**

```typescript
// website/e2e/pages.spec.ts
import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', titleMatch: /Home/ },
  { path: '/services', titleMatch: /Services/ },
  { path: '/services/costing', titleMatch: /Costing/ },
  { path: '/spreadsheet-says', titleMatch: /Spreadsheet Says/ },
  { path: '/resources', titleMatch: /Resources/ },
  { path: '/about', titleMatch: /About/ },
  { path: '/pricing', titleMatch: /Pricing/ },
  { path: '/contact', titleMatch: /Contact/ },
  { path: '/faq', titleMatch: /FAQ/ },
  { path: '/public-work', titleMatch: /Public Work/ },
  { path: '/case-notes', titleMatch: /Case Notes/ },
];

for (const { path, titleMatch } of pages) {
  test(`${path} loads successfully`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(titleMatch);
  });
}

test('services page lists all 6 services', async ({ page }) => {
  await page.goto('/services');
  const cards = page.locator('[href*="/services/"]');
  await expect(cards).toHaveCount(6);
});

test('spreadsheet-says page lists models', async ({ page }) => {
  await page.goto('/spreadsheet-says');
  const cards = page.locator('[href*="/spreadsheet-says/"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(1);
});
```

- [ ] **Step 5: Create contact-form.spec.ts**

```typescript
// website/e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('pathway buttons update hidden field', async ({ page }) => {
    await page.goto('/contact');

    // Click "I need a review" pathway
    await page.getByText('I need a review').click();
    const hidden = page.locator('#pathway-field');
    await expect(hidden).toHaveValue('review');

    // Click "I want a workshop" pathway
    await page.getByText('I want a workshop or talk').click();
    await expect(hidden).toHaveValue('workshop');
  });

  test('form has all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#organisation')).toBeVisible();
    await expect(page.locator('#timing')).toBeVisible();
    await expect(page.locator('#preference')).toBeVisible();
  });

  test('description field is required', async ({ page }) => {
    await page.goto('/contact');
    const description = page.locator('#description');
    await expect(description).toHaveAttribute('required', '');
  });
});
```

- [ ] **Step 6: Run tests**

```bash
cd website && npx playwright test
```

Expected: All tests pass.

- [ ] **Step 7: Add test script to package.json**

Add to `website/package.json` scripts:
```json
"test:e2e": "playwright test"
```

- [ ] **Step 8: Commit**

```bash
git add website/playwright.config.ts website/e2e/ website/package.json website/package-lock.json
git commit -m "feat: add Playwright e2e tests for navigation, pages, and contact form"
```

---

### Task 19: README and final build verification

**Files:**
- Create: `website/README.md`
- Create: `website/public/downloads/.gitkeep`
- Create: `website/public/images/.gitkeep`

- [ ] **Step 1: Create placeholder directories**

```bash
mkdir -p website/public/downloads website/public/images/spreadsheet-screenshots
touch website/public/downloads/.gitkeep website/public/images/.gitkeep website/public/images/spreadsheet-screenshots/.gitkeep
```

- [ ] **Step 2: Create README.md**

```markdown
# Justin Lachal — Consulting Website

Static website built with [Astro 5](https://astro.build) and [Tailwind CSS 4](https://tailwindcss.com). Hosted on GitHub Pages.

## Development

```bash
cd website
npm install
npm run dev        # Start dev server at localhost:4321
npm run build      # Build for production
npm run preview    # Preview production build
npm run test:e2e   # Run Playwright e2e tests
```

## Adding Content

All content lives in `src/content/` as Markdown files with frontmatter.

### Add a new Spreadsheet Says model

1. Create `src/content/models/your-model-name.md`
2. Follow the frontmatter schema (see any existing model for reference)
3. Set `sheetUrl` to a published Google Sheet embed URL
4. Set `downloadUrl` to the direct download link
5. Commit and push — GitHub Actions deploys automatically

### Add a new resource

1. Create `src/content/resources/your-resource.md`
2. Upload the downloadable file to `public/downloads/`
3. Set `downloadUrl` in frontmatter to `/downloads/your-file.xlsx`

### Add an article or case note

1. Create in `src/content/articles/` or `src/content/case-notes/`
2. Follow the frontmatter schema
3. Write the body in Markdown

## Deployment

Pushes to `main` trigger GitHub Actions to build and deploy to GitHub Pages.

To configure a custom domain:
1. Add a `CNAME` file to `public/` with the domain name
2. Update `site` in `astro.config.mjs`
3. Remove the `base` property from `astro.config.mjs`
4. Configure DNS per GitHub Pages docs
```

- [ ] **Step 3: Run full build**

```bash
cd website && npm run build
```

Expected: Clean build, no warnings, no errors.

- [ ] **Step 4: Run e2e tests**

```bash
cd website && npm run test:e2e
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add website/README.md website/public/
git commit -m "feat: add README with content update instructions and placeholder directories"
```

- [ ] **Step 6: Final commit — mark spec as implemented**

```bash
git add -A
git commit -m "chore: Justin Lachal website — implementation complete, ready for content"
```
