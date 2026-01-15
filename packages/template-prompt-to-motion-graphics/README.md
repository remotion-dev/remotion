# Remotion Prompt to Motion Graphics

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

AI-powered motion graphics - creating Remotion code from a natural language prompt.

## Process Overview

```
User Prompt → Validation → Code Generation → Sanitization → Compilation → Remotion Preview
```

### Overview - How It Works

1. **Validation** (`/api/generate`) - Classifies if the prompt is valid motion graphics content before calling the expensive generation model

2. **Code Generation** - Uses OpenAI with a detailed system prompt containing animation patterns and examples. Code is streamed via Server-Sent Events for real-time feedback

3. **Sanitization** (`sanitize-response.ts`) - Extracts clean component code from AI output using brace-counting to handle trailing commentary

4. **Compilation** (`compiler.ts`) - Transpiles the code string in the browser to an executable React component using Babel, then renders in the standard Remotion Preview

### Validation

Before calling the expensive code generation model, we run a cheap validation step using `generateObject()` to classify whether a prompt is valid motion graphics content. This returns a simple boolean.

**Valid prompts** include requests for:

- Animated text, titles, kinetic typography
- Data visualizations (charts, graphs, progress bars)
- UI animations, logo animations, brand intros
- Social media content, explainer animations
- Abstract motion graphics, animated illustrations

**Invalid prompts** are filtered out:

- Questions ("What is 2+2?", "How do I...")
- Text content requests (conversational, tell me a joke, ...)
- Non-visual tasks (calculations, translations)

On validation failure, the user gets a helpful error message before any expensive API calls are made.

### Code Generation

The current prompting approach is a simple one-shot prompt without LLM loops or example lookups. GPT 5.2 Low reasoning seems to be a good middle ground between generation speed and output quality.

Contents of the system prompt

- **Constants-first**: All text, colors, and timing as editable constants. This helps user to easily change the variables in the editor
- General **aesthetic guidance** on motion graphic for better output
- **Crossfade layers**: Smooth state transitions without layout jumps
- **Reserved names**: Warns against shadowing `spring`, `interpolate`, hooks
- **Output Examples** to give the LLM an understanding of what we are expecting

### Sanitization

The AI response may contain markdown wrappers (```tsx blocks) or trailing commentary after the code. The sanitization step:

- Strips markdown code block wrappers
- Uses brace-counting to extract only the component code, cutting off any explanatory text the model adds after the closing brace
- Validates that the output contains valid JSX using regex checks

### Compilation

For a good end to end user experience, it is a priority to directly show a preview of the generated remotion code in the same app.

- Extracts the component body from the ES6 module format - we get rid of the imports and just extract the component itself `export const MyAnimation = () => { ... };`
- Transpiles JSX/TypeScript to JavaScript using Babel (in-browser)
- Creates a `Function` constructor with all Remotion APIs injected, we did a pre-selection of common available APIs that can be used for the animations(`useCurrentFrame`, `spring`, `interpolate`, `Sequence`, `AbsoluteFill`, etc.)
- Also injects shape libraries (`@remotion/shapes`), Lottie support, and Three.js for 3D
- The compiled component is then rendered in the standard Remotion Preview

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
