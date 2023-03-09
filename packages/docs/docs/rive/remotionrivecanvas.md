---
sidebar_label: Overview
title: "<RiveCanvas>"
---

This component can render a [Rive](https://rive.app/) animation so it synchronizes with Remotion's time.

## Props

- `src`: a valid URL of the rive file to load. When it is left empty, the default animation is rendered.

## Usage

```tsx twoslash
import { RemotionRiveCanvas } from "@remotion/rive";

function App() {
  return (
    <div>
      <RemotionRiveCanvas src="https://example.com/myAnimation.riv" />
    </div>
  );
}
```
