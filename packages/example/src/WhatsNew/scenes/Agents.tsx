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
import {Burst} from '../components/fx';
import {ChatIcon, CheckIcon} from '../components/icons';
import {
	getCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
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
import {display, mono} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 94, layout: 'split'},
	{at: 904, layout: 'full'},
];

const VibeCoding: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 98.
	const rough = rise(frame, 172, 10);
	const fixed = rise(frame, 262, 12);
	const shake = frame > 172 && frame < 200 ? Math.sin(frame * 2.2) * 6 : 0;
	return (
		<Panel style={{gap: 28}}>
			<Pop from="up" delay={2}>
				<Window title="agent — my-video" width={820} fontSize={28}>
					<CodeLines
						start={10}
						speed={1.8}
						cursor={false}
						lines={[
							[
								['> ', syntax.prompt],
								['Make a launch video with Remotion', syntax.plain],
							],
							[],
							[
								['⏺ ', accents.agents],
								['Scaffolding the project…', syntax.comment],
							],
							[
								['⏺ ', accents.agents],
								['Writing src/Launch.tsx', syntax.comment],
							],
							[
								['⏺ ', accents.agents],
								['Starting the Studio…', syntax.comment],
							],
						]}
					/>
				</Window>
			</Pop>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 18,
					opacity: rough,
					translate: `${shake}px ${(1 - rough) * 30}px`,
				}}
			>
				<Chip
					background={fixed > 0.5 ? colors.success : colors.danger}
					color={colors.paper}
					icon={
						fixed > 0.5 ? (
							<CheckIcon size={34} color={colors.paper} strokeWidth={3} />
						) : (
							<span style={{fontSize: 34}}>⚠</span>
						)
					}
				>
					{fixed > 0.5 ? 'Smoothing out rough edges' : 'Rough edges'}
				</Chip>
			</div>
		</Panel>
	);
};

const AlreadyRunning: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 382.
	const livePulse = 0.6 + 0.4 * Math.sin(frame / 5);
	return (
		<Panel style={{gap: 26}}>
			<Pop from="up" delay={26}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						padding: '18px 30px',
						borderRadius: 999,
						backgroundColor: colors.paper,
						boxShadow: '0 14px 34px rgba(10,16,32,0.14)',
						fontFamily: display,
						fontWeight: 700,
						fontSize: 34,
						color: colors.ink,
					}}
				>
					<div
						style={{
							width: 20,
							height: 20,
							borderRadius: 10,
							backgroundColor: colors.success,
							boxShadow: `0 0 0 ${8 * livePulse}px rgba(18,183,106,0.25)`,
						}}
					/>
					Remotion Studio · localhost:3000
				</div>
			</Pop>
			<Pop from="up" delay={82}>
				<Window title="agent — my-video" width={820} fontSize={28}>
					<CodeLines
						start={92}
						speed={1.3}
						lines={[
							[
								['$ ', syntax.prompt],
								['npx remotion studio', syntax.plain],
							],
						]}
					/>
					{frame >= 140 ? (
						<div style={{color: syntax.prompt, marginTop: 6}}>
							Already running at http://localhost:3000
						</div>
					) : null}
				</Window>
			</Pop>
			<Pop delay={178} from="up">
				<Chip
					background={colors.ink}
					color={colors.paper}
					icon={<CheckIcon size={34} color={colors.success} strokeWidth={3} />}
				>
					No duplicate Studio instances
				</Chip>
			</Pop>
		</Panel>
	);
};

