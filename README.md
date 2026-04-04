# Justin Lachal — Independent Financial Adviser

**Live site:** [realmindsai.github.io/justin-lachal-website](https://realmindsai.github.io/justin-lachal-website/)

Consulting website for Justin Lachal, a Fellow Chartered Accountant with 20+ years in finance (KPMG, ANZ Banking Group, Jones Lang LaSalle) and current board director of Jesuit Social Services and SuniTAFE.

The site positions Justin as a one-person institute — part consulting practice, part public classroom, part decision lab — offering independent accounting, costing and strategy advice for consequential decisions.

## What the site does

- **Spreadsheet Says** — free, downloadable financial models (caravan vs motels, outsource vs internal, buy vs lease, etc.) that show assumptions, verdicts, and caveats
- **Six service areas** — costing, post-implementation reviews, performance reviews, strategy, finance function strategy, workshops
- **Resources library** — checklists, templates, and worksheets with client-side filtering
- **Public Work + Case Notes** — essays and de-identified teaching cases
- **Contact intake** — pathway-based form (decision / review / workshop / public-interest) via Formspree

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro 5](https://astro.build) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Content | Markdown with typed Zod schemas (5 content collections) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (build + deploy on push to main) |
| Contact form | [Formspree](https://formspree.io) |
| E2E tests | [Playwright](https://playwright.dev) (20 tests) |

## Development

```bash
cd website
npm install
npm run dev          # Dev server at localhost:4321
npm run build        # Production build
npm run test:e2e     # Playwright e2e tests
```

## Adding content

All content lives in `website/src/content/` as Markdown files with frontmatter. Push to `main` and GitHub Actions deploys automatically.

See [`website/README.md`](website/README.md) for detailed content authoring instructions.

## Custom domain

1. Add a `CNAME` file to `website/public/` containing the domain name
2. Update `site` in `website/astro.config.mjs` to the custom domain
3. Remove the `base` property from `website/astro.config.mjs`
4. Configure DNS per [GitHub Pages docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
