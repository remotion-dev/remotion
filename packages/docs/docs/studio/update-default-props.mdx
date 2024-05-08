---
image: /generated/articles-docs-studio-update-default-props.png
title: updateDefaultProps()
crumb: "@remotion/studio"
---

# updateDefaultProps()<AvailableFrom v="4.0.154"/>

Updates the default props in the Props Editor (in the right sidebar in the Studio).  
Your component will be re-rendered with the new props.  
The props will **not** be saved to the [Root file](/docs/terminology/root-file) - use [`saveDefaultProps()`](/docs/studio/save-default-props) for that.

## Examples

```tsx twoslash title="Setting {color: 'green'} as the default props"
// @target: esnext
import { updateDefaultProps } from "@remotion/studio";

updateDefaultProps({
  compositionId: "my-composition",
  defaultProps: () => {
    return {
      color: "green",
    };
  },
});
```

You can access the current unsaved default props to only override part of it (reducer-style):

```tsx twoslash title="Accessing the current props"
// @target: esnext
import { saveDefaultProps } from "@remotion/studio";

await saveDefaultProps({
  compositionId: "my-composition",
  defaultProps: ({ unsavedDefaultProps }) => {
    return { ...unsavedDefaultProps, color: "green" };
  },
});
```

If you only want to override on top of the saved changes:

```tsx twoslash title="Accessing the saved props"
// @target: esnext
import { updateDefaultProps } from "@remotion/studio";

updateDefaultProps({
  compositionId: "my-composition",
  defaultProps: ({ savedDefaultProps }) => {
    return {
      ...savedDefaultProps,
      color: "green",
    };
  },
});
```

If you have a Zod schema, you can also access its runtime value:

```tsx twoslash title="Save props from the Props Editor"
// @target: esnext
import { updateDefaultProps } from "@remotion/studio";

updateDefaultProps({
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

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/studio/src/api/update-default-props.ts)
