Remotion can be used for barebones video editing. Layers can be dragged on the left side and right side to be trimmed, and layers can be moved around in the Studio.

For this to work correctly, the markup must be structured like this:

```tsx
<Video src="https://remotion.media/video.mp4" trimBefore={0} durationInFrames={78}/>
<Video src="https://remotion.media/video.webm" trimBefore={12} from={78} durationInFrames={66}/>
<Video src="https://remotion.media/video.mp4" trimBefore={72}  from={144} durationInFrames={90}/>
<Video src="https://remotion.media/video.webm" trimBefore={58} from={234} durationInFrames={72}/>
<Video src="https://remotion.media/video.mp4" trimBefore={180} from={306} durationInFrames={60} />
```

`from` determines at which frame in the timeline the video starts.
`durationInFrames` determines at which frame in the timeline the video ends.
The video starts playing at 0 seconds, unless `trimBefore` (in frames) is set.

- Each Video must be it's independent node in the source code, no programmatic iteration such as `.map`
- `from`, `durationInFrames` and `trimBefore` must be hardcoded in frames. They cannot be computed.
- `<Video>` must be imported from `@remotion/media`.
