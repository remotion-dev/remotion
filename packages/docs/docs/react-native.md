---
image: /generated/articles-docs-react-native.png
id: react-native
title: React Native
---

Potential support for React Native is currently under consideration.  
A proof of concept was shown at App.js Conf on May 12th 2023:

- [Repository](https://github.com/remotion-dev/react-native-demo)
- [Talk](https://youtu.be/t0KDn4_zdrk?t=27073) - Timestamp: 7:31:13

## Current status

Remotion is considering adding support for React Native pending positive interest from the React Native community and feedback concerning the architecture.

### Currently working:

- Render videos with any resolution into an MP4
- `useCurrentFrame()`, `useVideoConfig()`, `spring()`, `interpolate()`, `interpolateColors()` functions
- Out-of-viewport rendering

### Not working:

- Audio support
- Embedded video
- Multithreaded rendering
- Other codecs than H264
- APIs requiring Web APIs, e.g. `<Sequence>`, `<AbsoluteFill>`, etc.
  -> Workaround: Pass `layout="none"`

## Feedback

Create issues on the example repo to give feedback, or use the `#native` channel on [Discord](https://remotion.dev/discord).

## License

The code that is in the example repository is MIT-licensed.  
Remotion, a dependency of this example, is licensed under the [Remotion License](https://remotion.dev), which means companies need to acquire a license to support the further development.
