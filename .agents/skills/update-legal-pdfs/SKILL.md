---
name: update-legal-pdfs
description: Regenerate the downloadable PDF copies of Remotion's Terms, Privacy Policy, DPA Statement, and DPIA Statement after editing their docs pages.
---

# Update legal PDFs

The source of truth is `packages/docs/docs/{terms,privacy,dpa,dpia}.mdx`. Do not edit the PDFs directly.

1. Run `python3 .agents/skills/update-legal-pdfs/scripts/generate.py` from the repository root. Use a Python environment with `reportlab` installed. In Codex desktop, `load_workspace_dependencies` provides one.
2. Review the four files in `packages/docs/static/docs/`. Confirm each PDF retains the source title, notices, headings, tables, links, and final contact details. Render the pages to check wrapping and page breaks.
3. Commit the changed MDX source and regenerated PDFs together. `/terms.pdf`, `/privacy.pdf`, `/dpa.pdf`, and `/dpia.pdf` redirect to the corresponding `/docs/*.pdf` files in `packages/docs/vercel.ts`.

The generator omits the MDX-only download link to avoid a PDF linking to itself. It keeps the source's legal status notices, including the upcoming Remotion 5.0 notices in the Terms and Privacy Policy.
