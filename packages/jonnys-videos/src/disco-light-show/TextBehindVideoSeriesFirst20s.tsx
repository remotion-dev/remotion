import {Video} from '@remotion/media';
import {
	Composition,
	Easing,
	interpolate,
	useCurrentFrame,
	Sequence,
} from 'remotion';
import {asset} from './assets';
import {Clip5} from './Clip5';

export const TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES = 190;

export const TextBehindVideoSeriesFirst20sComposition: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<Sequence
				name="Clip5"
				width={1080}
				height={1920}
				durationInFrames={300}
				style={{
					position: 'absolute',
					scale: 1.59,
					translate: interpolate(
						frame,
						[19, 29],
						['1960px -170px', '-450px -170px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
				}}
				from={-1}
			>
				<Clip5 />
			</Sequence>
			<Sequence
				name="Clip5-copy"
				width={1080}
				height={1920}
				durationInFrames={300}
				style={{
					position: 'absolute',
					scale: 1.328,
					translate: interpolate(
						frame,
						[15, 25],
						['-1650.9px -1291.1px', '234.7px -1291.1px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
				}}
				from={-1}
			>
				<Clip5 />
			</Sequence>
			<Sequence showInTimeline={false}>
				<Video
					src={asset('text-behind-video-series-first-20s.mp4')}
					style={{
						position: 'absolute',
						translate: '-420px 311.8px',
						width: 1920,
						height: 1080,
						scale: interpolate(frame, [9, 14, 19], [0, 0.585, 0.594], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						}),
					}}
					muted
					durationInFrames={190}
					trimBefore={31}
				/>
			</Sequence>
		</>
	);
};

export const TextBehindVideoSeriesFirst20s: React.FC = () => {
	return (
		<Composition
			id="TextBehindVideoSeriesFirst20s"
			component={TextBehindVideoSeriesFirst20sComposition}
			durationInFrames={190}
			fps={30}
			width={1080}
			height={1920}
		/>
	);
};
