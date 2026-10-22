import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {assetUrl} from './assets';
import {NumberedChapter} from './NumberedChapter';

const SFX_URLS = [
	'https://remotion.media/whip.wav',
	'https://remotion.media/whoosh.wav',
	'https://remotion.media/page-turn.wav',
	'https://remotion.media/switch.wav',
	'https://remotion.media/mouse-click.wav',
	'https://remotion.media/shutter-modern.wav',
	'https://remotion.media/shutter-old.wav',
	'https://remotion.media/ding.wav',
	'https://remotion.media/bruh.wav',
	'https://remotion.media/vine-boom.wav',
	'https://remotion.media/windows-xp-error.wav',
];

// Repeat URLs enough to fill scroll
const REPEATED_URLS = [0, 1, 2, 3].flatMap((repetition) =>
	SFX_URLS.map((url) => ({id: `${repetition}-${url}`, url})),
);

const SfxUrlList: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'white', overflow: 'hidden'}}>
			<Interactive.Div
				name="Scrolling sound effect URLs"
				style={{
					translate: interpolate(frame, [0, fps], ['0px 0px', '0px -40px']),
					padding: '80px 40px',
				}}
			>
				{REPEATED_URLS.map(({id, url}) => (
					<div
						key={id}
						style={{
							fontFamily: 'GT Planar',
							fontSize: 38,
							fontWeight: 500,
							color: '#333',
							height: 160,
							display: 'flex',
							alignItems: 'center',
							whiteSpace: 'nowrap',
							borderBottom: '1px solid #e0e0e0',
							marginLeft: -40,
							marginRight: -40,
							paddingLeft: 40,
						}}
					>
						{url.replace('https://', '')}
					</div>
				))}
			</Interactive.Div>
			{/* Top fade mask */}
			<AbsoluteFill
				style={{
					height: 200,
					bottom: 'auto',
					background:
						'linear-gradient(to bottom, white, rgba(255, 255, 255, 0))',
					pointerEvents: 'none',
				}}
			/>
			{/* Bottom fade mask */}
			<AbsoluteFill
				style={{
					height: 200,
					top: 'auto',
					background: 'linear-gradient(to top, white, rgba(255, 255, 255, 0))',
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene3: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Interactive.Div
				name="Presenter position"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					translate: interpolate(
						frame,
						[15, 45, 150, 180, 590, 620, 725, 755],
						[
							'0% 0px',
							'-20% 0px',
							'-20% 0px',
							'0% 0px',
							'0% 0px',
							'-20% 0px',
							'-20% 0px',
							'0% 0px',
						],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
								Easing.linear,
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<Video
					name="Presenter video"
					src={assetUrl('whats3.mov')}
					trimBefore={69}
					trimAfter={1335}
				/>
			</Interactive.Div>
			<Interactive.Div
				name="Chapter panel"
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: '60%',
					width: '40%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					backgroundColor: 'white',
					translate: interpolate(
						frame,
						[15, 45, 150, 180],
						['102% 0px', '0% 0px', '0% 0px', '102% 0px'],
						{
							easing: [
								Easing.out(Easing.cubic),
								Easing.linear,
								Easing.in(Easing.cubic),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<NumberedChapter chapterNumber={2} chapterTitle="Sound Effects" />
			</Interactive.Div>
			<Sequence
				name="Sound effects website"
				from={440}
				durationInFrames={120}
				layout="none"
			>
				<Interactive.Div
					name="sfx-screenshot background"
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'white',
						opacity: interpolate(frame, [440, 446, 554, 560], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Interactive.Div
						name="B-roll zoom"
						style={{
							height: '100%',
							transformOrigin: 'top center',
							scale: interpolate(frame, [440, 560], [1, 1.15], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						<Img
							name="sfx-screenshot"
							src={assetUrl('sfx-screenshot.png')}
							style={{
								height: '100%',
								objectFit: 'contain',
								translate: interpolate(
									frame,
									[440, 560],
									['0px 0%', '0px -15%'],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								),
							}}
						/>
					</Interactive.Div>
				</Interactive.Div>
			</Sequence>
			<Sequence name="Sound effects URLs" from={590} layout="none">
				<Interactive.Div
					name="Details panel"
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: '60%',
						width: '40%',
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
						backgroundColor: 'white',
						translate: interpolate(
							frame,
							[590, 620, 725, 755],
							['102% 0px', '0% 0px', '0% 0px', '102% 0px'],
							{
								easing: [
									Easing.out(Easing.cubic),
									Easing.linear,
									Easing.in(Easing.cubic),
								],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
					}}
				>
					<SfxUrlList />
				</Interactive.Div>
			</Sequence>
		</AbsoluteFill>
	);
};
