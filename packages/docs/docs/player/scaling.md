---
image: /generated/articles-docs-player-scaling.png
id: scaling
title: "Scaling"
crumb: "@remotion/player"
---

The following algorithm is used for calculating the size of the Player:

<Step>1</Step> By default, the Player is as big as the composition height, defined by the <code>compositionHeight</code> and <code>compositionWidth</code> props. <br/>
<Step>2</Step> If <code>height</code> and <code>width</code> is defined using the <code>style</code> property, the player will assume the dimensions you have passed. <br/>
<Step>3</Step> If a <code>height</code> is passed using the <code>style</code> property, the player will assume that height, and calculate the width based on the aspect ratio of the video. <br/>
<Step>4</Step> If <code>width</code> is passed using the <code>style</code> property, the player will assume that width and calculate the height based on the aspect ration of the video. <br/><br/>

:::note
Before v3.3.43, if case <InlineStep>3</InlineStep> or <InlineStep>4</InlineStep> happened, a layout shift would occur during mounting because the element was measured. Using a newer version of Remotion will fix this, because it uses the `aspect-ratio` CSS property.
:::

## Full width

By setting the following style:

```tsx
style={{ width: "100%" }}
```

The video will scale to the full width of the parent container, while the height will be calculated based on the aspect ratio of the video.

## Fitting to a container

You can use

```tsx
style={{ width: "100%", height: "100%" }}
```

to make the `<Player />` fit the whole container. Note that if the player size does not match the video aspect ratio, the video gets scaled down and centered in the player.
