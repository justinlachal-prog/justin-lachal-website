# Justin Lachal Website — Design Spec

**Date:** 2026-04-04
**Status:** Draft
**Author:** Dennis Wollersheim + Claude

---

## 1. Overview

Build a professional consulting website for Justin Lachal, a fellow-qualified accountant, former La Trobe University accounting professor, and independent adviser with 30+ years of experience. The site positions Justin as a one-person institute — part consulting practice, part public classroom, part decision lab — rather than a generic accounting firm.

### Goals

- Establish credibility and trust through transparency
- Showcase free tools ("Spreadsheet Says" models) as the primary lead magnet
- Convert visitors into consulting engagements via clear service descriptions and intake forms
- Grow over time as a content library (models, essays, checklists, case notes)

### Non-Goals

- No e-commerce or payment processing
- No user accounts or authentication
- No custom web-based spreadsheet applications
- No CMS at launch (can add Decap CMS later)
- No newsletter system at launch (can add Buttondown later)
- No blog — "Public Work" serves as the essay/thinking section, organized as a library not a date-ordered blog

---

## 2. Brand & Positioning

**Master brand:** Justin Lachal (personal name as brand — his credibility is the product)

**Tagline:** *Better financial judgment for real-world decisions*

**Subhead:** Independent accounting, costing and strategy advice for consequential decisions

**Core values:**

| Value | Meaning |
|-------|---------|
| Clarity | Plain English. Explicit assumptions. No consulting fog. |
| Generosity | Real free tools, real spreadsheets, real checklists. |
| Independence | No hype, no vendor agenda, no pressure tactics. |
| Public value | Better financial decisions improve institutions, not just profits. |
| Rigour | Show working models, structured reviews, and disciplined thinking. |
| Practicality | Every page should answer: what problem does this solve, what do I get, what happens next? |

**Regulatory constraint:** The site must not use "audit" to describe services unless/until Justin holds a registered company auditor license. All review work uses precise alternative language:

- post-implementation review
- performance review
- operational review
- finance control review
- assurance-style advisory
- independent review

**Pricing philosophy:** Accessible, not cheap. Fixed-fee pathways. No hourly rate on the site. Value-guarantee framing where appropriate. Community and public-interest concessions.

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro 5 | Content collections map to his content types. Static output = fast, cheap, secure. |
| Styling | Tailwind CSS 4 | Rapid styling, good typography plugin. |
| Headings font | Source Serif 4 | Scholarly, editorial. |
| Body font | Inter | Clean, readable at all sizes. |
| Icons | Lucide | Minimal, consistent. |
| Hosting | GitHub Pages | Free, git-push deploys via GitHub Actions, custom domain support. |
| CI/CD | GitHub Actions | Build Astro on push to main, deploy to GitHub Pages. |
| Contact form | Formspree (free tier) | 50 submissions/month — sufficient for expected volume. No backend needed. Free tier does not support file uploads — see Section 6.10. |

**GitHub Pages deployment note:** `astro.config.mjs` must set `site` to the final URL. If deploying to a project repo without a custom domain (e.g., `https://<user>.github.io/<repo>/`), also set `base: '/<repo>'`. The GitHub Actions workflow must handle both scenarios. Once a custom domain is configured via the repo's Pages settings and CNAME file, `base` should be removed.
| Spreadsheet models | Embedded Google Sheets (view-only) + download links | Justin already works in spreadsheets. No need to rebuild as web apps. |
| Future CMS | Decap CMS (optional, add later) | Web UI for Justin to add content without touching code. |

---

## 4. Content Architecture

All content stored as Markdown files with typed frontmatter in Astro content collections:

```
src/content/
  services/           # 6 service pages
  models/             # "Spreadsheet Says" entries
  resources/          # Checklists, templates, worksheets
  case-notes/         # De-identified case studies
  articles/           # Essays, public thinking
```

Note: workshops/talks content lives on the static `/services/workshops` page, not in a separate content collection. A `workshops/` collection can be added later if Justin starts publishing enough events to warrant a listing page.

### Frontmatter Schema (common fields)

```yaml
title: string          # Required
description: string    # Required, used in meta tags and cards
date: date             # Required
audience:              # Optional, array
  - boards
  - councils
  - nfps
  - smes
  - individuals
topics:                # Optional, array
  - costing
  - strategy
  - reviews
  - property
  - governance
  - finance-function
format:                # Optional, for resources
  - model
  - checklist
  - template
  - article
  - worksheet
featured: boolean      # Optional, surfaces on home page
```

### Collection-Specific Fields

