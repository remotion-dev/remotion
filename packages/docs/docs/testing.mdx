---
image: /generated/articles-docs-testing.png
id: testing
title: Testing Remotion components
sidebar_label: Testing
crumb: Tooling
---

Remotion components are regular React component, albeit they need to be wrapped in some extra contexts to render them.

You can approach testing Remotion components the same way as testing regular React components, by using some of these popular libraries:

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Bun + Happy DOM](https://bun.sh/guides/test/happy-dom)
- [Playwright](https://playwright.dev/) for end-to-end tests

## Adding Remotion contexts

To add the contexts that Remotion needs, consider using the [￼`<Thumbnail>`￼](https://www.remotion.dev/docs/player/thumbnail) component to add the necessary React contexts that Remotion needs and to show the component at a specific frame.

Add the [`noSuspense`](/docs/player/thumbnail#nosuspense) prop (available from Remotion v4.0.271) to prevent the component to be wrapped in React `<Suspense>`, which might delay the rendering of the markup.

## Example using Happy DOM and Bun

While not the most sophisticated, this is a very fast and lightweight way to test Remotion components.

```tsx title="src/test/example.test.ts"
import {Thumbnail} from '@remotion/player';
import {expect, test} from 'bun:test';

import {renderToString} from 'react-dom/server';
import {useCurrentFrame} from 'remotion';

const Comp: React.FC<{}> = () => {
  const frame = useCurrentFrame();
  const data = `We are on frame ${frame}`;
  return <div>{data}</div>;
};

test('should work', () => {
  const readStream = renderToString(<Thumbnail component={Comp} compositionHeight={1000} compositionWidth={1000} durationInFrames={1000} fps={30} frameToDisplay={10} noSuspense />);

  expect(readStream).toContain('<div>We are on frame 10</div>');
});
```

```toml title="bunfig.tom"
[test]
preload = "./happydom.ts"
```

```ts title="happydom.ts"
import {GlobalRegistrator} from '@happy-dom/global-registrator';

GlobalRegistrator.register();
```

Run the test using

```sh
bun test src/test/example.test.ts
```
