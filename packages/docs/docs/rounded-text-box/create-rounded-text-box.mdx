---
image: /generated/articles-docs-rounded-text-box-create-rounded-text-box.png
title: 'createRoundedTextBox()'
crumb: '@remotion/rounded-text-box'
---

_Part of the [`@remotion/rounded-text-box`](/docs/rounded-text-box) package._

Creates a SVG path for rendering a text box with rounded corners, as pioneered by TikTok and Instagram.

<Demo type="rounded-text-box" />

The above example combines [`fitTextOnNLines()`](/docs/layout-utils/fit-text-on-n-lines) and [`measureText()`](/docs/layout-utils/measure-text) to get the text measurements, and then creates a rounded text box.  
[View the source code here.](https://github.com/remotion-dev/remotion/blob/main/packages/docs/components/demos/RoundedTextBox.tsx)

## Usage Example

```tsx twoslash title="Simple usage example"
import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import {createRoundedTextBox} from '@remotion/rounded-text-box';

const maxLines = 3;
const fontFamily = 'Figtree';
const fontWeight = '700';
const horizontalPadding = 20;
const borderRadius = 20;
const fontSize = 36;
const lineHeight = 1.5;
const textAlign = 'center';

const lines = ['Hello World', 'This is a test', 'This is another test'];

const textMeasurements = lines.map((t) =>
  measureText({
    text: t,
    fontFamily,
    fontSize,
    additionalStyles: {
      lineHeight,
    },
    fontVariantNumeric: 'normal',
    fontWeight,
    letterSpacing: 'normal',
    textTransform: 'none',
    validateFontIsLoaded: true,
  }),
);

const {d, boundingBox} = createRoundedTextBox({
  textMeasurements,
  textAlign,
  horizontalPadding,
  borderRadius,
});

const markup = (
  <div
    style={{
      width: boundingBox.width,
      height: boundingBox.height,
    }}
  >
    <svg
      viewBox={boundingBox.viewBox}
      style={{
        position: 'absolute',
        width: boundingBox.width,
        height: boundingBox.height,
        overflow: 'visible',
      }}
    >
      <path fill="white" d={d} />
    </svg>
    <div style={{position: 'relative'}}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize,
            fontWeight,
            fontFamily,
            lineHeight,
            textAlign,
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
            color: 'black',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  </div>
);
```

## API

_object_ <TsType type="CreateRoundedTextBoxProps" source="@remotion/rounded-text-box" />

Accepts an object with the following properties:

### `textMeasurements`

_array_ <TsType type="Dimensions[]" source="@remotion/layout-utils" />

An array of text measurements, each containing the `width` and `height` of a line of text.  
Should be obtained using the [`measureText()`](/docs/layout-utils/measure-text) function.

### `textAlign`

_string_ <TsType type="TextAlign" source="@remotion/rounded-text-box" />

The alignment of the text.  
Can be `'left'`, `'center'`, or `'right'`.

### `horizontalPadding`

_number_

The horizontal padding of the text box.

### `borderRadius`

_number_

The border radius of the text box.

## Return value

_object_ <TsType type="CreateRoundedTextBoxResult" source="@remotion/rounded-text-box" />

An object containing the following properties:

### `d`

_string_

The SVG path.

### `boundingBox`

_object_ <TsType type="BoundingBox" source="@remotion/paths" />

The bounding box of the text box. See [`getBoundingBox()`](/docs/paths/get-bounding-box) for the shape.

### `instructions`

_array_ <TsType type="ReducedInstruction[]" source="@remotion/paths" />

The SVG path instructions as an array, for use with the [`@remotion/paths`](/docs/paths) package.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/rounded-text-box/src/create-rounded-text-box.ts)
- [`@remotion/rounded-text-box`](/docs/rounded-text-box)
- [`@remotion/paths`](/docs/paths)
- [`fitTextOnNLines()`](/docs/layout-utils/fit-text-on-n-lines)
- [`measureText()`](/docs/layout-utils/measure-text)
- [`getBoundingBox()`](/docs/paths/get-bounding-box)
