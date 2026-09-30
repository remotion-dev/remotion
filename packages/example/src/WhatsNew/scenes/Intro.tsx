import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {easeInOut, pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {
	BoltIcon,
	BrowserIcon,
	EyeIcon,
	FileIcon,
	RobotIcon,
	SparkIcon,
	SpeakerIcon,
	TriangleIcon,
} from '../components/icons';
import {RemotionLogo} from '../components/Logo';
import {
	getCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {display} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [{at: 0, layout: 'full'}];

const TitleCard: React.FC = () => {
	const frame = useCurrentFrame();
	const p = pop(frame, 0, 11);
	const logoSpin = interpolate(frame, [72, 92], [0, 360], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const sub = rise(frame, 60, 16);
	return (
		<div
			style={{
				position: 'absolute',
				left: 70,
				top: 300,
				transformOrigin: '0% 50%',
				opacity: Math.min(1, p * 2),
				scale: 0.45 + 0.55 * p,
				rotate: `${-3 - 7 * (1 - p)}deg`,
				display: 'flex',
				alignItems: 'center',
				gap: 28,
				padding: '28px 46px 32px 30px',
				backgroundColor: colors.paper,
				borderRadius: 40,
				boxShadow: '0 30px 80px rgba(10,16,32,0.35)',
			}}
		>
			<RemotionLogo size={112} style={{rotate: `${logoSpin}deg`}} />
			<div>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 88,
						lineHeight: 0.95,
						letterSpacing: '-0.035em',
						color: colors.ink,
					}}
				>
					What&apos;s new
				</div>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 52,
						letterSpacing: '-0.02em',
						color: colors.blue,
						marginTop: 8,
						opacity: sub,
						translate: `${(1 - sub) * -24}px 0px`,
					}}
				>
					in Remotion
				</div>
			</div>
		</div>
	);
};

type Topic = {
	readonly title: string;
	readonly accent: string;
	readonly text: string;
	readonly icon: React.ReactNode;
};

const topics: Topic[] = [
	{
		title: 'Light leaks',
		accent: accents.lightLeaks,
		text: colors.paper,
		icon: <SparkIcon size={64} color={colors.paper} />,
	},
	{
		title: 'Sound effects',
		accent: accents.soundEffects,
		text: colors.paper,
		icon: <SpeakerIcon size={64} color={colors.paper} />,
	},
	{
		title: 'Render on Vercel',
		accent: colors.paper,
		text: colors.ink,
		icon: <TriangleIcon size={58} color={colors.ink} />,
	},
	{
		title: 'New skills',
		accent: accents.skills,
		text: colors.paper,
		icon: <FileIcon size={64} color={colors.paper} />,
	},
	{
		title: 'Client-side rendering',
		accent: accents.clientSide,
		text: colors.paper,
		icon: <BrowserIcon size={64} color={colors.paper} />,
	},
	{
		title: 'Better with agents',
		accent: accents.agents,
		text: colors.paper,
		icon: <RobotIcon size={64} color={colors.paper} />,
	},
	{
		title: 'Faster bundling',
		accent: accents.bundling,
		text: colors.ink,
		icon: <BoltIcon size={64} color={colors.ink} />,
	},
	{
		title: 'Sneak peek',
		accent: '#2A1F4D',
		text: colors.paper,
		icon: <EyeIcon size={64} color={accents.sneakPeek} />,
	},
];

const TILE_W = 390;
const TILE_H = 250;
const GAP = 28;
const GRID_LEFT = (1920 - (TILE_W * 4 + GAP * 3)) / 2;
const GRID_TOP = 356;

