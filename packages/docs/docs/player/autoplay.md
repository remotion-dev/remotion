---
id: autoplay
sidebar_label: "Autoplay"
title: "Combatting autoplay issues"
slug: /player/autoplay
---

Browsers place restrictions on websites that play audio without user interaction. Read on how to properly use the Remotion Player so you don't run into a browser policy.

## Trigger the play from a user event

Don't autoplay audio on site load, or else browsers will block the audio. Instead, display a play button or use the [`controls`](/docs/player/api#controls) prop.

## Pass the event to the `play()` or `toggle()` method

The play must be initialized from a user gesture, for example a mouse click. You should get a Javascript event like a `MouseEvent` from it. Pass this event to the `play()` or `toggle()` function so audio may play automatically.

```tsx twoslash
// @allowUmdGlobalAccess
// @filename: ./remotion/MyComp.tsx
export const MyComp = () => <></>;

// @filename: index.tsx
// ---cut---
import { useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";

export const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  return (
    <div>
      {/* Player implementation */}
      <button
        onClick={(e) => {
          const { current } = ref;
          current?.toggle(e);
        }}
      >
        Play
      </button>
    </div>
  );
};
```

## Use the `numberOfSharedAudioTags` property

If your audio does not enter the video immediately (say the few seconds of the video are silent, but then the audio fades in), it technically doesn't start based on an user integration. To combat this issue, you can use the [`numberOfSharedAudioTags`](/docs/player/api#numberofsharedaudiotags) property. This will play some silent audio on the first play with user interaction, and then reuse that tag to play your deferred audio playback.

You can have as many silent audio tags as you want. Set `numberOfSharedAudioTags={2}` to prepare two shared audio tags. Be mindful: If you set this props and you render more [`<Audio/>`](/docs/audio) than there are shared audio tags, an exception will be thrown.

:::warning
Due to a bug on our side, this prop does not work well [before Remotion v3.1.5](https://github.com/remotion-dev/remotion/issues/723). Upgrade to receive the bugfix.
:::
