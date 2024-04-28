---
image: /generated/articles-docs-layout-utils-fill-text-box.png
title: fillTextBox()
crumb: "@remotion/layout-utils"
---

# fillTextBox()<AvailableFrom v="4.0.57"/>

_Part of the [`@remotion/layout-utils`](/docs/layout-utils) package._

Calculate whether the text exceeds the box and wraps within the container. Only works in the browser, not in Node.js or Bun.

## Example

```tsx twoslash
import { fillTextBox } from "@remotion/layout-utils";

const fontFamily = "Arial";
const fontSize = 12;

const box = fillTextBox({ maxLines: 4, maxBoxWidth: 100 });
box.add({ text: "Hello", fontFamily, fontSize }); // {exceedsBox: false, newLine: false}
box.add({ text: "World!", fontFamily, fontSize }); // {exceedsBox: false, newLine: false}
// Doesn't fit on the previous line anymore
box.add({ text: "How", fontFamily, fontSize }); // {exceedsBox: false, newLine: true}
// ...
// Doesn't fix in the box anymore
box.add({ text: "the end", fontFamily, fontSize }); // {exceedsBox: true, newLine: false}
```

## API

The function takes the following options:

### `maxBoxWidth`

_Required_ _number_

The max box width, unit `px`.

### `maxLines`

_Required_ _number_

The max lines of the box.

## Return value

An object with an `add()` method, which can be used to add words to the text box.

### Arguments

#### `text`

_Required_ _string_

Any string.

#### `fontFamily`

_Required_ _string_

Same as CSS style `font-family`.

#### `fontSize`

_Required_ _number_

Same as CSS style `font-size`. Only _numbers_ allowed, unit `px`.

#### `fontWeight`

_string_

Same as CSS style `font-weight`.

#### `fontVariantNumeric`

_string_

Same as CSS style `font-variant-numeric`.

#### `textTransform`<AvailableFrom v="4.0.140"/>

_string_

Same as CSS style `text-transform`.

#### `validateFontIsLoaded?`<AvailableFrom v="4.0.136"/>

_boolean_

If set to `true`, will take a second measurement with the fallback font and if it produces the same measurements, it assumes the fallback font was used and will throw an error.

#### `additionalStyles`<AvailableFrom v="4.0.140"/>

_object, optional_

Additional CSS properties that affect the layout of the text.

### Return value

The add method returns an object with two properties:

- `exceedsBox`:
  _Boolean_, whether adding the word would cause the text to exceed the width of the box.
- `newLine`:
  _Boolean_, whether adding the word would require starting a new line in the text box.

## Important considerations

See [Best practices](/docs/layout-utils/best-practices) to ensure you get correct measurements.

## See also

- [measureText()](/docs/layout-utils/measure-text)
- [`@remotion/layout-utils`](/docs/layout-utils)
