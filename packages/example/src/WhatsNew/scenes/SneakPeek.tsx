import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {easeInOut, pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {Letterbox} from '../components/fx';
import {EyeIcon, WandIcon} from '../components/icons';
import {
	getCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {StudioMock} from '../components/StudioMock';
import {
	ChapterSticker,
	Chip,
	CodeLines,
	Label,
	Panel,
	Pop,
	Stamp,
	syntax,
	Window,
} from '../components/ui';
import {display} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 184, layout: 'split'},
	{at: 518, layout: 'pip', duration: 26},
];

const Spotlight: React.FC = () => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [0, 20, 150, 184], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill
			style={{
				opacity: p,
				background:
					'radial-gradient(ellipse 45% 60% at 52% 40%, rgba(20,10,40,0) 40%, rgba(12,6,28,0.72) 100%)',
			}}
		/>
	);
};

const requests = [
	{text: 'Can Remotion be easier to use?', at: 13, x: 90, y: 180, rotate: -3},
	{
		text: 'A visual editor would be amazing!',
		at: 37,
		x: 130,
		y: 330,
		rotate: 2,
	},
	{text: 'Make it easier, please!', at: 67, x: 100, y: 480, rotate: -2},
];

const Requests: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			{requests.map((r, i) => {
				const p = pop(frame, r.at, 11);
				return (
					<div
						key={r.text}
						style={{
							position: 'absolute',
							left: r.x,
							top: r.y,
							display: 'flex',
							alignItems: 'center',
							gap: 18,
							padding: '20px 32px 22px 20px',
							borderRadius: '34px 34px 34px 10px',
							backgroundColor: colors.paper,
							boxShadow: '0 22px 50px rgba(0,0,0,0.35)',
							opacity: Math.min(1, p * 2),
							scale: 0.5 + 0.5 * p,
							rotate: `${r.rotate}deg`,
							transformOrigin: '0% 100%',
						}}
					>
						<div
							style={{
								width: 58,
								height: 58,
								borderRadius: 29,
								background: [
									'linear-gradient(135deg,#FF8A00,#FF3B8D)',
									'linear-gradient(135deg,#10B981,#0B84F3)',
									'linear-gradient(135deg,#7C5CFF,#A78BFA)',
								][i],
							}}
						/>
						<div
							style={{
								fontFamily: display,
								fontWeight: 700,
								fontSize: 38,
								color: colors.ink,
								whiteSpace: 'nowrap',
							}}
						>
							{r.text}
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const Tradeoff: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 188.
	const wobble = interpolate(frame, [17, 127], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const settle = interpolate(frame, [127, 147], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const knob =
		0.5 +
		(1 - settle) *
			0.42 *
			Math.sin(wobble * Math.PI * 4) *
			Math.min(1, frame / 20);
	const both = rise(frame, 130, 14);
	return (
		<Panel style={{gap: 40}}>
			<Pop from="up" delay={2}>
				<div
					style={{
						width: 800,
						borderRadius: 34,
						backgroundColor: '#14111F',
						border: '1px solid rgba(255,255,255,0.08)',
						padding: '34px 38px 40px',
						boxSizing: 'border-box',
						boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							marginBottom: 26,
						}}
					>
						<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
							<WandIcon size={38} color={accents.sneakPeek} />
							<div
								style={{
									fontFamily: display,
									fontWeight: 700,
									fontSize: 36,
									color: colors.paper,
								}}
							>
								Easy to use
							</div>
						</div>
						<div
							style={{
								fontFamily: display,
								fontWeight: 700,
								fontSize: 36,
								color: colors.paper,
							}}
						>
							{'</>'} Dynamic code
						</div>
					</div>
					<div
						style={{
							height: 18,
							borderRadius: 9,
							background: `linear-gradient(90deg, ${accents.sneakPeek}, ${colors.blue})`,
							position: 'relative',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: -17,
								left: `calc(${knob * 100}% - 26px)`,
								width: 52,
								height: 52,
								borderRadius: 26,
								backgroundColor: colors.paper,
								boxShadow: `0 0 0 ${10 * both}px rgba(167,139,250,0.35), 0 8px 20px rgba(0,0,0,0.4)`,
							}}
						/>
					</div>
					<div
						style={{
							marginTop: 34,
							textAlign: 'center',
							fontFamily: display,
							fontWeight: 700,
							fontSize: 40,
							color: both > 0.5 ? accents.sneakPeek : '#8A8F98',
						}}
					>
						{both > 0.5 ? 'Without compromising either' : 'How do we get both?'}
					</div>
				</div>
			</Pop>
			<Pop from="up" delay={150}>
				<Window title="MyVideo.tsx" width={800} fontSize={29}>
					<CodeLines
						start={156}
						speed={2.4}
						lines={[
							[
								['const', syntax.keyword],
								[' frame = ', syntax.plain],
								['useCurrentFrame', syntax.fn],
								['();', syntax.punct],
							],
							[
								['const', syntax.keyword],
								[' scale = ', syntax.plain],
								['spring', syntax.fn],
								['({frame, fps});', syntax.punct],
							],
							[
								['return', syntax.keyword],
								[' <', syntax.punct],
								['Title', syntax.tag],
								[' style', syntax.attr],
								['={{scale}} />', syntax.punct],
							],
						]}
					/>
				</Window>
			</Pop>
			<Pop from="up" delay={226}>
				<Label color="#B9B2D9">Everything is expressed as code</Label>
			</Pop>
		</Panel>
	);
};

const VisualModeTitle: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: 1500,
			top: 150,
			width: 380,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: 18,
		}}
	>
		<Pop from="up">
			<Label color={accents.sneakPeek}>Remotion Studio</Label>
		</Pop>
		<Pop from="up" delay={4}>
			<div
				style={{
					fontFamily: display,
					fontWeight: 700,
					fontSize: 76,
					lineHeight: 0.95,
					letterSpacing: '-0.04em',
					color: colors.paper,
					textAlign: 'center',
				}}
			>
				Visual
				<br />
				mode
			</div>
		</Pop>
		<Stamp
			color={accents.sneakPeek}
			delay={16}
			rotate={-6}
			fontSize={34}
			style={{backgroundColor: 'rgba(20,10,40,0.9)'}}
		>
			Prototype
		</Stamp>
	</div>
);

export const SneakPeekScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.sneakPeek} dark />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Sneak peek"
						durationInFrames={79}
						premountFor={30}
					>
						<Punch zoom={1.06}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats9.mp4'
								}
								trimBefore={51}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Easier to use"
						durationInFrames={405}
						premountFor={30}
					>
						<Punch zoom={1.18}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats9.mp4'
								}
								trimBefore={147}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Visual mode"
						durationInFrames={361}
						premountFor={30}
					>
						<Punch zoom={1.04}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats10.mp4'
								}
								trimBefore={51}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Regular React code"
						durationInFrames={67}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats10.mp4'
								}
								trimBefore={423}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Spotlight" durationInFrames={184}>
				<Spotlight />
			</Sequence>
			<Sequence name="Letterbox" durationInFrames={190}>
				<Letterbox />
			</Sequence>
			<Sequence name="Sneak peek sticker" from={26} durationInFrames={58}>
				<ChapterSticker
					index={<EyeIcon size={64} color={colors.paper} strokeWidth={2.4} />}
					title="Sneak peek"
					overline="What's next"
					accent={accents.soundEffects}
				/>
			</Sequence>
			<Sequence name="Requests" from={79} durationInFrames={104}>
				<Requests />
			</Sequence>
			<Sequence name="Tradeoff" from={188} durationInFrames={300}>
				<Tradeoff />
			</Sequence>
			<Sequence name="Studio mock" from={520} durationInFrames={392}>
				<div style={{position: 'absolute', left: 60, top: 70}}>
					<Pop from="up" exitDuration={1}>
						<StudioMock />
					</Pop>
				</div>
			</Sequence>
			<Sequence name="Visual mode title" from={540} durationInFrames={372}>
				<VisualModeTitle />
			</Sequence>
			<Sequence name="React code chip" from={858} durationInFrames={54}>
				<div
					style={{
						position: 'absolute',
						left: 760,
						top: 600,
						translate: '-50% 0',
					}}
				>
					<Pop from="up">
						<Chip background={colors.blue} color={colors.paper} fontSize={40}>
							{'</>'} Regular React code
						</Chip>
					</Pop>
				</div>
			</Sequence>

			<PunchyCaptions
				durationInFrames={484}
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={['sneak', 'peek', 'easier', 'code.']}
				captions={[
					// @captions whats9
					{
						text: 'And',
						startMs: 149,
						endMs: 402,
						timestampMs: 276,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 402,
						endMs: 587,
						timestampMs: 495,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 587,
						endMs: 756,
						timestampMs: 672,
						confidence: null,
					},
					{
						text: ' little',
						startMs: 756,
						endMs: 1009,
						timestampMs: 883,
						confidence: null,
					},
					{
						text: ' sneak',
						startMs: 1009,
						endMs: 1211,
						timestampMs: 1110,
						confidence: null,
					},
					{
						text: ' peek',
						startMs: 1211,
						endMs: 1447,
						timestampMs: 1329,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 1447,
						endMs: 1650,
						timestampMs: 1549,
						confidence: null,
					},
					{
						text: " what's",
						startMs: 1650,
						endMs: 1852,
						timestampMs: 1751,
						confidence: null,
					},
					{
						text: ' next.',
						startMs: 2004,
						endMs: 2459,
						timestampMs: 2232,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 2705,
						endMs: 2886,
						timestampMs: 2796,
						confidence: null,
					},
					{
						text: ' hear',
						startMs: 2886,
						endMs: 3106,
						timestampMs: 2996,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 3106,
						endMs: 3267,
						timestampMs: 3187,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 3267,
						endMs: 3487,
						timestampMs: 3377,
						confidence: null,
					},
					{
						text: ' want',
						startMs: 3487,
						endMs: 3748,
						timestampMs: 3618,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 3748,
						endMs: 4089,
						timestampMs: 3919,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 4089,
						endMs: 4389,
						timestampMs: 4239,
						confidence: null,
					},
					{
						text: ' become',
						startMs: 4389,
						endMs: 4851,
						timestampMs: 4620,
						confidence: null,
					},
					{
						text: ' easier',
						startMs: 4851,
						endMs: 5131,
						timestampMs: 4991,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 5131,
						endMs: 5452,
						timestampMs: 5292,
						confidence: null,
					},
					{
						text: ' use.',
						startMs: 5703,
						endMs: 5782,
						timestampMs: 5743,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' And',
						startMs: 6033,
						endMs: 6159,
						timestampMs: 6096,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 6159,
						endMs: 6332,
						timestampMs: 6246,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 6332,
						endMs: 6426,
						timestampMs: 6379,
						confidence: null,
					},
					{
						text: ' long',
						startMs: 6426,
						endMs: 6662,
						timestampMs: 6544,
						confidence: null,
					},
					{
						text: ' time',
						startMs: 6662,
						endMs: 6835,
						timestampMs: 6749,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 6835,
						endMs: 6945,
						timestampMs: 6890,
						confidence: null,
					},
					{
						text: ' did',
						startMs: 6945,
						endMs: 7149,
						timestampMs: 7047,
						confidence: null,
					},
					{
						text: ' not',
						startMs: 7149,
						endMs: 7511,
						timestampMs: 7330,
						confidence: null,
					},
					{
						text: ' know',
						startMs: 7511,
						endMs: 7872,
						timestampMs: 7692,
						confidence: null,
					},
					{
						text: ' how',
						startMs: 8224,
						endMs: 8359,
						timestampMs: 8292,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 8359,
						endMs: 8522,
						timestampMs: 8441,
						confidence: null,
					},
					{
						text: ' achieve',
						startMs: 8522,
						endMs: 8821,
						timestampMs: 8672,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 8821,
						endMs: 9133,
						timestampMs: 8977,
						confidence: null,
					},
					{
						text: ' without',
						startMs: 9429,
						endMs: 10485,
						timestampMs: 9957,
						confidence: null,
					},
					{
						text: ' compromising',
						startMs: 10485,
						endMs: 10716,
						timestampMs: 10601,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 11051,
						endMs: 11297,
						timestampMs: 11174,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 11297,
						endMs: 11708,
						timestampMs: 11503,
						confidence: null,
					},
					{
						text: ' dynamicness',
						startMs: 11708,
						endMs: 12464,
						timestampMs: 12086,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 12829,
						endMs: 12945,
						timestampMs: 12887,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 12945,
						endMs: 13125,
						timestampMs: 13035,
						confidence: null,
					},
					{
						text: ' get',
						startMs: 13125,
						endMs: 13395,
						timestampMs: 13260,
						confidence: null,
					},
					{
						text: ' when',
						startMs: 13682,
						endMs: 13948,
						timestampMs: 13815,
						confidence: null,
					},
					{
						text: ' everything',
						startMs: 13948,
						endMs: 14159,
						timestampMs: 14054,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 14159,
						endMs: 14447,
						timestampMs: 14303,
						confidence: null,
					},
					{
						text: ' expressed',
						startMs: 14447,
						endMs: 14625,
						timestampMs: 14536,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 14625,
						endMs: 14747,
						timestampMs: 14686,
						confidence: null,
					},
					{
						text: ' code.',
						startMs: 14802,
						endMs: 15684,
						timestampMs: 15243,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
			<PunchyCaptions
				from={484}
				durationInFrames={428}
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={['visual', 'mode', 'interactively', 'react']}
				captions={[
					// @captions whats10
					{
						text: 'We',
						startMs: 141,
						endMs: 365,
						timestampMs: 253,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 365,
						endMs: 533,
						timestampMs: 449,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 533,
						endMs: 999,
						timestampMs: 766,
						confidence: null,
					},
					{
						text: ' prototyping',
						startMs: 999,
						endMs: 1429,
						timestampMs: 1214,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 1429,
						endMs: 1802,
						timestampMs: 1616,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 1802,
						endMs: 2306,
						timestampMs: 2054,
						confidence: null,
					},
					{
						text: ' visual',
						startMs: 2306,
						endMs: 2866,
						timestampMs: 2586,
						confidence: null,
					},
					{
						text: ' mode',
						startMs: 2866,
						endMs: 3090,
						timestampMs: 2978,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 3090,
						endMs: 3239,
						timestampMs: 3165,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 3239,
						endMs: 3407,
						timestampMs: 3323,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 3407,
						endMs: 4060,
						timestampMs: 3734,
						confidence: null,
					},
					{
						text: ' Studio',
						startMs: 4060,
						endMs: 4714,
						timestampMs: 4387,
						confidence: null,
					},
					{
						text: ' which',
						startMs: 5075,
						endMs: 5236,
						timestampMs: 5156,
						confidence: null,
					},
					{
						text: ' will',
						startMs: 5236,
						endMs: 5413,
						timestampMs: 5325,
						confidence: null,
					},
					{
						text: ' allow',
						startMs: 5413,
						endMs: 5590,
						timestampMs: 5502,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 5590,
						endMs: 5735,
						timestampMs: 5663,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 5735,
						endMs: 5815,
						timestampMs: 5775,
						confidence: null,
					},
					{
						text: ' interactively',
						startMs: 6233,
						endMs: 6957,
						timestampMs: 6595,
						confidence: null,
					},
					{
						text: ' change',
						startMs: 6957,
						endMs: 7584,
						timestampMs: 7271,
						confidence: null,
					},
					{
						text: ' many',
						startMs: 7864,
						endMs: 8168,
						timestampMs: 8016,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 8168,
						endMs: 8472,
						timestampMs: 8320,
						confidence: null,
					},
					{
						text: ' about',
						startMs: 8472,
						endMs: 8718,
						timestampMs: 8595,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 8718,
						endMs: 9098,
						timestampMs: 8908,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 9098,
						endMs: 9648,
						timestampMs: 9373,
						confidence: null,
					},
					{
						text: ' while',
						startMs: 10036,
						endMs: 10287,
						timestampMs: 10162,
						confidence: null,
					},
					{
						text: ' still',
						startMs: 10287,
						endMs: 10749,
						timestampMs: 10518,
						confidence: null,
					},
					{
						text: ' writing',
						startMs: 10749,
						endMs: 11253,
						timestampMs: 11001,
						confidence: null,
					},
					{
						text: ' everything',
						startMs: 11253,
						endMs: 11925,
						timestampMs: 11589,
						confidence: null,
					},
					{
						text: ' back',
						startMs: 11925,
						endMs: 11985,
						timestampMs: 11955,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 12110,
						endMs: 12617,
						timestampMs: 12364,
						confidence: null,
					},
					{
						text: ' regular',
						startMs: 12617,
						endMs: 13189,
						timestampMs: 12903,
						confidence: null,
					},
					{
						text: ' React',
						startMs: 13189,
						endMs: 13630,
						timestampMs: 13410,
						confidence: null,
					},
					{
						text: ' code.',
						startMs: 13630,
						endMs: 13718,
						timestampMs: 13674,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Audio
				name="Shutter"
				src="https://remotion.media/shutter-old.wav"
				from={28}
				volume={0.3}
			/>
			<Audio
				name="Request 1"
				src="https://remotion.media/snapchat-notification.wav"
				from={92}
				volume={0.12}
			/>
			<Audio
				name="Request 2"
				src="https://remotion.media/snapchat-notification.wav"
				from={116}
				volume={0.1}
			/>
			<Audio
				name="Request 3"
				src="https://remotion.media/snapchat-notification.wav"
				from={146}
				volume={0.1}
			/>
			<Audio
				name="Split whoosh"
				src="https://remotion.media/whoosh.wav"
				from={182}
				volume={0.22}
			/>
			<Audio
				name="Reveal whoosh"
				src="https://remotion.media/whoosh.wav"
				from={516}
				volume={0.36}
			/>
			<Audio
				name="Visual mode toggle"
				src="https://remotion.media/switch.wav"
				from={554}
				volume={0.3}
			/>
			<Audio
				name="Select click"
				src="https://remotion.media/mouse-click.wav"
				from={618}
				volume={0.32}
			/>
			<Audio
				name="Color click"
				src="https://remotion.media/mouse-click.wav"
				from={798}
				volume={0.3}
			/>
			<Audio
				name="Saved ding"
				src="https://remotion.media/ding.wav"
				from={820}
				volume={0.22}
			/>
		</AbsoluteFill>
	);
};
