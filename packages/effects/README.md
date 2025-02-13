# Remotion Chroma Key Effect

A React component library for adding video effects in Remotion, featuring green screen (chroma key) capabilities.

## Installation

```bash
npm install @anksji/remotion-chroma-key-effects
```

## GreenScreenOverlay Component

The `GreenScreenOverlay` component allows you to overlay videos with chroma key effects in your Remotion compositions.

### Basic Usage

```jsx
import { GreenScreenOverlay } from "@anksji/remotion-chroma-key-effects";

function MyComposition() {
  return (
    <GreenScreenOverlay
      src="your-video-url.mp4"
      isPlaying={true}
      isChromaKeyEnabled={true}
    />
  );
}
```

### Advanced Usage

```jsx
<GreenScreenOverlay
  src="http://videourl.xyz"
  startTimeInSeconds={20}
  durationInSeconds={5}
  isPlaying={isPlaying}
  isChromaKeyEnabled={true}
  chromaKeyConfig={{
    keyColor: [0.0, 1.0, 0.0],
    similarity: 0.72,
    smoothness: 0.7,
    spill: 0.3,
  }}
  scale={1.2}
  position={{ x: 10, y: 20 }}
/>
```

### Props

#### Required Props

| Prop        | Type    | Description                                     |
| ----------- | ------- | ----------------------------------------------- |
| `src`       | string  | The URL of the video to be overlaid             |
| `isPlaying` | boolean | Controls whether the video is currently playing |

#### Optional Props

| Prop                 | Type    | Default          | Description                                                                     |
| -------------------- | ------- | ---------------- | ------------------------------------------------------------------------------- |
| `startTimeInSeconds` | number  | 0                | The time in seconds at which to start playing the video                         |
| `durationInSeconds`  | number  | undefined        | The duration to play the video in seconds. If not provided, plays until the end |
| `loop`               | boolean | true             | Whether the video should loop after reaching the end                            |
| `scale`              | number  | 1                | Scale factor for the video overlay                                              |
| `position`           | object  | `{ x: 0, y: 0 }` | Position offset for the video overlay                                           |
| `isChromaKeyEnabled` | boolean | false            | Enables/disables chroma key effect                                              |

#### Chroma Key Configuration

The `chromaKeyConfig` prop allows fine-tuning of the chroma key effect:

```typescript
chromaKeyConfig?: {
  keyColor?: [number, number, number];  // RGB values from 0 to 1
  similarity?: number;                  // 0 to 1
  smoothness?: number;                  // 0 to 1
  spill?: number;                      // 0 to 1
}
```

| Parameter    | Default           | Description                                                          |
| ------------ | ----------------- | -------------------------------------------------------------------- |
| `keyColor`   | `[0.0, 1.0, 0.0]` | RGB color to be removed (default is green)                           |
| `similarity` | 0.4               | How close a pixel's color needs to be to the key color to be removed |
| `smoothness` | 0.075             | Smoothness of the edges after keying                                 |
| `spill`      | 0.3               | Amount of color spill to remove from edges                           |

### Performance Tips

1. Set `isChromaKeyEnabled` to false when chroma key is not needed for better performance
2. Use appropriate video resolution to balance quality and performance
3. Consider using lower values for similarity and smoothness for better performance

### Browser Support

The component requires WebGL2 support in the browser. Make sure your target browsers support this feature.

### Examples

#### Basic Green Screen Effect

```jsx
import { GreenScreenOverlay } from "@anksji/remotion-chroma-key-effects";

export const MyComposition = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <GreenScreenOverlay
      src="green-screen-video.mp4"
      isPlaying={isPlaying}
      isChromaKeyEnabled={true}
      chromaKeyConfig={{
        keyColor: [0.0, 1.0, 0.0], // Green
        similarity: 0.4,
        smoothness: 0.075,
        spill: 0.3,
      }}
    />
  );
};
```

#### Timed Video Segment

```jsx
<GreenScreenOverlay
  src="green-screen-video.mp4"
  startTimeInSeconds={30}
  durationInSeconds={10}
  isPlaying={true}
  scale={1.5}
  position={{ x: 20, y: -10 }}
/>
```

### Troubleshooting

1. If the video doesn't play, check if the `src` URL is accessible and the video format is supported
2. For cross-origin videos, ensure proper CORS headers are set on the video server
3. If chroma key effect isn't working, verify that WebGL2 is supported in your browser
4. For performance issues, try adjusting the video resolution or chroma key parameters

### Known Limitations

1. Videos must be served with proper CORS headers
2. WebGL2 support is required for chroma key effects
3. High-resolution videos with chroma key enabled may impact performance
