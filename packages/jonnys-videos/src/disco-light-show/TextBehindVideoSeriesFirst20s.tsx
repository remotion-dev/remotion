import {Video} from '@remotion/media';
import {
	Interactive,
	Composition,
	Easing,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';
import {Clip5} from './Clip5';

export const TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES = 190;

const TextBehindVideoSeriesFirst20sCompositionInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<Clip5
				name="Lower party footage"
				width={1080}
				height={1920}
				durationInFrames={300}
				style={{
					position: 'absolute',
					overflow: 'visible',
					scale: 1.59,
					translate: interpolate(
						frame,
						[19, 29],
						['1960px -170px', '-450px -170px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.inOut(Easing.cubic)],
						},
					),
				}}
				from={-1}
			/>
			<Clip5
				name="Upper party footage"
				width={1080}
				height={1920}
				durationInFrames={300}
				style={{
					position: 'absolute',
					overflow: 'visible',
					scale: 1.328,
					translate: interpolate(
						frame,
						[15, 25],
						['-1650.9px -1291.1px', '234.7px -1291.1px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.inOut(Easing.cubic)],
						},
					),
				}}
				from={-1}
			/>
			<Video
				name="Text behind video"
				src={asset('text-behind-video-series-first-20s.mp4')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[9, 19],
						['1500px 311.8px', '-420px 311.8px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					width: 1920,
					height: 1080,
					scale: 0.594,
				}}
				muted
				durationInFrames={190}
				trimBefore={31}
			/>
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

export const TextBehindVideoSeriesFirst20sComposition = Interactive.create({
	Component: TextBehindVideoSeriesFirst20sCompositionInner,
	layout: 'absolute-fill',
});
