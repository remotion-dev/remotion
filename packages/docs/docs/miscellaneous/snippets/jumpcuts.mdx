---
image: /generated/articles-docs-miscellaneous-snippets-jumpcuts.png
title: 'Jump Cutting'
sidebar_label: Jump Cuts
crumb: 'Snippets'
---

Sometimes you want to implement a "jump cut" to skip parts of a video (for example to cut out the "uhm"s).  
You have the following considerations to make:

<div>
  <div>
    <Step>1</Step> The browser might have already preloaded a small portion of the future of the video (around 1-2 seconds). In this case, it would be useful to reuse the same video tag.
  </div>
  <div>
    <Step>2</Step> A jump far into the future will not be loaded yet. In this case, the video tag should not be re-used, rather a second one should be [premounted](/docs/player/premounting) so it can preload.
  </div>
  <div>
    <Step>3</Step> If the jump is tiny (&lt;0.45sec), Remotion might not seek due to the [`acceptableTimeshiftInSeconds`](/docs/offthreadvideo#acceptabletimeshiftinseconds) prop. You might have to decrease it temporarily.
  </div>
</div>

:::note
These considerations are only for smooth previews in the browser.  
During rendering, videos will be frame-perfect even if you do not follow these considerations.
:::

## Re-using the same video tag

For case <InlineStep style={{marginLeft: 5}}>1</InlineStep> where you make a small jump, it makes sense to re-use the same video tag.  
The following snippet shows how to do this.

In case of <InlineStep style={{marginLeft: 5}}>3</InlineStep> we are temporarily disabling the [`acceptableTimeshiftInSeconds`](/docs/offthreadvideo#acceptabletimeshiftinseconds) prop for force a seek even if it is a tiny jump.

```tsx twoslash
import React, {useMemo} from 'react';
import {CalculateMetadataFunction, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';

const fps = 30;

type Section = {
  trimBefore: number;
  trimAfter: number;
};

export const SAMPLE_SECTIONS: Section[] = [
  {trimBefore: 0, trimAfter: 5 * fps},
  {
    trimBefore: 7 * fps,
    trimAfter: 10 * fps,
  },
  {
    trimBefore: 13 * fps,
    trimAfter: 18 * fps,
  },
];

type Props = {
  sections: Section[];
};

export const calculateMetadata: CalculateMetadataFunction<Props> = ({props}) => {
  const durationInFrames = props.sections.reduce((acc, section) => {
    return acc + section.trimAfter - section.trimBefore;
  }, 0);

  return {
    fps,
    durationInFrames,
  };
};

export const JumpCuts: React.FC<Props> = ({sections}) => {
  const frame = useCurrentFrame();

  const cut = useMemo(() => {
    let summedUpDurations = 0;
    for (const section of sections) {
      summedUpDurations += section.trimAfter - section.trimBefore;
      if (summedUpDurations > frame) {
        const trimBefore = section.trimAfter - summedUpDurations;
        const offset = section.trimBefore - frame - trimBefore;

        return {
          trimBefore,
          firstFrameOfSection: offset === 0,
        };
      }
    }

    return null;
  }, [frame, sections]);

  if (cut === null) {
    return null;
  }

  return (
    <OffthreadVideo
      pauseWhenBuffering
      trimBefore={cut.trimBefore}
      // Remotion will automatically add a time fragment to the end of the video URL
      // based on `trimBefore` and `trimAfter`. Opt out of this by adding one yourself.
      // https://www.remotion.dev/docs/media-fragments
      src={`${staticFile('time.mp4')}#t=0,`}
      // Force Remotion to seek when it jumps even just a tiny bit
      acceptableTimeShiftInSeconds={cut.firstFrameOfSection ? 0.000001 : undefined}
    />
  );
};
```

## Pre-mounting a second video tag

In case <InlineStep style={{marginLeft: 5}}>2</InlineStep> where you make a large jump, it makes sense to pre-mount a second video tag.  
See [Playing videos in sequence](/docs/videos/sequence) for how to do this.

## See also

- [Different segments at different speeds](/docs/miscellaneous/snippets/different-segments-at-different-speeds)
- [Change the speed of a video over time](/docs/miscellaneous/snippets/accelerated-video)
