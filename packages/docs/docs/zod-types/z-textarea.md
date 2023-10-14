---
image: /generated/articles-docs-zod-types-z-textarea.png
title: zTextarea()
---

Using `zTextarea()`, you can specify in your [schema](/docs/schemas) a string must be a textarea in order to have
several lines.

In the Remotion Studio, a textarea will be displayed allowing to change the value to have several lines or long text.

:::tip
When using `zTextarea()`, the value will be a string, even if the user enters several lines. To display the value in a
component without losing the line breaks, you can use the `white-space: pre-line` CSS property on the element
displaying the value.
:::

## See also

- [Defining a schema for your props](/docs/schemas)
