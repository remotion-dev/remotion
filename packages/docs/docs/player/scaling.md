---
id: scaling
title: "Scaling"
---

The following algorithm is used for calculating the size of the Player:

1. By default, the Player is as big as the composition height, defined by the `compositionHeight` and `compositionWidth` props.
1. If `height` and `width` is defined using the `style` property, the player will assume the dimensions you have passed.
1. If a `height` is passed using the `style` property, the player will assume that height, and calculate the width based on the aspect ratio of the video.
1. If `width` is passed using the `style` property, the player will assume that width and calculate the height based on the aspect ration of the video.

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
