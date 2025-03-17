---
title: Remotion Timeline
id: remotion-timeline
---

A customizable timeline component that integrates seamlessly with Remotion Player. It's perfect for developers looking to build video editing interfaces with React and Remotion.

Get it on [remotion.pro](https://www.remotion.pro/timeline)

### Key Features

Interface:

- Multiple track support with drag-and-drop functionality (between and within tracks)
- Timeline item selection and manipulation
- Keyboard shortcuts for common actions
- `CanvasComposition` for rendering the timeline state in the Remotion Player
- Zoomable timeline and `<ZoomSlider>` component to control the zoom level

Customization:

- Theming with variables (Tailwind CSS V4 and V3)
- Extensible state management

## Installation

1. Copy the `timeline/` folder to your application
2. Install the required dependencies:

```bash
npm install remotion @remotion/player @remotion/media-utils tailwindcss
```

## Setup

### 1. Tailwind Configuration

#### Using Tailwind CSS V4 (Current Project)

This project uses Tailwind CSS V4. Import `src/timeline/theme/timeline.css` in your global CSS file:

```css
@import './timeline/theme/timeline.css';
```

You can customize the colors by modifying the values in the `@theme` block.

#### Using Tailwind CSS V3 (Legacy)

Use `src/timeline/theme/timeline-preset.mjs` as a preset in your `tailwind.config.js`:

Then, set up your `tailwind.config.js` like this:

```js
import timelinePreset from './timeline/theme/timeline-preset.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [timelinePreset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Add your custom theme extensions here
    },
  },
};
```

### 2. Component Integration

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

The project includes a predefined state structure for timeline tracks and items. You can check [TimelineProvider component](src/timeline/remotion-timeline/context/provider.tsx) for the state structure.

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

## Questions and answers

### Will the template work with React 18?

Yes, the template is fully compatible with React 18. We've intentionally avoided using React 19-specific features like the `use()` hook or the new direct component ref-passing to ensure backward compatibility. This means you can confidently use this template with React 18 projects without encountering compatibility issues.

If you do experience any problems or unexpected behavior while using the template with React 18, please create an issue in the repository.

### Does the template include state management libraries?

No, we use React Context for basic state management instead of third-party libraries like Zustand or Redux.

This decision wasn't about maintaining "purity" - it's about practicality. State management libraries often require specific architectural approaches and can become outdated or limit flexibility. By sticking with React Context, we provide a foundation that works well for most use cases while remaining adaptable.

If your project needs more sophisticated state management for performance optimization, you can easily add the library that best fits your specific requirements. Whether that's Zustand for its simplicity, Redux for complex state, or something else entirely - the choice is yours and can be tailored to your particular application needs.

Our goal is to provide a template that works well for everyone without imposing unnecessary opinion or complexity on your project.

## License

The source code of the Remotion Timeline is governed by the [Remotion license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) and [its own specific license](https://github.com/remotion-dev/timeline/blob/main/LICENSE.md).

- Remotion, as an underlying technology of the Remotion Timeline, is free to use for individuals and small companies. If you fall into this category, you can buy the Remotion Timeline as a one-time purchase. If you are a larger company, you must subscribe to the [Company License](https://www.remotion.pro/license). Read the [Terms & Conditions](https://www.remotion.pro/terms).

- The Remotion Timeline license is publicly available in the Remotion Store as well as accessible through the dedicated GitHub repository after purchase.
