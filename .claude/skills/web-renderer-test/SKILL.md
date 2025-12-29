---
name: web-renderer-test
description: Add a test case to the web renderer
---

The web renderer is in `packages/web-renderer` and the test suite is in `packages/web-renderer/src/test`.

It uses visual snapshot testing using vitest. A test file can for example be executed using:

```
bunx vitest src/test/video.test.tsx
```

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
