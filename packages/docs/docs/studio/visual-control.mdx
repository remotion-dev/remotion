---
image: /generated/articles-docs-studio-visual-control.png
title: visualControl()
crumb: '@remotion/studio'
---

# visualControl()<AvailableFrom v="4.0.292" />

:::warning
**Preview feature:** A few issues are known, and filed under this [issue](https://github.com/remotion-dev/remotion/issues/5210).
:::

Creates a control in the right sidebar of the [Remotion Studio](/docs/studio) that allows you to change a value.

Useful for if you have a hardcoded constant that you want to quickly find the optimal value for.

## Example

Consider you have a value `rotation` that you want to find the optimal value for:

```tsx twoslash title="A simple composition"
import {useVideoConfig} from 'remotion';

const MyComp: React.FC = () => {
  const rotation = 180;

  return <div style={{rotate: `${rotation}deg`}}>Hello</div>;
};
```

Instead of changing the value of `rotation` in the code, you can create a control in the right sidebar of the [Remotion Studio](/docs/studio) that allows you to change the value:

```tsx twoslash title="Creating a visual control with the name 'rotation'"
import {visualControl} from '@remotion/studio';

const MyComp: React.FC = () => {
  const rotation = visualControl('rotation', 180);

  return <div style={{rotate: `${rotation}deg`}}>Hello</div>;
};
```

Now, in the right sidebar of the [Remotion Studio](/docs/studio), you will see a control with the name `rotation` and a slider to change the value.

<img style={{width: '400px'}} src="/img/visual-control.png" />

Now you can change the value as you please, until you have found the optimal value.

Once you are happy with the value, you can save it back to the code by clicking the save button in the right sidebar.

## Defining a schema

Only primitive values (`string` and `number`) automatically infer the type of the control.

If you want to define a more complex schema, you can do so by passing a Zod schema as the third argument.

```tsx twoslash title="Editing an object"
import {visualControl} from '@remotion/studio';

// ---cut---
import {z} from 'zod';

const data = visualControl(
  'my-data',
  {
    rotation: 180,
    text: 'Hello',
  },
  z.object({
    rotation: z.number(),
    text: z.string(),
  }),
);
```

See: [Visual Editing](/docs/visual-editing)

```tsx twoslash title="Editing a color"
import {visualControl} from '@remotion/studio';
import {zColor} from '@remotion/zod-types';

const color = visualControl('my-color', '#fff', zColor());
```

See: [`zColor()`](/docs/zod-types/z-color)

```tsx twoslash title="Editing a matrix"
import {visualControl} from '@remotion/studio';
import {zMatrix} from '@remotion/zod-types';

const matrix = visualControl('my-matrix', [1, 2, 3, 4], zMatrix());
```

See: [`zMatrix()`](/docs/zod-types/z-matrix)

## When to use

- If you want to create configuration options, use the [Props Editor](/docs/visual-editing).
- If you want to quickly find the optimal value for a hardcoded constant, use `visualControl()`.

## Important to know

<Step>1</Step> The saving feature works only if the first argument of the `visualControl()` function is static, because static analysis is performed on the source file. The following will not work:

```tsx twoslash title="❌ This is not possible"
import {visualControl} from '@remotion/studio';

// ---cut---

// ❌ Not possible to use string interpolation
const name = 'my-data';
const data = visualControl(`rotation-${name}`, 180);

// ❌ Not possible to use a variable
const idOutside = 'rotation-my-data';
const dataOutside = visualControl(idOutside, 180);
```

<Step>2</Step> At the moment, unsaved values are not applied when rendering the video, even if the preview shows them. Save the values before rendering.

<Step>3</Step> Controls may not be automatically remove themselves when you remove them from your code.{' '}

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/studio/src/api/visual-control.ts)
