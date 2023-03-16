---
image: /generated/articles-docs-compare-motion-canvas.png
title: How does Remotion compare to Motion Canvas?
crumb: "FAQ"
sidebar_label: Difference to Motion Canvas
---

Obviously we are biased, but here are a few differences between Remotion and [Motion Canvas](https://motioncanvas.io/) to help you decide:

## Declarative vs. Imperative API:

Remotion uses React, a declarative library for expressing UI.  
Motion Canvas uses a generator-based procedural API.

Learn about the difference between imperative and declarative programming: [YouTube](https://www.youtube.com/watch?v=E7Fbf7R3x6I)

## Web vs. Canvas:

Remotion uses a whole DOM tree for the video, while Motion Canvas uses a single `<canvas>` element.

Remotion may render more types of content, but needs a headless browser to create a video.  
Motion Canvas can only render canvas-based content, but may do so in the browser.

## Broad vs. specialized:

Remotion tries to make as few assumptions over the content of the video as possible and supports a wide variety of use-cases.  
Motion Canvas is designed for informative vector animations and ships built-in APIs to optimize for this use case.

## Special qualities of each library:

Each library has unique features that you might find useful:

- **Remotion** has APIs for server-side rendering and functionalities for making apps that create programmatic video, as well as plugins for Three.JS, GIFs, Lottie and more.
- **Motion Canvas** has time events and properties which allow you to parametrize the video and sync audio through the UI, as well as built-in components for LaTeX and code block animations.

## Commercial vs. Open Source

Remotion is source-available software that requires a license for use in companies, while Motion Canvas is truly open source software.

While Remotion costs money for use in a company, we are able to reinvest this money into further improving Remotion.

## Which one should I choose?

It depends on the type of content that you would like to create. Consider if one of the features and design choices is valuable to you.
