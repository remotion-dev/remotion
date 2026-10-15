import {Audio, Video} from '@remotion/media';
import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BasicCaptions} from './basic-captions';

const FlightCrewSceneContent = ({style}: InteractiveTransformProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={style}>
			<Audio
				name="Normalized flight crew"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/audio/flight-crew-normalized.wav'
				}
				premountFor={fps}
			/>
			<Video
				name="Flight crew footage"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/scenes/team-scene.mp4'
				}
				muted
				premountFor={fps}
				objectFit="cover"
				style={{position: 'absolute', width: '100%', height: '100%'}}
			/>
			<CanvasImage
				name="Pixel Copilot — on the word copilot"
				src={
					'https://remotion.media/jonnys-videos/plane-sight/overlays/pixel-copilot.png'
				}
				from={(266 / 30) * fps}
				durationInFrames={(31 / 30) * fps}
				premountFor={fps}
				style={{
					position: 'absolute',
					left: 264,
					top: 54,
					width: 248,
					height: 248,
					objectFit: 'contain',
					imageRendering: 'pixelated',
					transformOrigin: '50% 50%',
					scale: interpolate(
						frame,
						[(266 / 30) * fps, (272 / 30) * fps, (277 / 30) * fps],
						[0.6, 1.12, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					opacity: interpolate(
						frame,
						[(266 / 30) * fps, (269 / 30) * fps, (294 / 30) * fps, 9.9 * fps],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			/>
			<BasicCaptions
				name="Flight crew captions"
				premountFor={fps}
				width={1280}
				combineTokensWithinMilliseconds={2200}
				style={{
					position: 'absolute',
					bottom: 48,
					scale: '0.6666667',
					transformOrigin: '50% 100%',
				}}
				captions={[
					{
						text: 'This',
						startMs: 1020,
						endMs: 1120,
						timestampMs: 1070,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 1120,
						endMs: 1360,
						timestampMs: 1240,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 1360,
						endMs: 1600,
						timestampMs: 1480,
						confidence: null,
					},
					{
						text: ' flight',
						startMs: 1600,
						endMs: 1820,
						timestampMs: 1710,
						confidence: null,
					},
					{
						text: ' crew',
						startMs: 1820,
						endMs: 2000,
						timestampMs: 1910,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 2000,
						endMs: 2380,
						timestampMs: 2190,
						confidence: null,
					},
					{
						text: ' today.',
						startMs: 2380,
						endMs: 2900,
						timestampMs: 2640,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' I',
						startMs: 2900,
						endMs: 3120,
						timestampMs: 3010,
						confidence: null,
					},
					{
						text: ' am',
						startMs: 3120,
						endMs: 3560,
						timestampMs: 3340,
						confidence: null,
					},
					{
						text: ' maître',
						startMs: 3560,
						endMs: 3820,
						timestampMs: 3690,
						confidence: null,
					},
					{
						text: ' de cabine',
						startMs: 3820,
						endMs: 4840,
						timestampMs: 4290,
						confidence: null,
					},
					{
						text: ' Jonny.',
						startMs: 4840,
						endMs: 5000,
						timestampMs: 4920,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: " I'm",
						startMs: 6140,
						endMs: 6320,
						timestampMs: 6230,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 6320,
						endMs: 6580,
						timestampMs: 6450,
						confidence: null,
					},
					{
						text: ' captain,',
						startMs: 6580,
						endMs: 7020,
						timestampMs: 6800,
						confidence: null,
					},
					{
						text: ' Max.',
						startMs: 7120,
						endMs: 7980,
						timestampMs: 7550,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Marcel,',
						startMs: 8300,
						endMs: 8760,
						timestampMs: 8530,
						confidence: null,
					},
					{
						text: ' copilot.',
						startMs: 8860,
						endMs: 9900,
						timestampMs: 9380,
						confidence: null,
					},
				]}
			/>
		</AbsoluteFill>
	);
};

export const FlightCrewScene = Interactive.create({
	Component: FlightCrewSceneContent,
	componentName: 'FlightCrewScene',
});
