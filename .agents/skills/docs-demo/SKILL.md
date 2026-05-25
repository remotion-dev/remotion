---
name: docs-demo
description: Add an interactive demo to the Remotion documentation. Use when creating a new <Demo> component for docs pages.
---

# Adding an Interactive Demo to Docs

Interactive demos render a Remotion composition inline in documentation pages using `@remotion/player`. They live in `packages/docs/components/demos/`.

## Steps

1. **Create a component** in `packages/docs/components/demos/` (e.g. `MyDemo.tsx`). It should be a standard React component using Remotion hooks like `useCurrentFrame()` and `useVideoConfig()`.

2. **Register the demo** in `packages/docs/components/demos/types.ts`:
   - Import the component
   - Export a `DemoType` object with these fields:
     - `id`: unique string used in `<Demo type="..." />`
     - `comp`: the React component
     - `compWidth` / `compHeight`: canvas dimensions (e.g. 1280x720)
     - `fps`: frame rate (typically 30)
     - `durationInFrames`: animation length
     - `autoPlay`: whether it plays automatically
     - `options`: array of interactive controls (can be empty `[]`)

3. **Add to the demos array** in `packages/docs/components/demos/index.tsx`:
   - Import the demo constant from `./types`
   - Add it to the `demos` array

4. **Use in MDX** with `<Demo type="your-id" />`

## Options

Options add interactive controls below the player. Each option needs `name` and `optional` (`'no'`, `'default-enabled'`, or `'default-disabled'`).

Supported types:

- `type: 'numeric'` — slider with `min`, `max`, `step`, `default`
- `type: 'boolean'` — checkbox with `default`
- `type: 'enum'` — dropdown with `values` array and `default`
- `type: 'string'` — text input with `default`

Option values are passed to the component as `inputProps`. Access them as regular React props.

## Example registration

```ts
export const myDemo: DemoType = {
  comp: MyDemoComp,
  compHeight: 720,
  compWidth: 1280,
  durationInFrames: 150,
  fps: 30,
  id: 'my-demo',
  autoPlay: true,
  options: [],
};
```
