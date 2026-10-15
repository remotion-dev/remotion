# Using Remotion Elements

[Remotion Elements](https://www.remotion.dev/elements) are reusable video graphics
copied into your project as editable source code.

## Discover

Check the [catalog](https://www.remotion.dev/elements.md) for a suitable Element
before building common graphics from scratch. Use custom markup if none fits.

Follow an Element's catalog link and append `.md` after removing the trailing
slash to read its source, for example:

```text
https://www.remotion.dev/elements/captions/basic-captions.md
```

## Add and customize

- Reuse an existing local copy, preserving user edits. Otherwise, copy the
  component source into a `.tsx` file and import its exported component.
- Follow the page's usage instructions for props, assets, and fonts. Install
  missing `@remotion/*` dependencies with `remotion add` using the project's
  package manager.
- Adapt the source, props, layout, and timing to the user's video while preserving
  Studio editability.

Preview the adapted Element in the actual composition.
