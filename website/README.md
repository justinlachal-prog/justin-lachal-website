# Justin Lachal -- Consulting Website

Static website built with [Astro 5](https://astro.build) and [Tailwind CSS 4](https://tailwindcss.com). Hosted on [GitHub Pages](https://justinlachal-prog.github.io/justin-lachal-website).

**Repo:** https://github.com/justinlachal-prog/justin-lachal-website

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
5. Commit and push -- GitHub Actions deploys automatically

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