const LockfileError: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 592; "gone" is spoken at local 133.
	const gone = interpolate(frame, [130, 146], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const strike = rise(frame, 118, 12);
	const files = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
	return (
		<Panel>
			<Pop from="up" delay={6}>
				<div
					style={{
						width: 800,
						borderRadius: 28,
						backgroundColor: '#2A0E0E',
						border: `3px solid ${colors.danger}`,
						padding: '30px 36px',
						boxSizing: 'border-box',
						boxShadow: '0 30px 70px rgba(240,68,56,0.3)',
						fontFamily: mono,
						fontSize: 30,
						color: '#FFD7D4',
						position: 'relative',
						opacity: 1 - gone,
						scale: 1 - gone * 0.25,
						rotate: `${gone * -6}deg`,
						filter: `blur(${gone * 10}px)`,
					}}
				>
					<div style={{color: '#FF8A80', fontWeight: 600, marginBottom: 14}}>
						✕ Error: Multiple lockfiles detected
					</div>
					{files.map((f, i) => (
						<div
							key={f}
							style={{
								opacity: rise(frame, 30 + i * 9, 8),
							}}
						>
							{'  '}- {f}
						</div>
					))}
					<div
						style={{
							position: 'absolute',
							left: 30,
							right: 30,
							top: '50%',
							height: 10,
							borderRadius: 5,
							backgroundColor: colors.paper,
							transformOrigin: '0% 50%',
							scale: `${strike} 1`,
							rotate: '-8deg',
							boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
						}}
					/>
				</div>
			</Pop>
			<div style={{position: 'absolute', top: 560}}>
				<Stamp color={colors.success} delay={134} rotate={-6} fontSize={80}>
					Gone
				</Stamp>
			</div>
		</Panel>
	);
};

const ZodDiamond: React.FC<{readonly size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<defs>
			<linearGradient id="zod-gradient" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#3E67B1" />
				<stop offset="100%" stopColor="#274D82" />
			</linearGradient>
		</defs>
		<path d="M22 14h56l18 22-46 52L4 36z" fill="url(#zod-gradient)" />
		<path d="M22 14h56l18 22H4z" fill="#FFFFFF" opacity={0.18} />
	</svg>
);

const Zod4: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 750.
	const four = pop(frame, 124, 9);
	return (
		<Panel style={{gap: 26}}>
			<Pop from="up" delay={4}>
				<div
					style={{
						width: 780,
						borderRadius: 36,
						backgroundColor: colors.paper,
						boxShadow: '0 26px 60px rgba(10,16,32,0.18)',
						padding: '40px 44px',
						boxSizing: 'border-box',
						display: 'flex',
						alignItems: 'center',
						gap: 38,
					}}
				>
					<div style={{position: 'relative'}}>
						<ZodDiamond size={190} />
						<div
							style={{
								position: 'absolute',
								right: -24,
								bottom: -14,
								width: 104,
								height: 104,
								borderRadius: 52,
								backgroundColor: colors.blue,
								color: colors.paper,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: display,
								fontWeight: 700,
								fontSize: 70,
								boxShadow: '0 0 0 8px #fff',
								scale: four,
							}}
						>
							4
						</div>
					</div>
					<div>
						<Label>Now supported</Label>
						<div
							style={{
								fontFamily: display,
								fontWeight: 700,
								fontSize: 82,
								letterSpacing: '-0.03em',
								color: colors.ink,
							}}
						>
							Zod 4
						</div>
					</div>
				</div>
			</Pop>
			<Pop from="up" delay={30}>
				<Window title="package.json" width={780} fontSize={30}>
					<CodeLines
						start={36}
						speed={1.4}
						cursor={false}
						lines={[
							[
								['"dependencies"', syntax.attr],
								[': {', syntax.punct],
							],
							[
								['  "zod"', syntax.attr],
								[': ', syntax.punct],
								['"^4.0.0"', syntax.string],
							],
							[['}', syntax.punct]],
						]}
					/>
				</Window>
			</Pop>
			<div style={{position: 'absolute', top: 40, right: 30}}>
				<Stamp color={accents.agents} delay={76} rotate={10} fontSize={64}>
					Finally
				</Stamp>
			</div>
			{frame >= 124 ? (
				<Sequence from={124} layout="none">
					<Burst
						x={250}
						y={260}
						colors={[
							colors.blue,
							accents.agents,
							accents.bundling,
							colors.success,
						]}
					/>
				</Sequence>
			) : null}
		</Panel>
	);
};

