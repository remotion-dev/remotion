---
displayed_sidebar: rulesSidebar
---

:::danger Deprecated

The old `ban-types` rule encompassed multiple areas of functionality, and so has been split into several rules.

**[`no-restricted-types`](./no-restricted-types.mdx)** is the new rule for banning a configurable list of type names.
It has no options enabled by default and is akin to rules like [`no-restricted-globals`](https://eslint.org/docs/latest/rules/no-restricted-globals), [`no-restricted-properties`](https://eslint.org/docs/latest/rules/no-restricted-properties), and [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax).

The default options from `ban-types` are now covered by:

- **[`no-empty-object-type`](./no-empty-object-type.mdx)**: banning the built-in `{}` type in confusing locations
- **[`no-unsafe-function-type`](./no-unsafe-function-type.mdx)**: banning the built-in `Function`
- **[`no-wrapper-object-types`](./no-wrapper-object-types.mdx)**: banning `Object` and built-in class wrappers such as `Number`

`ban-types` itself is removed in typescript-eslint v8.
See [Announcing typescript-eslint v8 Beta](/blog/announcing-typescript-eslint-v8-beta) for more details.
:::

<!-- This doc file has been left on purpose because `ban-types` is a well-known
rule. This exists to help direct people to the replacement rules.

Note that there is no actual way to get to this page in the normal navigation,
so end-users will only be able to get to this page from the search bar. -->
