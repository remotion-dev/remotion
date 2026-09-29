import {Video} from '@remotion/media';
import {Composition, staticFile} from 'remotion';
import {BasicCaptions} from './basic-captions.element';

export function Precomposition() {
	return (
		<>
			<Video src={staticFile('whats1.mov')} durationInFrames={64} />
			<BasicCaptions
				style={{
					height: 'auto',
					translate: '510px -259.1px',
				}}
				captions={[
					{
						text: 'Here',
						startMs: 1440,
						endMs: 1620,
						timestampMs: 1530,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 1620,
						endMs: 1820,
						timestampMs: 1720,
						confidence: null,
					},
					{
						text: ' some',
						startMs: 1820,
						endMs: 1960,
						timestampMs: 1890,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 1960,
						endMs: 2060,
						timestampMs: 2010,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 2060,
						endMs: 2300,
						timestampMs: 2180,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 2300,
						endMs: 2480,
						timestampMs: 2390,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 2480,
						endMs: 2660,
						timestampMs: 2570,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 2660,
						endMs: 3020,
						timestampMs: 2840,
						confidence: null,
					},
					{
						text: ' recently',
						startMs: 3020,
						endMs: 3560,
						timestampMs: 3290,
						confidence: null,
					},
					{
						text: ' improved',
						startMs: 3560,
						endMs: 3880,
						timestampMs: 3720,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 3880,
						endMs: 4080,
						timestampMs: 3980,
						confidence: null,
					},
					{
						text: ' Remotion.',
						startMs: 4080,
						endMs: 5000,
						timestampMs: 4540,
						confidence: null,
					},
				]}
				durationInFrames={64}
			/>
		</>
	);
}

export const TimelineMultiSelectResizeFlickerComposition: React.FC = () => {
	return (
		<Composition
			id="timeline-multi-select-resize-flicker"
			component={Precomposition}
			durationInFrames={150}
			fps={30}
			width={1920}
			height={1080}
		/>
	);
};
