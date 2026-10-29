// Proposed caption addition to the real announcement's Scene1.tsx.
// Caption copy and source timestamps are illustrative until checked against the recording.
export const captionsSample = `import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {BasicCaptions} from './basic-captions';
import {LowerThird} from './LowerThird';

export const Scene1 = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence
        name="Presenter video and captions"
        trimBefore={0.9 * fps}
        durationInFrames={3.8 * fps}
      >
        <Video name="Presenter video" src={assetUrl('whats1.mov')} />
        <BasicCaptions
          name="Presenter captions"
          width={900}
          style={{
            position: 'absolute',
            bottom: 280,
            translate: '510px 0px',
          }}
          captions={[
            {
              text: "What's new",
              startMs: 900,
              endMs: 1600,
              timestampMs: null,
              confidence: null,
            },
            {
              text: ' in Remotion',
              startMs: 1600,
              endMs: 2400,
              timestampMs: null,
              confidence: null,
            },
          ]}
        />
      </Sequence>
      <Sequence name="Presenter introduction" from={0.5 * fps} layout="none">
        <LowerThird />
      </Sequence>
    </AbsoluteFill>
  );
};`;
