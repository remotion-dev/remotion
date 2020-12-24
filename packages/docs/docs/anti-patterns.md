---
id: anti-patterns
title: Anti-patterns
---

## Following traditional React performance patterns

From classical React apps, we learned how to optimize an app to reduce rerenders
and optimize commits to the DOM. For example:

- Not using inline styles
- Wrapping expensive computation in useMemo
- Other performance hacks such as PureComponent.

In Remotion, components **will** rerender many times per second anyway, and those performance optimizations will not affect the final .mp4 file you get. Think about whether traditional React wisdom applies in Remotion before you spend time optimizing.
