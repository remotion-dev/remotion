import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	Track,
	Interactive,
	Easing,
	interpolate,
	Series,
	useCurrentFrame,
} from 'remotion';
import {pop, rise} from '../anim';
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
import {
	ShotFraming,
	StageLayout,
	useCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {display} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [{at: 0, layout: 'full'}];

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
const TopicBoardInner: React.FC = () => {
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
		<>
			<Backdrop accent={accents.sneakPeek} dark />
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
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
			</div>
		</>
	);
};

const IntroSourceInner = () => {
	const captions = useCaptionPlacement(layout);
	return (
		<>
			<Stage
				style={{overflow: 'visible', flexDirection: 'column'}}
				keyframes={layout}
				showInTimeline={false}
			>
				<Punch>
					<Video
						src={
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats1.mp4'
						}
					/>
				</Punch>
			</Stage>
			<PunchyCaptions
				combineTokensWithinMilliseconds={10000}
				width={captions.width}
				fontSize={captions.fontSize}
				style={{...captions.style, zIndex: 1}}
				keywords={['improved', 'remotion']}
				captions={[
					// @captions whats1
					{
						text: 'Here',
						startMs: 1324.666666,
						endMs: 1506.666666,
						timestampMs: 1415.666666,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 1506.666666,
						endMs: 1689.666666,
						timestampMs: 1598.666666,
						confidence: null,
					},
					{
						text: ' some',
						startMs: 1689.666666,
						endMs: 1816.666666,
						timestampMs: 1753.666666,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 1816.666666,
						endMs: 1944.666666,
						timestampMs: 1880.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 1944.666666,
						endMs: 2126.666666,
						timestampMs: 2035.666666,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 2126.666666,
						endMs: 2308.666666,
						timestampMs: 2217.666666,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 2308.666666,
						endMs: 2454.666666,
						timestampMs: 2381.666666,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 2454.666666,
						endMs: 2873.666666,
						timestampMs: 2664.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' recently',
						startMs: 2873.666666,
						endMs: 3347.666666,
						timestampMs: 3110.666666,
						confidence: null,
					},
					{
						text: ' improved',
						startMs: 3347.666666,
						endMs: 3584.666666,
						timestampMs: 3466.666666,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 3584.666666,
						endMs: 3803.666666,
						timestampMs: 3694.666666,
						confidence: null,
					},
					{
						text: ' Remotion.',
						startMs: 3803.666666,
						endMs: 4568.666666,
						timestampMs: 4186.666666,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const IntroSource = Interactive.create({
	Component: IntroSourceInner,
	layout: 'absolute-fill',
});

const IntroSceneInner: React.FC = () => {
	return (
		<>
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Opening line"
						durationInFrames={208}
						premountFor={30}
					>
						<ShotFraming zoom={1.1}>
							<IntroSource trimBefore={35} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

			<TopicBoard
				name="Topic board"
				from={112}
				durationInFrames={96}
				style={{overflow: 'visible', flexDirection: 'column'}}
			/>

			<Track name="Sound effects">
				<Audio
					durationInFrames={5}
					name="Title whoosh"
					src="https://remotion.media/whoosh.wav"
					from={0}
					volume={0.3}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 1"
					src="https://remotion.media/switch.wav"
					from={116}
					volume={0.2}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 3"
					src="https://remotion.media/switch.wav"
					from={132}
					volume={0.2}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 5"
					src="https://remotion.media/switch.wav"
					from={148}
					volume={0.2}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 7"
					src="https://remotion.media/switch.wav"
					from={164}
					volume={0.2}
				/>
				<Audio
					durationInFrames={5}
					name="Zoom whoosh"
					src="https://remotion.media/whoosh.wav"
					from={180}
					volume={0.34}
				/>
			</Track>
			<Track name="Overlapping sound effects">
				<Audio
					durationInFrames={10}
					name="Tile 2"
					src="https://remotion.media/switch.wav"
					from={124}
					volume={0.2}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 4"
					src="https://remotion.media/switch.wav"
					from={140}
					volume={0.2}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 6"
					src="https://remotion.media/switch.wav"
					from={156}
					volume={0.2}
				/>
				<Audio
					durationInFrames={10}
					name="Tile 8"
					src="https://remotion.media/switch.wav"
					from={172}
					volume={0.2}
				/>
			</Track>
		</>
	);
};

const TopicBoard = Interactive.create({
	Component: TopicBoardInner,
	layout: 'absolute-fill',
});
export const IntroScene = Interactive.create({
	Component: IntroSceneInner,
	layout: 'absolute-fill',
});