const LetUsKnow: React.FC = () => (
	<div style={{position: 'absolute', left: 76, top: 300}}>
		<Pop rotate={-4}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 26,
					padding: '30px 44px 32px 30px',
					borderRadius: 38,
					backgroundColor: colors.paper,
					boxShadow: '0 28px 70px rgba(10,16,32,0.34)',
				}}
			>
				<div
					style={{
						width: 104,
						height: 104,
						borderRadius: 28,
						backgroundColor: accents.agents,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<ChatIcon size={60} color={colors.paper} />
				</div>
				<div style={{maxWidth: 470}}>
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 60,
							lineHeight: 1,
							letterSpacing: '-0.03em',
							color: colors.ink,
							marginBottom: 8,
						}}
					>
						What should we improve?
					</div>
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 40,
							color: accents.agents,
						}}
					>
						Let us know!
					</div>
				</div>
			</div>
		</Pop>
	</div>
);

export const AgentsScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.agents} />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Better with agents"
						durationInFrames={94}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
								}
								trimBefore={122}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Rough edges"
						durationInFrames={288}
						premountFor={30}
					>
						<Punch zoom={1.12}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
								}
								trimBefore={233}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Studio already running"
						durationInFrames={163}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
								}
								trimBefore={537}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="We prevent that"
						durationInFrames={47}
						premountFor={30}
					>
						<Punch zoom={1.18}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
								}
								trimBefore={711}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Lockfiles and Zod"
						durationInFrames={314}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
								}
								trimBefore={777}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Let us know"
						durationInFrames={70}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
								}
								trimBefore={1111}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Chapter sticker" from={3} durationInFrames={96}>
				<ChapterSticker
					index="06"
					title="Better with agents"
					accent={accents.agents}
				/>
			</Sequence>
			<Sequence name="Vibe coding" from={98} durationInFrames={284}>
				<VibeCoding />
			</Sequence>
			<Sequence name="Already running" from={382} durationInFrames={210}>
				<AlreadyRunning />
			</Sequence>
			<Sequence name="Lockfile error" from={592} durationInFrames={158}>
				<LockfileError />
			</Sequence>
			<Sequence name="Zod 4" from={750} durationInFrames={156}>
				<Zod4 />
			</Sequence>
			<Sequence name="Let us know" from={908} durationInFrames={68}>
				<LetUsKnow />
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={[
					'agents.',
					'claude code',
					'rough',
					'edges',
					'lockfile',
					'gone',
					'zod 4.',
				]}
				captions={[
					// @captions whats7
					{
						text: 'Make',
						startMs: 144,
						endMs: 639,
						timestampMs: 392,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 639,
						endMs: 1323,
						timestampMs: 981,
						confidence: null,
					},
					{
						text: ' work',
						startMs: 1323,
						endMs: 1818,
						timestampMs: 1571,
						confidence: null,
					},
					{
						text: ' better',
						startMs: 1818,
						endMs: 2336,
						timestampMs: 2077,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 2336,
						endMs: 2973,
						timestampMs: 2655,
						confidence: null,
					},
					{
						text: ' agents.',
						startMs: 2973,
						endMs: 3033,
						timestampMs: 3003,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' If',
						startMs: 3223,
						endMs: 3426,
						timestampMs: 3325,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 3426,
						endMs: 3742,
						timestampMs: 3584,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 3742,
						endMs: 4171,
						timestampMs: 3957,
						confidence: null,
					},
					{
						text: ' Claude Code',
						startMs: 4171,
						endMs: 4713,
						timestampMs: 4442,
						confidence: null,
					},
					{
						text: ' or',
						startMs: 4713,
						endMs: 5119,
						timestampMs: 4916,
						confidence: null,
					},
					{
						text: ' similar',
						startMs: 5119,
						endMs: 5638,
						timestampMs: 5379,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 5638,
						endMs: 6089,
						timestampMs: 5864,
						confidence: null,
					},
					{
						text: ' vibe',
						startMs: 6089,
						endMs: 6360,
						timestampMs: 6225,
						confidence: null,
					},
					{
						text: ' code',
						startMs: 6360,
						endMs: 6586,
						timestampMs: 6473,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 6586,
						endMs: 6947,
						timestampMs: 6767,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 6947,
						endMs: 7308,
						timestampMs: 7128,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 7308,
						endMs: 7692,
						timestampMs: 7500,
						confidence: null,
					},
					{
						text: ' Remotion,',
						startMs: 7692,
						endMs: 7752,
						timestampMs: 7722,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' there',
						startMs: 8146,
						endMs: 8399,
						timestampMs: 8273,
						confidence: null,
					},
					{
						text: ' just',
						startMs: 8399,
						endMs: 8718,
						timestampMs: 8559,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 8718,
						endMs: 8920,
						timestampMs: 8819,
						confidence: null,
					},
					{
						text: ' some',
						startMs: 8920,
						endMs: 9156,
						timestampMs: 9038,
						confidence: null,
					},
					{
						text: ' rough',
						startMs: 9156,
						endMs: 9543,
						timestampMs: 9350,
						confidence: null,
					},
					{
						text: ' edges',
						startMs: 9543,
						endMs: 9964,
						timestampMs: 9754,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 10165,
						endMs: 10434,
						timestampMs: 10300,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 10798,
						endMs: 10903,
						timestampMs: 10851,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 10903,
						endMs: 11113,
						timestampMs: 11008,
						confidence: null,
					},
					{
						text: ' trying',
						startMs: 11113,
						endMs: 11429,
						timestampMs: 11271,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 11429,
						endMs: 11760,
						timestampMs: 11595,
						confidence: null,
					},
					{
						text: ' fix',
						startMs: 12038,
						endMs: 12148,
						timestampMs: 12093,
						confidence: null,
					},
					{
						text: ' them.',
						startMs: 12331,
						endMs: 12575,
						timestampMs: 12453,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' For',
						startMs: 12802,
						endMs: 13189,
						timestampMs: 12996,
						confidence: null,
					},
					{
						text: ' example,',
						startMs: 13189,
						endMs: 13249,
						timestampMs: 13219,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' if',
						startMs: 13433,
						endMs: 13575,
						timestampMs: 13504,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 13575,
						endMs: 13759,
						timestampMs: 13667,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 13759,
						endMs: 14247,
						timestampMs: 14003,
						confidence: null,
					},
					{
						text: ' Studio',
						startMs: 14247,
						endMs: 14451,
						timestampMs: 14349,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 14451,
						endMs: 14777,
						timestampMs: 14614,
						confidence: null,
					},
					{
						text: ' already',
						startMs: 14777,
						endMs: 14837,
						timestampMs: 14807,
						confidence: null,
					},
					{
						text: ' running',
						startMs: 15143,
						endMs: 15203,
						timestampMs: 15173,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 15428,
						endMs: 15652,
						timestampMs: 15540,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 15652,
						endMs: 15896,
						timestampMs: 15774,
						confidence: null,
					},
					{
						text: ' AI',
						startMs: 15896,
						endMs: 16181,
						timestampMs: 16039,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 16181,
						endMs: 16446,
						timestampMs: 16314,
						confidence: null,
					},
					{
						text: ' trying',
						startMs: 16446,
						endMs: 16751,
						timestampMs: 16599,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 16751,
						endMs: 17138,
						timestampMs: 16945,
						confidence: null,
					},
					{
						text: ' start',
						startMs: 17138,
						endMs: 17484,
						timestampMs: 17311,
						confidence: null,
					},
					{
						text: ' another',
						startMs: 17484,
						endMs: 17831,
						timestampMs: 17658,
						confidence: null,
					},
					{
						text: ' instance,',
						startMs: 18054,
						endMs: 18114,
						timestampMs: 18084,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' we',
						startMs: 18261,
						endMs: 18459,
						timestampMs: 18360,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 18459,
						endMs: 18757,
						timestampMs: 18608,
						confidence: null,
					},
					{
						text: ' prevent',
						startMs: 18757,
						endMs: 19126,
						timestampMs: 18942,
						confidence: null,
					},
					{
						text: ' that.',
						startMs: 19126,
						endMs: 19579,
						timestampMs: 19353,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' The',
						startMs: 19800,
						endMs: 20262,
						timestampMs: 20031,
						confidence: null,
					},
					{
						text: ' daunting',
						startMs: 20262,
						endMs: 20852,
						timestampMs: 20557,
						confidence: null,
					},
					{
						text: ' multiple',
						startMs: 21171,
						endMs: 21443,
						timestampMs: 21307,
						confidence: null,
					},
					{
						text: ' lockfile',
						startMs: 21443,
						endMs: 22026,
						timestampMs: 21735,
						confidence: null,
					},
					{
						text: ' error',
						startMs: 22026,
						endMs: 22512,
						timestampMs: 22269,
						confidence: null,
					},
					{
						text: ' message',
						startMs: 22512,
						endMs: 22959,
						timestampMs: 22736,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 22959,
						endMs: 23367,
						timestampMs: 23163,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 23367,
						endMs: 23931,
						timestampMs: 23649,
						confidence: null,
					},
					{
						text: ' gone',
						startMs: 24156,
						endMs: 24564,
						timestampMs: 24360,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 25021,
						endMs: 25297,
						timestampMs: 25159,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 25297,
						endMs: 25556,
						timestampMs: 25427,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 25556,
						endMs: 25954,
						timestampMs: 25755,
						confidence: null,
					},
					{
						text: ' removed',
						startMs: 25954,
						endMs: 26092,
						timestampMs: 26023,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 26092,
						endMs: 26195,
						timestampMs: 26144,
						confidence: null,
					},
					{
						text: ' lot',
						startMs: 26195,
						endMs: 26264,
						timestampMs: 26230,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 26299,
						endMs: 26359,
						timestampMs: 26329,
						confidence: null,
					},
					{
						text: ' friction',
						startMs: 26627,
						endMs: 26869,
						timestampMs: 26748,
						confidence: null,
					},
					{
						text: ' by',
						startMs: 26869,
						endMs: 27232,
						timestampMs: 27051,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 27232,
						endMs: 27594,
						timestampMs: 27413,
						confidence: null,
					},
					{
						text: ' finally',
						startMs: 27594,
						endMs: 28268,
						timestampMs: 27931,
						confidence: null,
					},
					{
						text: ' supporting',
						startMs: 28268,
						endMs: 28872,
						timestampMs: 28570,
						confidence: null,
					},
					{
						text: ' Zod 4.',
						startMs: 29245,
						endMs: 30033,
						timestampMs: 29639,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' What',
						startMs: 30289,
						endMs: 30460,
						timestampMs: 30375,
						confidence: null,
					},
					{
						text: ' else',
						startMs: 30460,
						endMs: 30650,
						timestampMs: 30555,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 30650,
						endMs: 30783,
						timestampMs: 30717,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 30783,
						endMs: 31164,
						timestampMs: 30974,
						confidence: null,
					},
					{
						text: ' improve?',
						startMs: 31164,
						endMs: 31316,
						timestampMs: 31240,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Let',
						startMs: 31567,
						endMs: 31627,
						timestampMs: 31597,
						confidence: null,
					},
					{
						text: ' us',
						startMs: 31624,
						endMs: 31738,
						timestampMs: 31681,
						confidence: null,
					},
					{
						text: ' know.',
						startMs: 31738,
						endMs: 32173,
						timestampMs: 31956,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Audio
				name="Sticker whoosh"
				src="https://remotion.media/whoosh.wav"
				from={1}
				volume={0.3}
			/>
			<Audio
				name="Split whip"
				src="https://remotion.media/whip.wav"
				from={92}
				volume={0.16}
			/>
			<Audio
				name="Rough edges"
				src="https://remotion.media/windows-xp-error.wav"
				from={272}
				volume={0.16}
			/>
			<Audio
				name="Fixed"
				src="https://remotion.media/ding.wav"
				from={362}
				volume={0.2}
			/>
			<Audio
				name="Studio running"
				src="https://remotion.media/mouse-click.wav"
				from={408}
				volume={0.3}
			/>
			<Audio
				name="Prevented"
				src="https://remotion.media/switch.wav"
				from={562}
				volume={0.24}
			/>
			<Audio
				name="Error gone"
				src="https://remotion.media/whoosh.wav"
				from={720}
				volume={0.32}
			/>
			<Audio
				name="Finally stamp"
				src="https://remotion.media/shutter-modern.wav"
				from={826}
				volume={0.22}
			/>
			<Audio
				name="Zod 4"
				src="https://remotion.media/yippee.wav"
				from={874}
				volume={0.14}
			/>
			<Audio
				name="Let us know"
				src="https://remotion.media/mouse-click.wav"
				from={906}
				volume={0.3}
			/>
		</AbsoluteFill>
	);
};