// Eight topics slam in on eighth notes, then the board zooms into the first.
const TopicBoard: React.FC = () => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [70, 96], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.76, 0, 0.24, 1),
	});
	const firstCenterX = GRID_LEFT + TILE_W / 2;
	const firstCenterY = GRID_TOP + TILE_H / 2;
	const header = rise(frame, 0, 12);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.sneakPeek} dark />
			<AbsoluteFill
				style={{
					transformOrigin: `${firstCenterX}px ${firstCenterY}px`,
					scale: 1 + zoom * 5.2,
					translate: `${(960 - firstCenterX) * zoom}px ${(540 - firstCenterY) * zoom}px`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 150,
						width: 1920,
						textAlign: 'center',
						fontFamily: display,
						fontWeight: 700,
						fontSize: 96,
						letterSpacing: '-0.035em',
						color: colors.paper,
						opacity: header * (1 - zoom),
						translate: `0px ${(1 - header) * 30}px`,
					}}
				>
					What&apos;s new in <span style={{color: colors.blue}}>Remotion</span>
				</div>
				{topics.map((topic, i) => {
					const col = i % 4;
					const row = Math.floor(i / 4);
					const p = pop(frame, 4 + i * 8, 10);
					return (
						<div
							key={topic.title}
							style={{
								position: 'absolute',
								left: GRID_LEFT + col * (TILE_W + GAP),
								top: GRID_TOP + row * (TILE_H + GAP),
								width: TILE_W,
								height: TILE_H,
								borderRadius: 32,
								backgroundColor: topic.accent,
								color: topic.text,
								padding: '30px 32px',
								boxSizing: 'border-box',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								opacity: Math.min(1, p * 2) * (i === 0 ? 1 : 1 - zoom),
								scale: 0.5 + 0.5 * p,
								rotate: `${(1 - p) * (i % 2 === 0 ? -8 : 8)}deg`,
								boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
								}}
							>
								{topic.icon}
								<div
									style={{
										fontFamily: display,
										fontWeight: 700,
										fontSize: 34,
										opacity: 0.7,
									}}
								>
									{i === 7 ? '👀' : `0${i + 1}`}
								</div>
							</div>
							<div
								style={{
									fontFamily: display,
									fontWeight: 700,
									fontSize: 44,
									lineHeight: 1.02,
									letterSpacing: '-0.02em',
								}}
							>
								{topic.title}
							</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const IntroScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Opening line"
						durationInFrames={112}
						premountFor={30}
					>
						<Punch zoom={1.1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats1.mp4'
								}
								trimBefore={35}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Title card" from={2} durationInFrames={110}>
				<TitleCard />
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				durationInFrames={112}
				keywords={['improved', 'remotion']}
				captions={[
					// @captions whats1
					{
						text: 'Here',
						startMs: 158,
						endMs: 340,
						timestampMs: 249,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 340,
						endMs: 523,
						timestampMs: 432,
						confidence: null,
					},
					{
						text: ' some',
						startMs: 523,
						endMs: 650,
						timestampMs: 587,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 650,
						endMs: 778,
						timestampMs: 714,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 778,
						endMs: 960,
						timestampMs: 869,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 960,
						endMs: 1142,
						timestampMs: 1051,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 1142,
						endMs: 1288,
						timestampMs: 1215,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 1288,
						endMs: 1707,
						timestampMs: 1498,
						confidence: null,
					},
					{
						text: ' recently',
						startMs: 1707,
						endMs: 2181,
						timestampMs: 1944,
						confidence: null,
					},
					{
						text: ' improved',
						startMs: 2181,
						endMs: 2418,
						timestampMs: 2300,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 2418,
						endMs: 2637,
						timestampMs: 2528,
						confidence: null,
					},
					{
						text: ' Remotion.',
						startMs: 2637,
						endMs: 3402,
						timestampMs: 3020,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Sequence name="Topic board" from={112} durationInFrames={96}>
				<TopicBoard />
			</Sequence>

			<Audio
				name="Title whoosh"
				src="https://remotion.media/whoosh.wav"
				from={0}
				volume={0.3}
			/>
			<Audio
				name="Tile 1"
				src="https://remotion.media/switch.wav"
				from={116}
				volume={0.2}
			/>
			<Audio
				name="Tile 2"
				src="https://remotion.media/switch.wav"
				from={124}
				volume={0.2}
			/>
			<Audio
				name="Tile 3"
				src="https://remotion.media/switch.wav"
				from={132}
				volume={0.2}
			/>
			<Audio
				name="Tile 4"
				src="https://remotion.media/switch.wav"
				from={140}
				volume={0.2}
			/>
			<Audio
				name="Tile 5"
				src="https://remotion.media/switch.wav"
				from={148}
				volume={0.2}
			/>
			<Audio
				name="Tile 6"
				src="https://remotion.media/switch.wav"
				from={156}
				volume={0.2}
			/>
			<Audio
				name="Tile 7"
				src="https://remotion.media/switch.wav"
				from={164}
				volume={0.2}
			/>
			<Audio
				name="Tile 8"
				src="https://remotion.media/switch.wav"
				from={172}
				volume={0.2}
			/>
			<Audio
				name="Zoom whoosh"
				src="https://remotion.media/whoosh.wav"
				from={180}
				volume={0.34}
			/>
		</AbsoluteFill>
	);
};
