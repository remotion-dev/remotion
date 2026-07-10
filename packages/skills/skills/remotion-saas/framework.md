---
name: framework
description: Choose a framework, template, or cloud rendering architecture for a Remotion SaaS app.
metadata:
  tags: remotion, saas, templates, nextjs, react-router, vercel, lambda, cloudflare
---

# Framework

Use this guide when a user wants to generate videos from a web app, product integration, or SaaS.

## Start with triage

Ask only for missing information that affects the architecture choice:

- Framework or existing app: Next.js App Router, Next.js Pages Router, React Router, Express/server-only, or other.
- Desired output: interactive preview only, downloadable MP4/still image, or both.
- Render location: user's browser, Vercel, AWS Lambda, a Node/Bun server, or Cloudflare.
- Constraints: expected render volume, maximum render duration, existing cloud account, need for progress/cancel endpoints, and tolerance for experimental features.

Then recommend one primary path and name one fallback when useful.

## Templates

Use the templates as implementation references before writing a custom integration:

- Next.js App Router with Tailwind: `packages/template-next-app-tailwind`; docs: https://www.remotion.dev/templates/next
- Next.js App Router without Tailwind: `packages/template-next-app`; docs: https://www.remotion.dev/templates/next-no-tailwind
- Next.js Pages Router: `packages/template-next-pages`; docs: https://www.remotion.dev/templates/next-pages-dir
- Vercel Sandbox rendering: `packages/template-vercel`; docs: https://www.remotion.dev/templates/vercel and https://www.remotion.dev/docs/vercel-sandbox.md
- React Router 7: `packages/template-react-router`; docs: https://www.remotion.dev/templates/react-router
- Express render server: `packages/template-render-server`; use for a standalone API server with render/progress/cancel endpoints. See [ssr.md](ssr.md).

For an existing app, prefer the nearest template as a reference and link https://www.remotion.dev/docs/brownfield-installation.md.

## Rendering choice

Recommend based on the user's deployment and product needs:

- Player only: use [player.md](player.md) when the user wants an interactive preview in React and does not need to create an output file in that flow.
- Web Renderer / client-side rendering: choose when the render should run on the user's device and the user accepts browser/WebCodecs support and experimental limitations. Link https://www.remotion.dev/docs/client-side-rendering.md and https://www.remotion.dev/docs/web-renderer.md.
- Vercel Sandbox: choose when the user already uses Vercel or wants the simplest cloud setup with Vercel Blob. Link https://www.remotion.dev/docs/vercel-sandbox.md and https://www.remotion.dev/docs/vercel.md.
- Lambda via SaaS templates: choose for production SaaS apps that need scalable cloud rendering and can use AWS. The Next.js and React Router templates include Lambda patterns. Link https://www.remotion.dev/docs/lambda.md and guide through https://www.remotion.dev/docs/lambda/setup.md.
- Node/Bun SSR APIs: choose only when the runtime has Node.js or Bun plus enough CPU, memory, disk, and browser dependencies. This works naturally with the Express render server template. See [ssr.md](ssr.md).
- Cloudflare Workers rendering: do not invent an implementation. Link the current tracking issue/reference implementation only: https://github.com/remotion-dev/remotion/issues/7246. If the user means Cloudflare Containers, distinguish that from Workers and link https://www.remotion.dev/docs/cloudflare-containers.md.

Do not recommend Cloud Run for new SaaS work; it is not actively developed. If a user asks about it directly, explain that status and point them to the SSR comparison: https://www.remotion.dev/docs/compare-ssr.md.

## Lambda setup guidance

When recommending Lambda, do not stop at naming it. Guide the user through the setup flow and keep the docs page open as the canonical checklist: https://www.remotion.dev/docs/lambda/setup.md.

Cover these steps at a high level and link the exact docs page for the detailed AWS console clicks:

1. Confirm the user has an AWS account, a target region, and a Remotion project or SaaS template.
2. Install `@remotion/lambda` and keep all `remotion` / `@remotion/*` packages on the same exact version.
3. Create the Lambda role policy, Lambda role, IAM user, user access key, and user policy from the generated Remotion policy commands.
4. Store credentials in `.env` using `REMOTION_AWS_ACCESS_KEY_ID` and `REMOTION_AWS_SECRET_ACCESS_KEY`; never ask the user to paste secrets into chat.
5. Run the Lambda policy validator if the user wants to verify permissions before deploying; use the user's package manager or the command shown in the docs (`npx remotion lambda policies validate`).
6. Deploy the Lambda function. Mention that functions are bound to the Remotion version and must be redeployed after Remotion upgrades.
7. Deploy the Remotion site with a stable site name. Mention that the site must be redeployed after changing the Remotion source.
8. Check Lambda quotas using the user's package manager or the command shown in the docs (`npx remotion lambda quotas`); new AWS accounts may need a concurrency limit increase.
9. Trigger a first render, then wire render and progress endpoints using the chosen SaaS template or Node APIs.

Before production, remind the user to handle rate limiting, authentication, cost controls, output privacy, render cleanup, and progress/error reporting.
