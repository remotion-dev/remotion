<p align="center">
  <a href="https://github.com/JonnyBurger/remotion-logo">
    <img src="https://github.com/JonnyBurger/remotion-logo/raw/main/withtitle/element-0.png">
  </a>
</p>

Remotion is a suite of libraries building a fundament for **creating videos programmatically using React.**

## Why create videos in React?

- **Leverage web technologies**: Use all of CSS, Canvas, SVG, WebGL, etc.
- **Leverage programming**: Use variables, functions, APIs, math and algorithms to create new effects
- **Leverage React**: Reusable components, Powerful composition, Fast Refresh, Package ecosystem

## Run the examples

- Need ffmpeg in your PATH

Install the repo:

```
npm i && npx lerna bootstrap
```

Run an example, for example `ReactSvg`:

```
cd packages/cli
npx ts-node --files src/preview.ts ../example/src/ReactSvg/index.tsx
```

Render a video:

```
cd packages/cli
npx ts-node --files src/index.ts ../example/src/ReactSvg/index.tsx
```
