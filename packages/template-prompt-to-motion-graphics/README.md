# Remotion Prompt to Motion Graphics

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

AI-powered motion graphics generator that transforms natural language prompts into Remotion code.

## Architecture

```
User Prompt → Validation → Skill Detection → Code Generation → Sanitization → Live Preview
```

## How It Works

### 1. Validation

Before expensive model calls, a lightweight classifier determines if the prompt describes valid motion graphics content.

**Accepted**: animated text, data visualizations, UI animations, social media content, abstract motion graphics

**Rejected**: questions, conversational requests, non-visual tasks

### 2. Skill Detection

The system analyzes the prompt to identify which **skills** are relevant. Skills are modular knowledge units that provide domain-specific guidance to the code generation model.

There are two types of skills:

- **Guidance Skills** - Pattern libraries with best practices for specific domains (charts, typography, transitions, etc.)
- **Example Skills** - Complete working code references that demonstrate specific animation patterns

This approach keeps the base prompt lightweight while dynamically injecting only the relevant expertise for each request.

### 3. Code Generation

Uses a one-shot prompt with the base Remotion knowledge plus any detected skills. The generated code follows these principles:

- **Constants-first design** - All text, colors, and timing values are declared as editable constants at the top
- **Aesthetic defaults** - Guidance on visual polish, spacing, and animation feel
- **Crossfade patterns** - Smooth state transitions without layout jumps
- **Spring physics** - Natural, organic motion using Remotion's spring() function

### 4. Sanitization & Compilation

The response is cleaned (removing markdown wrappers and trailing commentary), then compiled in-browser using Babel. The compiled component renders directly in the Remotion Preview with all necessary APIs injected.

## Skills System

Skills enable contextual expertise without bloating every prompt. Located in `src/skills/`:

### Guidance Skills

| Skill              | Purpose                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| **charts**         | Data visualization patterns - bar charts, pie charts, axis labels, staggered animations |
| **typography**     | Kinetic text - typewriter effects, word carousels, text highlights                      |
| **messaging**      | Chat UI - bubble layouts, WhatsApp/iMessage styling, staggered entrances                |
| **transitions**    | Scene changes - TransitionSeries, fade/slide/wipe effects                               |
| **sequencing**     | Timing control - Sequence, Series, staggered delays                                     |
| **spring-physics** | Organic motion - spring configs, bounce effects, chained animations                     |
| **social-media**   | Platform-specific formats - aspect ratios, safe zones                                   |
| **3d**             | Three.js integration - 3D scenes, camera setup                                          |

### Example Skills (Code Snippets)

Example skills provide complete working references (histogram, chat messages, typewriter effects, etc.) that demonstrate these patterns in action. We think of them like implementation archetypes that can be used and adjusted for the user prompt.

## Usage Tips

**Prompting best practices:**

- Be specific about colors, timing, and layout ("green sent bubbles on the right, gray received on the left")
- Include data directly in the prompt for charts and visualizations
- Describe the animation feel you want ("bouncy spring entrance", "smooth fade", "staggered timing")

**Images:**

- Direct image uploads are not supported
- Reference images via URL - the generated code will use Remotion's `<Img>` component
- Example: _"Create a DVD screensaver animation of this image https://example.com/logo.png"_

**What works well:**

- Kinetic typography and text animations
- Data visualizations with animated entrances
- Chat/messaging UI mockups
- Social media content (Stories, Reels, TikTok)
- Logo animations and brand intros
- Abstract motion graphics

## Commands

**Install Dependencies**

```console
npm install
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
