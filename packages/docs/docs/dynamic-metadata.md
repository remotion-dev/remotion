---
id: dynamic-metadata
title: Dynamic duration, FPS & dimensions
---

_Available since v2.0._

Using [Input props](parametrized-rendering) you can customize the content of your videos while rendering. But what about if you want to change the duration, frame rate or the dimensions of your video based on input props or asynchronous operations?

## Change metadata based on input props

Use the `getInputProps()` method to retrieve the props that you have passed as an input.
For example if you have passed `--props='{"hello": "world"}'` as a command line flag, you can read the value in your Remotion project like this:

```tsx
const {hello} = getInputProps()
console.log(hello) // "world"
```
