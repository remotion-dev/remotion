import {BasicCaptions} from './basic-captions.element';
import {halftone} from '@remotion/effects/halftone';
import {grayscale} from '@remotion/effects/grayscale';
import {blur} from '@remotion/effects/blur';
import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence, useVideoConfig, staticFile} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {LowerThird} from './LowerThird';

const FILE = 'whats1.mov';

export const Scene1: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	return (
		<AbsoluteFill>
			<Video
				src={staticFile('whats1-base-base.webm')}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
				effects={[blur({
					radius: 13
				}), grayscale({})]}
			/>
			<BasicCaptions captions={[
			  {
			    "text": "Here",
			    "startMs": 520,
			    "endMs": 700,
			    "timestampMs": 610,
			    "confidence": null
			  },
			  {
			    "text": " are",
			    "startMs": 700,
			    "endMs": 880,
			    "timestampMs": 790,
			    "confidence": null
			  },
			  {
			    "text": " some",
			    "startMs": 880,
			    "endMs": 1020,
			    "timestampMs": 950,
			    "confidence": null
			  },
			  {
			    "text": " of",
			    "startMs": 1020,
			    "endMs": 1140,
			    "timestampMs": 1080,
			    "confidence": null
			  },
			  {
			    "text": " the",
			    "startMs": 1140,
			    "endMs": 1380,
			    "timestampMs": 1260,
			    "confidence": null
			  },
			  {
			    "text": " things",
			    "startMs": 1380,
			    "endMs": 1560,
			    "timestampMs": 1470,
			    "confidence": null
			  },
			  {
			    "text": " that",
			    "startMs": 1560,
			    "endMs": 1720,
			    "timestampMs": 1640,
			    "confidence": null
			  },
			  {
			    "text": " we",
			    "startMs": 1720,
			    "endMs": 2080,
			    "timestampMs": 1900,
			    "confidence": null
			  },
			  {
			    "text": " recently",
			    "startMs": 2080,
			    "endMs": 2640,
			    "timestampMs": 2360,
			    "confidence": null
			  },
			  {
			    "text": " improved",
			    "startMs": 2640,
			    "endMs": 2960,
			    "timestampMs": 2800,
			    "confidence": null
			  },
			  {
			    "text": " in",
			    "startMs": 2960,
			    "endMs": 3140,
			    "timestampMs": 3050,
			    "confidence": null
			  },
			  {
			    "text": " Remotion.",
			    "startMs": 3140,
			    "endMs": 4000,
			    "timestampMs": 3570,
			    "confidence": null
			  }
			]} trimBefore={trimBefore} durationInFrames={114} />
			<Sequence from={15} layout="none">
				<LowerThird
					name="Jonny Burger"
					title="Chief Hacker, Remotion"
					durationInFrames={Math.ceil(trimAfter - trimBefore - 15)}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
