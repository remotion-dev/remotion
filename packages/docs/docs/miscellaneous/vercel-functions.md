---
sidebar_label: Vercel Functions
title: Can I render videos using Vercel Serverless functions?
crumb: "FAQ"
---

It is currently not possible to render videos or stills on Vercel Serverless functions due to the 50MB maximum function size. Since Chromium is a dependency of Remotion, it alone almost entirely fills the quota available.

However, you can trigger a Remotion Lambda render through a Vercel Serverless function – our preferred choice for building applications. See our [Next template](https://github.com/remotion-dev/template-next) or [GitHub Unwrapped project](https://github.com/remotion-dev/github-unwrapped-2022) for an example of how to do so.
