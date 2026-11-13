---
name: web-renderer-test
description: Add explicitly requested web renderer tests or update existing ones for implementation changes.
---

Use this skill to update existing web renderer tests when needed for implementation changes. Add new tests only when the user explicitly requests them.

The web renderer is in `packages/web-renderer` and the test suite is in `packages/web-renderer/src/test`.

It uses visual snapshot testing using vitest. A test file can for example be executed using:

```
bunx vitest src/test/video.test.tsx
```

## Keep the suite small

Prefer extending an existing fixture grid or using `testCompositions` from `utils.ts` to put related cases into one snapshot. Use a representative frame and scale instead of multiplying every case across frames, scales, opacity variants, and literal controls.

Use the existing `testImage` snapshot methodology by default. Do not add native screenshot comparisons, warm-up captures, fallback renders, or success-path PNG evidence unless the user specifically requests that methodology. Keep parser and state assertions cheap and retain extra fixtures in Studio for manual investigation.

## Example

Each test is powered by a fixture in `packages/web-renderer/src/test/fixtures`.
A fixture looks like this for example:

```tsx
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'red',
          width: 100,
          height: 100,
          borderRadius: 20,
        }}
      />
    </AbsoluteFill>
  );
};

export const backgroundColor = {
  component: Component,
  id: 'background-color',
  width: 200,
  height: 200,
  fps: 25,
  durationInFrames: 1,
} as const;
```

The corresponding test looks like this:

```tsx
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {backgroundColor} from './fixtures/background-color';
import {testImage} from './utils';

test('should render background-color', async () => {
  const blob = await renderStillOnWeb({
    licenseKey: 'free-license',
    composition: backgroundColor,
    frame: 0,
    inputProps: {},
    imageFormat: 'png',
  });

  await testImage({blob, testId: 'background-color'});
});
```

## Adding a new test

1. Add a new fixture in `packages/web-renderer/src/test/fixtures`.
2. **Important**: Add the fixture to `packages/web-renderer/src/test/Root.tsx` to add a way to preview it.
3. Add a new test in `packages/web-renderer/src/test`.
4. Run `bunx vitest src/test/video.test.tsx` to execute the test.
5. **Important**: Update `packages/docs/docs/client-side-rendering/limitations.mdx` to reflect the newly supported property.
