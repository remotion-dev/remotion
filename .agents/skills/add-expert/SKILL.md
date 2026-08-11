---
name: add-expert
description: Add a new expert to the Remotion experts page
---

## Steps

1. **Add the expert's photo** to both:
   - `packages/docs/static/img/freelancers/<firstname>.png`
   - `packages/promo-pages/public/img/freelancers/<firstname>.png`

   The image should be a square headshot (PNG format). Both paths must have the same file.

2. **Add an entry** to the `experts` array in `packages/promo-pages/src/components/experts/experts-data.tsx`:

   ```tsx
   {
       slug: 'firstname-lastname',
       name: 'First Last',
       image: '/img/freelancers/<firstname>.png',
       website: 'https://example.com' | null,
       x: 'twitter_handle' | null,
       github: 'github_username' | null,
       linkedin: 'in/linkedin-slug/' | null,
       email: 'email@example.com' | null,
       videocall: 'https://cal.com/...' | null,
       since: new Date('YYYY-MM-DD').getTime(),
       description: (
           <div>
               A short description of the expert's work and specialties.
               Links to projects can be included with <a> tags.
           </div>
       ),
   },
   ```

   - `since` should be set to today's date
   - `slug` must be lowercase, hyphenated version of the name
   - Set unused social fields to `null`
   - The entry goes at the end of the `experts` array (before the closing `]`)

3. **Render the expert card** by running in `packages/docs`:

   ```
   bun render-cards
   ```

   This generates `packages/docs/static/generated/experts-<slug>.png`. Verify it says "Rendered experts-\<slug\>" (not "Existed").
