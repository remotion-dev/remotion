---
image: /generated/articles-docs-studio-save-default-props.png
title: saveDefaultProps()
crumb: "@remotion/studio"
---

# saveDefaultProps()<AvailableFrom v="4.0.147"/>

Saves the [`defaultProps`](/docs/composition) for a [composition](/docs/terminology/composition) back to the [root file](/docs/terminology/root-file).  
If you just want to update the default props in the Props Editor (right sidebar in the Studio) without saving them to the root file, use [`updateDefaultProps()`](/docs/studio/update-default-props).

## Examples

```tsx twoslash title="Saving {color: 'green'} to Root.tsx"
// @target: esnext
import { saveDefaultProps } from "@remotion/studio";

await saveDefaultProps({
  compositionId: "my-composition",
  defaultProps: () => {
    return {
      color: "green",
    };
  },
});
```

You can access the saved default props to only override part of it (reducer-style):

```tsx twoslash title="Accessing the saved default props"
// @target: esnext
import { saveDefaultProps } from "@remotion/studio";

await saveDefaultProps({
  compositionId: "my-composition",
  defaultProps: ({ savedDefaultProps }) => {
    return {
      ...savedDefaultProps,
      color: "green",
    };
  },
});
```

If you modified props in the Props Editor (right sidebar in the Studio), you can also access the unsaved props from there, and for example save them:

```tsx twoslash title="Save props from the Props Editor"
// @target: esnext
import { saveDefaultProps } from "@remotion/studio";

await saveDefaultProps({
  compositionId: "my-composition",
  defaultProps: ({ unsavedDefaultProps }) => {
    return unsavedDefaultProps;
  },
});
```

If you have a Zod schema, you can also access its runtime value:

```tsx twoslash title="Save props from the Props Editor"
// @target: esnext
import { saveDefaultProps } from "@remotion/studio";

await saveDefaultProps({
  compositionId: "my-composition",
  defaultProps: ({ schema, unsavedDefaultProps }) => {
    // Do something with the Zod schema

    return {
      ...unsavedDefaultProps,
      color: "red",
    };
  },
});
```

## Requirements

In order to use this function:

<Step>1</Step> You need to be inside the Remotion Studio.
<br />
<Step>2</Step> The Studio must be running (no static deployment)
<br />
<Step>3</Step> <code>zod</code> needs to be installed.
<br />
<br />

Otherwise, the function will throw.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/studio/src/api/save-default-props.ts)
