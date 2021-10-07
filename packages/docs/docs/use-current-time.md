---
title: useCurrentTime()
id: use-current-time
---

With this hook, you can retrieve the current time of the video in seconds. To learn more about how Remotion works with time, read the page about [the fundamentals](/docs/the-fundamentals).

This hook calculates based off of the frame and the videos fps settings.

```tsx twoslash
import {Sequence, useCurrentFrame} from 'remotion'

const Title = () => {
  const time = useCurrentTime() // 25
  return <div>{time}</div>
}

const Subtitle = () => {
  const time = useCurrentTime() // 15
  return <div>{time}</div>
}

const MyVideo = () => {
  const time = useCurrenttime() // 25

  return (
    <div>
      <Title />
      <Sequence from={10}>
        <Subtitle />
      </Sequence>
    </div>
  )
}
```

## See also

- [useVideoConfig()](/docs/use-video-config)
- [useCurrentFrame()](/docs/use-current-frame)
