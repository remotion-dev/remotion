---
image: /generated/articles-docs-google-fonts-load-font-from-info.png
title: loadFontFromInfo()
crumb: '@remotion/google-fonts'
---

# loadFontFromInfo()<AvailableFrom v="4.0.279"/>

Loads a Google Font based on some metadata that was obtained using [`getInfo()`](/docs/google-fonts/get-info).

[`getInfo()`](/docs/google-fonts/get-info) returns just a pure JSON object, so the metadata of a font may be loaded from a server, which can avoid having a heavy client-side bundle.

```tsx twoslash title="On the server"
import {getInfo} from '@remotion/google-fonts/InterTight';

// Return `info` to the client using an endpoint
const info = getInfo();
```

```tsx twoslash title="On the client"
import {getInfo} from '@remotion/google-fonts/InterTight';
import {loadFontFromInfo} from '@remotion/google-fonts/from-info';

const loadInfoFromServer = () => {
  return Promise.resolve(getInfo());
};

// ---cut---
const info = await loadInfoFromServer();

const {fontFamily, waitUntilDone} = loadFontFromInfo(info, 'italic');

console.log(fontFamily);
waitUntilDone();
```

## API

The API is the same as [`loadFont()`](/docs/google-fonts/load-font), except that another argument needs to be passed in first position, that being font metadata loaded using [`getInfo()`](/docs/google-fonts/get-info).

```tsx twoslash title="MyComp.tsx"
import {getInfo} from '@remotion/google-fonts/InterTight';
import {loadFontFromInfo} from '@remotion/google-fonts/from-info';

const {waitUntilDone} = loadFontFromInfo(getInfo(), 'normal', {
  weights: ['400'],
  subsets: ['latin'],
});
```

Unlike [`loadFont()`](/docs/google-fonts/load-font), there is no autocomplete

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/google-fonts/src/from-info.ts)
- [`loadFont()`](/docs/google-fonts/load-font)
- [`getInfo()`](/docs/google-fonts/get-info)
- [Building a Font Picker](/docs/font-picker)
