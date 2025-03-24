---
image: /generated/articles-docs-timeline-usage.png
title: Timeline – Usage
sidebar_label: Usage
id: usage
---

# Timeline Usage

## Component Integration

Import and use the timeline components in your React application.

For optimal performance and proper functionality, structure your components like this:

```tsx
import type {PlayerRef} from '@remotion/player';
import {Timeline, TimelineContainer} from './timeline/remotion-timeline/components/timeline';
import {TimelineProvider} from './timeline/remotion-timeline/context/provider';
import {TimelineSizeProvider} from './timeline/remotion-timeline/context/timeline-size-provider';
import {TimelineZoomProvider} from './timeline/remotion-timeline/context/timeline-zoom-provider';
import {PreviewContainer} from './layout';

export const App = () => {
  const playerRef = useRef<PlayerRef>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineContainerSize = useElementSize(timelineContainerRef);
  const timelineContainerWidth = timelineContainerSize?.width;

  return (
    <TimelineProvider
      onChange={(newState) => {
        console.log('New timeline state:', newState);
      }}
      initialState={initialState}
    >
      <TimelineZoomProvider initialZoom={1}>
        <PreviewContainer>
          <VideoPreview loop playerRef={playerRef} />
          <ActionRow playerRef={playerRef} />
        </PreviewContainer>

        <TimelineContainer timelineContainerRef={timelineContainerRef}>
          {timelineContainerWidth ? (
            <TimelineSizeProvider containerWidth={timelineContainerWidth}>
              <Timeline playerRef={playerRef} />
            </TimelineSizeProvider>
          ) : null}
        </TimelineContainer>
      </TimelineZoomProvider>
    </TimelineProvider>
  );
};
```

This structure ensures:

- Timeline state management through `TimelineProvider`
- Zoom functionality with `TimelineZoomProvider`
- Proper sizing calculations with `TimelineSizeProvider`
- Responsive timeline container with `TimelineContainer`

## Default state structure

The project includes a predefined state structure for timeline tracks and items. You can check [TimelineProvider component](https://github.com/remotion-dev/timeline/blob/main/src/timeline/remotion-timeline/context/provider.tsx) for the state structure.

## Video Preview

This project includes a `CanvasComposition`, a Remotion composition that renders the timeline state in the Remotion Player.

You can:

- Use the provided composition as-is for quick prototyping
- Adapt it to your needs
- Replace it with your own composition while keeping the timeline functionality

Check `video-preview.tsx` and `App.tsx` for implementation examples.

## State Persistence

The `TimelineProvider` includes an `onChange` callback that fires whenever the timeline state changes (adding/removing tracks, moving items, etc.). Use this to save the editor state to your backend:

```tsx
function VideoEditor() {
  const saveToServer = async (state: TimelineState) => {
    try {
      await fetch('/api/save-timeline', {
        method: 'POST',
        body: JSON.stringify(state),
      });
    } catch (error) {
      console.error('Failed to save timeline state:', error);
    }
  };

  return (
    <TimelineProvider onChange={saveToServer} initialState={initialState}>
      <div className="video-editor">
        <VideoPreview playerRef={playerRef} />
        <ActionRow playerRef={playerRef} />
        <TimelineRoot playerRef={playerRef} />
      </div>
    </TimelineProvider>
  );
}
```

## Example Project Structure

In `App.tsx`, you can see the complete implementation of the timeline component.

The example project demonstrates:

- Importing the timeline components
- Using the `ActionRow` component to use timeline zoom and add clips
- Using the `TimelineRoot` component to render the timeline