**services:**
```yaml
icon: string           # Lucide icon name
order: number          # Display order on overview page
forWhom: string        # "Who is this for" one-liner
whatYouGet: string[]   # Deliverables list
```

**models (Spreadsheet Says):**
```yaml
sheetUrl: string       # Google Sheets embed URL
downloadUrl: string    # Direct download link
assumptions: string    # One-page assumptions summary
verdict: string        # What the spreadsheet says
caveats: string        # What it cannot say
```

**resources:**
```yaml
downloadUrl: string    # File download link
```

Note: Email-gated downloads are a future enhancement (requires paid Formspree or a different service). At launch, all resources are freely downloadable.

---

## 5. Site Map & Navigation

### Top Navigation

```
Home | Services | Spreadsheet Says | Resources | About | Contact
```

### Footer Navigation

```
Pricing | FAQ | Capability Statement (PDF) | Privacy | Terms
```

### Full Page Tree

```
/                              Home
/about                         Story, ethics, beliefs, CV download
/services                      Overview — 6 service cards
/services/costing              Costing & commercial decisions
/services/reviews              Post-implementation reviews
/services/performance          Performance & governance reviews
/services/strategy             Strategy & decision support
/services/finance-function     Finance function strategy
/services/workshops            Workshops, speaking, mentoring
/spreadsheet-says              Hub listing all models
/spreadsheet-says/[slug]       Individual model page
/resources                     Filterable library of all downloadable resources
/public-work                   Essays and public thinking
/public-work/[slug]            Individual article (from articles/ collection)
/case-notes                    De-identified case studies
/case-notes/[slug]             Individual case note (from case-notes/ collection)
/pricing                       Fixed-fee pathways
/contact                       Intake form with 4 pathways
/faq                           Common questions
```

---

## 6. Page Designs

### 6.1 Home Page

Sections in order:

1. **Hero** — strong headshot (left), headline + subhead + 2 CTAs (right)
   - Headline: "Better financial judgment for real-world decisions"
   - Subhead: "Justin helps boards, councils, leaders and organisations make better decisions through practical costing, post-implementation reviews, performance reviews and clear strategic thinking."
   - CTA primary: "Work with Justin" → /contact
   - CTA secondary: "Explore free tools" → /spreadsheet-says

2. **Credibility strip** — single line with key credentials
   - Fellow-qualified accountant | 30 years' experience | Former professor of accounting, La Trobe University

3. **Decision examples** — horizontal band of real questions styled as cards/pills
   - "Caravan or motels?"
   - "Outsource finance or build the team?"
   - "Buy the software or wait?"
   - "Did the project deliver its promised benefits?"
   - "Which measures actually matter?"

4. **Service pillars** — 6 cards in a 3x2 grid, each with icon + title + one-liner + link
   - Costing and commercial decisions
   - Post-implementation reviews
   - Performance and governance reviews
   - Strategy and decision support
   - Finance function strategy
   - Workshops and speaking

5. **Spreadsheet Says teaser** — prominent section with screenshot of a real model
   - "Run the numbers. Then talk about what the numbers miss."
   - Link to /spreadsheet-says

6. **How he works** — 6-step horizontal strip
   1. Frame the decision
   2. Surface the assumptions
   3. Model what can be modeled
   4. Name what cannot be modeled
   5. Recommend action
   6. Review the outcome later

7. **Free resources preview** — 3 most useful downloads as cards

8. **Public work preview** — latest essay, latest model, latest case note

9. **Pricing philosophy** — short paragraph
   - Transparent, modest, fixed-fee where possible, community and public-interest work welcomed.

10. **Final CTA** — "Bring me your decision" → /contact

### 6.2 About Page

Not just biography — a statement of intent.

Sections:
- **Three-part story:** accountant → professor → adviser
- **Why he gives tools away for free**
- **How he works with clients**
- **What he does not do** (important for setting expectations)
- **"What I believe" section:**
  - Good decisions deserve clear assumptions
  - Public money deserves serious thought
  - Spreadsheets are useful servants and bad masters
  - Finance should help people decide, not intimidate them
  - Reviews should teach, not punish
- **Ethics and independence statement** (based on APES 110: integrity, objectivity, professional competence, confidentiality, professional behaviour — translated to plain English)
- **Downloads:** CV (PDF), one-page capability statement (PDF)
- **CTA:** link to /contact and /services/workshops

### 6.3 Services Overview

6 outcome-based cards, each answering:
- What is this for?
- Who is it for?
- What do you get?
- What happens next?

Each card links to its dedicated subpage.

### 6.4 Service Subpages (x6)

Each service page follows a consistent template:

