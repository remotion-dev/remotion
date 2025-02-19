---
image: /generated/articles-docs-videos-sequence.png
title: Playing videos in sequence
sidebar_label: Playing videos in sequence
crumb: 'How To'
---

If you would like to play multiple videos in sequence, you can:

<Step>1</Step> Define a component that renders a [`<Series>`](/docs/series) of [`<OffthreadVideo>`](/docs/offthreadvideo) components.
<br/><Step>2</Step> Create a [`calculateMetadata()`](/docs/calculate-metadata) function that fetches the duration of each video.
<br/><Step>3</Step> Register a [`<Composition>`](/docs/composition) that specifies a list of videos.

## Basic example

Start off by creating a component that renders a list of videos using the [`<Series>`](/docs/series) and [`<OffthreadVideo>`](/docs/offthreadvideo) component:

```tsx twoslash title="VideosInSequence.tsx"
import React from 'react';
import {OffthreadVideo, Series} from 'remotion';

type VideoToEmbed = {
  src: string;
  durationInFrames: number | null;
};

type Props = {
  videos: VideoToEmbed[];
};

export const VideosInSequence: React.FC<Props> = ({videos}) => {
  return (
    <Series>
      {videos.map((vid) => {
        if (vid.durationInFrames === null) {
          throw new Error('Could not get video duration');
        }

        return (
          <Series.Sequence key={vid.src} durationInFrames={vid.durationInFrames}>
            <OffthreadVideo src={vid.src} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
```

In the same file, create a function that calculates the metadata for the composition:

<Step>1</Step> Calls [`parseMedia()`](/docs/media-parser) to get the duration of each video.
<div style={{marginTop: -14}} />
<Step>2</Step> Create a [`calculateMetadata()`](/docs/calculate-metadata) function that fetches the duration of each video.
<div style={{marginTop: -14}} />
<Step>3</Step> Sums up all durations to get the total duration of the composition.

```tsx twoslash title="VideosInSequence.tsx"
import React from 'react';
import {OffthreadVideo, staticFile, Series, CalculateMetadataFunction} from 'remotion';
import {parseMedia} from '@remotion/media-parser';

type VideoToEmbed = {
  src: string;
  durationInFrames: number | null;
};

type Props = {
  videos: VideoToEmbed[];
};

// ---cut---
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  const fps = 30;
  const videos = await Promise.all([
    ...props.videos.map(async (video): Promise<VideoToEmbed> => {
      const {slowDurationInSeconds} = await parseMedia({
        src: video.src,
        fields: {
          slowDurationInSeconds: true,
        },
      });

      return {
        durationInFrames: Math.floor(slowDurationInSeconds * fps),
        src: video.src,
      };
    }),
  ]);

  const totalDurationInFrames = videos.reduce((acc, video) => acc + (video.durationInFrames ?? 0), 0);

  return {
    props: {
      ...props,
      videos,
    },
    fps,
    durationInFrames: totalDurationInFrames,
  };
};
```

In your [root file](/docs/terminology/root-file), create a [`<Composition>`](/docs/composition) that uses the `VideosInSequence` component and the exported `calculateMetadata` function:

```tsx twoslash title="Root.tsx"
// @filename: VideosInSequence.tsx
import React from 'react';
import {OffthreadVideo, staticFile, Series, CalculateMetadataFunction} from 'remotion';
import {parseMedia} from '@remotion/media-parser';

type VideoToEmbed = {
  src: string;
  durationInFrames: number | null;
};

type Props = {
  videos: VideoToEmbed[];
};

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({props}) => {
  const fps = 30;
  const videos = await Promise.all([
    ...props.videos.map(async (video): Promise<VideoToEmbed> => {
      const {slowDurationInSeconds} = await parseMedia({
        src: video.src,
        fields: {
          slowDurationInSeconds: true,
        },
      });

      return {
        durationInFrames: Math.floor(slowDurationInSeconds * fps),
        src: video.src,
      };
    }),
  ]);

  const totalDurationInFrames = videos.reduce((acc, video) => acc + video.durationInFrames!, 0);

  return {
    props: {
      ...props,
      videos,
    },
    fps,
    durationInFrames: totalDurationInFrames,
  };
};

export const VideosInSequence: React.FC<Props> = ({videos}) => {
  return (
    <Series>
      {videos.map((vid) => {
        if (vid.durationInFrames === null) {
          throw new Error('Could not get video duration');
        }

        return (
          <Series.Sequence key={vid.src} durationInFrames={vid.durationInFrames}>
            <OffthreadVideo src={staticFile('video.mp4')} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};

// @filename: Root.tsx
// ---cut---

import React from 'react';
import {Composition, staticFile} from 'remotion';
import {VideosInSequence, calculateMetadata} from './VideosInSequence';

export const Root: React.FC = () => {
  return (
    <Composition
      id="VideosInSequence"
      component={VideosInSequence}
      width={1920}
      height={1080}
      defaultProps={{
        videos: [
          {
            durationInFrames: null,
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            durationInFrames: null,
            src: staticFile('localvideo.mp4'),
          },
        ],
      }}
      calculateMetadata={calculateMetadata}
    />
  );
};
```

## Adding premounting

If you only care about the video looking smooth when rendered, you may skip this step.  
If you also want smooth preview playback in the Player, consider this:

A video will only load when it is about to be played.  
To create a smoother preview playback, we should do two things to all videos:

<Step>1</Step> Add a [`premountFor`](/docs/series#premountfor) prop to [`<Series.Sequence>`](/docs/series). This will
invisibly mount the video tag before it is played, giving it some time to load.{' '}
<div style={{marginTop: -14}} />
<Step>2</Step> Add the [`pauseWhenBuffering`](/docs/offthreadvideo#pausewhenbuffering) prop. This will transition the Player into a [buffering state](/docs/player/buffer-state), should the video still need to load.

```tsx twoslash title="VideosInSequence.tsx" {14, 17}
import React from 'react';
import {OffthreadVideo, Series, useVideoConfig} from 'remotion';

type VideoToEmbed = {
  src: string;
  durationInFrames: number | null;
};

type Props = {
  videos: VideoToEmbed[];
};

// ---cut---
export const VideosInSequence: React.FC<Props> = ({videos}) => {
  const {fps} = useVideoConfig();

  return (
    <Series>
      {videos.map((vid) => {
        if (vid.durationInFrames === null) {
          throw new Error('Could not get video duration');
        }

        return (
          <Series.Sequence key={vid.src} premountFor={4 * fps} durationInFrames={vid.durationInFrames}>
            <OffthreadVideo pauseWhenBuffering src={vid.src} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
```

## Browser autoplay policies

Mobile browsers are more aggressive in blocking autoplaying videos that enter after the start of the composition.

If you want to ensure a smooth playback experience for all videos, also [read the notes about browser autoplay behavior](/docs/player/autoplay#media-that-enters-the-video-after-the-start) and customize the behavior if needed.

## See also

- [`<OffthreadVideo>`](/docs/offthreadvideo)
- [`<Series>`](/docs/series)
- [`calculateMetadata()`](/docs/calculate-metadata)
- [`parseMedia()`](/docs/media-parser)
- [`<Composition>`](/docs/composition)
- [Root file](/docs/terminology/root-file)
- [Player buffering state](/docs/player/buffer-state)
- [Avoiding flickering in the Player](/docs/troubleshooting/player-flicker)
- [Combatting autoplay issues](/docs/player/autoplay)
