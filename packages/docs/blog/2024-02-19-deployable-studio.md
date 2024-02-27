---
slug: deployable-studio
title: You can now deploy the Remotion Studio
author: Jonny Burger
author_title: Chief Hacker @ Remotion
author_url: https://github.com/JonnyBurger
author_image_url: https://avatars2.githubusercontent.com/u/1629785?s=460&u=12eb94da6070d00fc924761ce06e3a428d01b7e9&v=4
image: /img/deploy-studio.png
---

We now make it possible to export the Remotion Studio as a static website and deploy it to any hosting provider.

You can share the resulting URLs with your team, clients or friends. They can preview the video, and change the parameters to customize the video.

You can also pass the URL to any Remotion rendering API, such as [`npx remotion render`](/docs/cli/render) and [`renderMedia()`](/docs/renderer/render-media), without having to clone the code.

<p align="center">
  <img src="/img/deployed-studio.png"/>
  <p align="center" style={{fontSize: '0.8em'}}><a href="https://watercolor-map.vercel.app"><em>watercolor-map.vercel.app</em></a> <a href="https://www.remotion.pro/watercolor-map">(Template)</a></p>
</p>

## Deploy as a static website

Use [`npx remotion bundle`](/docs/cli/bundle) to export the Remotion Studio as a static website. Enter this build command on Vercel, Netlify or another provider to continuously deploy the Studio.

<p align="center">
  <img src="/img/deploy-logs.png" />
  <p align="center" style={{fontSize: '0.8em', marginTop: -30}}>Deploy a template to Vercel in 15 seconds</p>
</p>

## Render from a URL

You may use the URL to render:

```bash
npx remotion render https://watercolor-map.vercel.app
```

You can use [`--props`](/docs/cli/render#--props) to parameterize the video.

All render APIs support this: [`renderMedia()`](/docs/renderer/render-media), [`renderStill()`](/docs/renderer/render-still), [`getCompositions()`](/docs/renderer/get-compositions), [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), [`renderFrames()`](/docs/renderer/render-frames), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda), [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda), [`renderMediaOnCloudRun()`](/docs/cloudrun/rendermediaoncloudrun), [`renderStillOnCloudRun()`](/docs/cloudrun/renderstilloncloudrun), [`npx remotion render`](/docs/cli/render), [`npx remotion still`](/docs/cli/still), [`npx remotion compositions`](/docs/cli/compositions), [`npx remotion lambda render`](/docs/lambda/cli/render), [`npx remotion lambda still`](/docs/lambda/cli/still), [`npx remotion lambda compositions`](/docs/lambda/cli/compositions), [`npx remotion cloudrun render`](/docs/cloudrun/cli/render) and [`npx remotion cloudrun still`](/docs/cloudrun/cli/still).

## Explore code visually

Sequences are mapped back to the original source code. Click on them in the deployed Studio to jump to the source code on GitHub.com!

<p align="center">
  <img src="/img/click-stack.png" />
  <p align="center" style={{fontSize: '0.8em', marginTop: -30}}><a href="https://watercolor-map.vercel.app"><em>watercolor-map.vercel.app</em></a> <a href="https://www.remotion.pro/watercolor-map">(Template)</a></p>
</p>

## All our templates

Our templates and examples are deployed as a Studio:

- Watercolor Map ([Source code](https://github.com/remotion-dev/watercolor-map), [Preview](https://watercolor-map.vercel.app/))
- Hello World (TypeScript) ([Source code](https://github.com/remotion-dev/template-helloworld), [Preview](https://remotion-helloworld.vercel.app/))
- React Three Fiber ([Source code](https://github.com/remotion-dev/template-three), [Preview](https://template-three-remotion.vercel.app/))
- Stills ([Source code](https://github.com/remotion-dev/template-still), [Preview](https://template-still.vercel.app/))
- Watercolor Map ([Source code](https://github.com/remotion-dev/watercolor-map), [Preview](https://watercolor-map-remotion.vercel.app/))

## Deploy the Studio to a server

You may also deploy the Remotion Studio as a long-running server, for example on Fly.io or Render.com.  
The advantage is that the Render Button stays active, meaning you can render and download videos!

[Read here how to deploy the Remotion Studio to a server](/docs/studio/deploy-server).
