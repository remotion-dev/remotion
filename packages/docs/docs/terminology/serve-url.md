---
image: /generated/articles-docs-terminology-serve-url.png
title: Serve URL
crumb: "Terminology"
---

A Serve URL is a URL under which [a Remotion Bundle](/docs/terminology/bundle) is hosted.  
When rendering your video, Remotion will open a headless browser and visit that URL in order to make screenshots of it.

The most common use case for a Serve URL is when rendering a video on Lambda, you need to deploy your [bundle](/docs/terminology/bundle) to Amazon S3, which will [make it a Serve URL](/docs/lambda/cli/sites#create).

If you have a Serve URL, you can also render a video locally by passing a serve URL instead of an [entry point](/docs/terminology/entry-point).

A serve URL doesn't have to be on S3, it can be on any provider that supports static deployments (e.g. Netlify, Vercel or GitHub pages) or even be a URL that runs on localhost.
