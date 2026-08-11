---
image: /generated/articles-docs-wrong-composition-mount.png
id: wrong-composition-mount
title: Wrongly mounted <Composition>
crumb: "Troubleshooting"
---

## Problem

You are facing the following error:

```
<Composition> mounted inside another composition.
```

or, inside a player:

```
'<Composition> was mounted inside the `component` that was passed to the <Player>.'
```

## Solution

### In the Remotion Studio

The cause for the error is that a [`<Composition>`](/docs/composition) was nested inside the `component` that was passed to another `<Composition>`.

```tsx twoslash title="❌"
import { Composition } from "remotion";
const AnotherComp: React.FC = () => {
  return null;
};

// ---cut---

const MyComp: React.FC = () => {
  return (
    <Composition
      id="another-comp"
      width={1080}
      height={1080}
      durationInFrames={30}
      fps={30}
      component={AnotherComp}
    />
  );
};

const Index: React.FC = () => {
  return (
    <Composition
      id="my-comp"
      width={1080}
      height={1080}
      durationInFrames={30}
      fps={30}
      component={MyComp}
    />
  );
};
```

:::note
There is no reason to nest compositions in Remotion.

- Do you want to include a component in another? Mount it directly instead by writing: `<AnotherComp />`
- Do you want to limit the duration or time-shift another component? Look into [`<Sequence>`](/docs/sequence).

:::

To fix it, you must remove the nested compositions.

### In the Remotion Player

The cause for the error is that in the component you passed in to the `component` prop of Remotion Player, you are returning a `<Composition>`.

```tsx twoslash title="❌"
import { Player } from "@remotion/player";
import { Composition } from "remotion";

const AnotherComp: React.FC = () => {
  return null;
};

// ---cut---

const MyComp: React.FC = () => {
  return (
    <Composition
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1080}
      id="another-component"
      component={AnotherComp}
    />
  );
};

const Index: React.FC = () => {
  return (
    <Player
      durationInFrames={300}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1080}
      component={MyComp}
    />
  );
};
```

:::note
There is no use for compositions in `<Player>`. Only use them during rendering and when using the Remotion Studio.
:::

To fix it, pass the component directly to the player's [`component`](/docs/player/player#component-or-lazycomponent) prop and provide the [`durationInFrames`](/docs/player/player#durationinframes), [`fps`](/docs/player/player#fps), [`compositionHeight`](/docs/player/player#compositionheight) and [`compositionWidth`](/docs/player/player#compositionwidth) props to the player.

```tsx twoslash title="✅"
import { Player } from "@remotion/player";

const AnotherComp: React.FC = () => {
  return null;
};

// ---cut---

const Index: React.FC = () => {
  return (
    <Player
      durationInFrames={300}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1080}
      component={AnotherComp}
    />
  );
};
```

## See also

- [`<Composition>`](/docs/composition)
- [`<Player>`](/docs/player)
