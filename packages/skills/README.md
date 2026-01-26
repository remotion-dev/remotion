<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

# Remotion Skills

[Agent Skills](https://agentskills.io) for [Remotion](https://remotion.dev) - create videos programmatically using React.

These skills give AI coding agents domain-specific knowledge for building Remotion projects:

- **Animations** - Frame-based animations with `useCurrentFrame()` and interpolation
- **Compositions** - Defining videos, stills, folders, and dynamic metadata
- **Audio & Video** - Embedding, trimming, volume control, speed, looping
- **Captions** - Transcription, SRT import, TikTok-style display
- **3D Content** - Three.js and React Three Fiber integration
- **Charts** - Animated data visualizations
- **Text** - Typography, fonts, measuring, and text animations
- **Transitions** - Scene transition patterns
- **And more** - GIFs, Lottie, maps, Tailwind, parameters...

See [skills/remotion/SKILL.md](skills/remotion/SKILL.md) for the full list of topics.

## Installation

Install using [add-skill](https://github.com/vercel-labs/add-skill):

```bash
npx add-skill remotion-dev/skills
```

## What are Agent Skills?

Agent Skills are an [open standard](https://agentskills.io) for giving AI coding agents specialized capabilities. They provide procedural knowledge that agents can load on demand to perform tasks more accurately.

## Contributing

Pull requests should be submitted to the [remotion-dev/remotion](https://github.com/remotion-dev/remotion) monorepo under `packages/skills/`, not to the [remotion-dev/skills](https://github.com/remotion-dev/skills) mirror repository.

## Documentation

Remotion Documentation: [**remotion.dev/docs**](https://www.remotion.dev/docs)  
API Reference: [**remotion.dev/api**](https://www.remotion.dev/api)