1. **Headline** — action-oriented, not jargon
2. **The problem** — what decisions or questions this addresses
3. **Examples** — vivid, real-world scenarios
4. **What you get** — concrete deliverables list
5. **How it works** — process steps
6. **Timing and pricing** — indicative fixed-fee range or "scoped to fit"
7. **Related resources** — auto-populated from matching content collections
8. **CTA** — "Discuss this with Justin" → /contact

#### 6.4.1 Costing & Commercial Decisions

Headline: "Before you buy it, build it, outsource it, or shut it down — test the decision."

Examples: caravan vs motels, outsource finance vs internal team, buy software vs keep current, hold vs sell property, employ vs contract, standardise vs customise.

Deliverables: one-page assumptions sheet, working spreadsheet model, short decision memo, board-ready summary, discussion session.

Introduces the **A/B/C/D decision framework** as signature IP:
- A: Strategic, values-laden decisions (need judgment)
- B: Judgment-heavy but modelable (need models + conversation)
- C: Routine enough for a spreadsheet to decide (need automation)
- D: Trivial (don't waste time)

#### 6.4.2 Post-Implementation Reviews

Headline: "Once the project is done, find out what actually happened."

Framed as learning and accountability, not blame.

Outputs: benefits assessment, lessons learned register, strengths/weaknesses summary, follow-up action plan, board summary, optional workshop.

#### 6.4.3 Performance & Governance Reviews

Headline: "Independent reviews of controls, reporting and organisational performance."

Covers: finance control reviews, reporting pack reviews, process walk-throughs, bank rec/cash control, aged receivables, budgeting/forecasting, KPI review, grant/program governance.

Includes **Review Packs** concept: each pack has a free summary checklist and a paid facilitated version.

#### 6.4.4 Strategy & Decision Support

Headline: "Simple tools for difficult choices."

Covers: force-field analysis, 80/20 prioritisation, option framing, scenario thinking, finance strategy, board decision support, leadership coaching.

Key quote: "Real decisions are rarely settled by one ratio. They need a sensible model, a clear conversation, and an honest look at trade-offs."

#### 6.4.5 Finance Function Strategy

Headline: "Build a finance function that helps people decide."

Questions: in-house vs outsourced? reporting pack design? which KPIs? month-end process? planning cycle? lean finance team roles?

Outputs: finance diagnostic, target operating model, reporting redesign, role clarity, 90-day improvement plan.

#### 6.4.6 Workshops, Speaking & Mentoring

Headline: "Teaching, workshops and public talks on finance, decisions and strategy."

Offerings: board workshops, leadership offsites, short courses, public-interest talks, mentoring, practitioner seminars.

Topics: better decisions with simple models, what post-implementation reviews teach, lessons from financial history, finance strategy for non-finance leaders, what a board should ask before approving major spend.

### 6.5 Spreadsheet Says (Hub)

Top-level nav item. The site's most distinctive feature.

**Hub page:** grid of model cards, each showing the question, a thumbnail, and audience tags. Filterable by topic.

**Individual model page template:**
1. The question (headline)
2. The assumptions (one-page summary)
3. The model (embedded Google Sheet, read-only)
4. What the spreadsheet says (the verdict)
5. What the spreadsheet cannot say (the caveats)
6. What might change the answer (sensitivity)
7. Download the file (button)
8. "Hire Justin to adapt this to your situation" (CTA → /contact)

**Launch with 5 entries:**
1. Caravan vs motels
2. Outsource finance vs internal team
3. Buy now vs wait
4. Own vs lease
5. Property hold vs sell

### 6.6 Resources (Library)

Filterable by topic, audience, and format. All resources are direct downloads (no individual detail pages).

**Filtering implementation:** Client-side JavaScript using an Astro `<script>` tag (no framework island needed). Tag/pill buttons filter a grid of resource cards by toggling CSS visibility. Simple, no dependencies.

Categories: models, templates, checklists, teaching notes, reading lists.

Note: "articles" are not resources — they live in the `articles/` collection and render at `/public-work/[slug]`. The resource library is strictly for downloadable files.

**Launch resources:**
- One-page financial model template
- Board decision memo template
- Post-implementation review starter kit
- Month-end close health check
- Aged receivables review checklist
- Force-field analysis worksheet
- 80/20 prioritisation sheet
- Program benefits register
- Sample assumptions sheet

All resources are freely downloadable at launch. Email-gated downloads are a future enhancement (see Section 12).

### 6.7 Public Work (Articles)

Essays and public thinking from the `articles/` content collection. Organized as a library (filterable, tagged), not a date-ordered blog. Renders at `/public-work/` and `/public-work/[slug]`.

Includes:
- Current questions Justin is exploring
- Public-interest project notes
- "What I'm thinking about now"

Key line: "I publish methods and models because better decisions should not be trapped behind a sales conversation."

### 6.8 Case Notes

Written as mini teaching cases, not sales blurbs. Separate content collection (`case-notes/`) with its own URL namespace: `/case-notes/` and `/case-notes/[slug]`.

Structure: context → question → what we looked at → what changed → lesson.

De-identified or illustrative where confidentiality requires.

The home page "Public work preview" section pulls from both `articles/` and `case-notes/` collections, sorted by date.

**Launch with 3:**
1. A costing decision
2. A post-implementation review
3. A finance function improvement

### 6.9 Pricing

Fixed-fee pathways:

| Tier | Description |
|------|-------------|
| Quick question / office hour | Short call or written answer |
| Spreadsheet review | Review and annotate an existing model |
| Decision memo | Assumptions sheet + model + recommendation |
| Review sprint | Focused 1-2 week review engagement |
| Workshop day | Full-day facilitated session |
| Full review project | Scoped multi-week engagement |
| Ongoing advisory | Retained arrangement |

Page states: transparent fixed-fee options, modest rates, community/public-interest concessions, scoped to fit the problem. No hourly rate displayed.

### 6.10 Contact

Intake-style form, not a generic contact form.

**4 pathway buttons** (selecting one pre-fills context):
1. I need help with a decision
2. I need a review
3. I want a workshop or talk
4. I want to discuss a public-interest idea

**Form fields:**
- What decision or review is involved (textarea)
- Organisation name
- Timing / urgency
- What documents already exist
- Preference: call first or written response first
- Optional: "Link to relevant documents (e.g., Google Drive, Dropbox)" (text field — Formspree free tier does not support file uploads)

### 6.11 FAQ

Common questions about how Justin works, what he charges, what industries he covers, how long engagements take, confidentiality, and the difference between his reviews and statutory audits.

---

## 7. Design System

**Tailwind 4 note:** There is no `tailwind.config.mjs`. Tailwind CSS 4 uses CSS-native configuration via `@theme` directives in `global.css`. Custom color tokens, fonts, and spacing are defined there, not in a JS config file. The Astro integration is `@tailwindcss/vite` (the old `@astrojs/tailwind` is deprecated).

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| charcoal | `#2D2D2D` | Primary text, headings |
| cream | `#FAF7F2` | Page background |
| white | `#FFFFFF` | Card backgrounds |
| teal | `#1A6B5C` | Accent — links, CTAs, active states |
| teal-light | `#E8F4F0` | Teal tint for backgrounds |
| gold | `#C5973B` | Secondary accent — highlights, badges |
| gold-light | `#FDF6E8` | Gold tint for backgrounds |
| grey-500 | `#6B7280` | Secondary text |
| grey-200 | `#E5E7EB` | Borders, dividers |

### Typography

- **Headings:** Source Serif 4, weights 600/700
- **Body:** Inter, weight 400, line-height 1.65
- **Mono (code/data):** JetBrains Mono (for spreadsheet references)
- **Max line length:** ~65ch for readability
- **Scale:** Based on a 1.25 ratio (major third)

### Spacing

- Consistent 8px base grid
- Section padding: 80px vertical (desktop), 48px (mobile)
- Card padding: 24px
- Component gaps: 16px / 24px / 32px

### Components

- **Card** — white background, subtle border, rounded corners (8px), optional icon
- **CTA button** — teal background, white text, rounded (6px), hover darkens
- **Secondary button** — teal outline, teal text, white background
- **Tag/pill** — small rounded label for audience/topic filtering
- **Section divider** — thin grey line or generous whitespace
- **Blockquote** — left teal border, italic, for Justin's statements
- **Credibility strip** — centered, grey-500 text, pipe-separated

### Layout

- Max content width: 1200px, centered
- Responsive breakpoints: 640px, 768px, 1024px, 1280px
- Mobile-first approach
- Navigation: horizontal on desktop, hamburger on mobile

### Imagery

- Strong portrait photography of Justin (provided by client)
- Screenshots of real spreadsheets and memos
- No stock photos
- No handshakes, skyscrapers, or "innovation" imagery

---

## 8. Project Structure

```
justin-lachal-website/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions: build + deploy to Pages
├── public/
│   ├── downloads/                  # PDFs, spreadsheet files
│   │   ├── capability-statement.pdf
│   │   └── cv-justin-lachal.pdf
│   ├── images/
│   │   ├── justin-headshot.jpg
│   │   └── spreadsheet-screenshots/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   └── MobileMenu.astro
│   │   ├── ui/
│   │   │   ├── Card.astro
│   │   │   ├── Button.astro
│   │   │   ├── Tag.astro
│   │   │   ├── SectionHeading.astro
│   │   │   └── CredibilityStrip.astro
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── DecisionExamples.astro
│   │   │   ├── ServicePillars.astro
│   │   │   ├── SpreadsheetTeaser.astro
│   │   │   ├── HowHeWorks.astro
│   │   │   ├── ResourcesPreview.astro
│   │   │   ├── PublicWorkPreview.astro
│   │   │   └── PricingPhilosophy.astro
│   │   └── shared/
│   │       ├── ContentCard.astro
│   │       ├── FilterBar.astro
│   │       ├── RelatedContent.astro
│   │       └── ContactCTA.astro
│   ├── content/
│   │   ├── services/
│   │   │   ├── costing.md
│   │   │   ├── reviews.md
│   │   │   ├── performance.md
│   │   │   ├── strategy.md
│   │   │   ├── finance-function.md
│   │   │   └── workshops.md
│   │   ├── models/
│   │   │   ├── caravan-vs-motels.md
│   │   │   ├── outsource-vs-internal.md
│   │   │   ├── buy-now-vs-wait.md
│   │   │   ├── own-vs-lease.md
│   │   │   └── property-hold-vs-sell.md
│   │   ├── resources/
│   │   ├── case-notes/
│   │   └── articles/
│   ├── layouts/
│   │   ├── BaseLayout.astro         # HTML shell, meta, fonts
│   │   ├── PageLayout.astro         # Standard page with header/footer
│   │   ├── ServiceLayout.astro      # Service subpage template
│   │   └── ContentLayout.astro      # Article/model/resource template
│   ├── pages/
│   │   ├── index.astro              # Home
│   │   ├── about.astro
│   │   ├── services/
│   │   │   ├── index.astro          # Services overview
│   │   │   └── [slug].astro         # Dynamic service subpages
│   │   ├── spreadsheet-says/
│   │   │   ├── index.astro          # Models hub
│   │   │   └── [slug].astro         # Individual model pages
│   │   ├── resources.astro
│   │   ├── public-work/
│   │   │   ├── index.astro          # Articles listing
│   │   │   └── [slug].astro         # Individual article
│   │   ├── case-notes/
│   │   │   ├── index.astro          # Case notes listing
│   │   │   └── [slug].astro         # Individual case note
│   │   ├── pricing.astro
│   │   ├── contact.astro
│   │   └── faq.astro
│   └── styles/
│       └── global.css               # Tailwind base + custom tokens
├── src/
│   └── content.config.ts           # Astro 5 content collection schemas (must be at src/ root)
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## 9. Launch Content Requirements

### From Justin (must provide)

- [ ] Professional headshot (high-res)
- [ ] Bio / career narrative
- [ ] 5 Google Sheets models (or content to build them)
- [ ] CV content
- [ ] Capability statement content
- [ ] Ethics/independence statement
- [ ] 3 case study outlines (can be de-identified)
- [ ] Any existing checklists, templates, or documents
- [ ] Domain name decision

### We Build

- [ ] All page templates and layouts
- [ ] Placeholder content clearly marked with [PLACEHOLDER] tags
- [ ] Sample "Spreadsheet Says" entry with full structure
- [ ] Contact form with Formspree integration
- [ ] Capability statement PDF template
- [ ] GitHub Actions deploy pipeline
- [ ] README with content update instructions for future maintainers

---

## 10. Content Growth Cadence

Post-launch rhythm:
- 1 Spreadsheet Says entry per month
- 1 essay/article per month
- 1 new checklist or model every 6-8 weeks
- 1 public talk or case note per quarter

LinkedIn marketing: weekly "Spreadsheet Says" series posts — screenshot of a model, short breakdown, link to the site.

---

## 11. Accessibility & SEO

- Semantic HTML throughout
- ARIA labels on interactive elements
- Alt text on all images
- Keyboard-navigable
- Open Graph meta tags for social sharing
- Structured data (JSON-LD) for Person, ProfessionalService
- sitemap.xml and robots.txt generated by Astro
- Page titles and meta descriptions per page

---

## 12. Future Enhancements (Not In Scope)

- Decap CMS for self-service content updates
- Newsletter (Buttondown or similar)
- Testimonials section (after first engagements)
- Booking calendar integration
- Analytics (Plausible or Fathom — privacy-respecting)
- Email-gated resource downloads (requires paid form service or custom solution)
- File upload on contact form (requires paid Formspree tier)
