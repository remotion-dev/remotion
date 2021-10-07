---
title: useCurrentTime()
id: use-current-time
---

This hook works the same as [`useCurrentTime()`](/docs/use-current-time), except that it returns the current time in seconds rather than the frame number.

```tsx twoslash
import {Sequence, useCurrentFrame, useCurrentTime} from 'remotion'

const Title = () => {
  const time = useCurrentTime() // 25
  return <div>{time}</div>
}

const Subtitle = () => {
  const time = useCurrentTime() // 15
  return <div>{time}</div>
}

const MyVideo = () => {
  const time = useCurrentTime() // 25

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
