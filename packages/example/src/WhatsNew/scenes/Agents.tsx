import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	Track,
	Interactive,
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
	ShotFraming,
	StageLayout,
	useCaptionPlacement,
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
				<Burst
					from={124}
					style={{overflow: 'visible', flexDirection: 'column'}}
					x={250}
					y={260}
					colors={[
						colors.blue,
						accents.agents,
						accents.bundling,
						colors.success,
					]}
				/>
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

const AgentsSourceInner = () => {
	const captions = useCaptionPlacement(layout);
	return (
		<>
			<Stage
				style={{overflow: 'visible', flexDirection: 'column'}}
				keyframes={layout}
			>
				<Punch>
					<Video
						src={
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats7.mp4'
						}
					/>
				</Punch>
			</Stage>
			<PunchyCaptions
				combineTokensWithinMilliseconds={10000}
				width={captions.width}
				fontSize={captions.fontSize}
				style={{...captions.style, zIndex: 1}}
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
						startMs: 4210.666666,
						endMs: 4705.666666,
						timestampMs: 4458.666666,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 4705.666666,
						endMs: 5389.666666,
						timestampMs: 5047.666666,
						confidence: null,
					},
					{
						text: ' work',
						startMs: 5389.666666,
						endMs: 5884.666666,
						timestampMs: 5637.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' better',
						startMs: 5884.666666,
						endMs: 6402.666666,
						timestampMs: 6143.666666,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 6402.666666,
						endMs: 7039.666666,
						timestampMs: 6721.666666,
						confidence: null,
					},
					{
						text: ' agents.',
						startMs: 7039.666666,
						endMs: 7099.666666,
						timestampMs: 7069.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' If',
						startMs: 7856.333333,
						endMs: 8059.333333,
						timestampMs: 7958.333333,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 8059.333333,
						endMs: 8375.333333,
						timestampMs: 8217.333333,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 8375.333333,
						endMs: 8804.333333,
						timestampMs: 8590.333333,
						confidence: null,
					},
					{
						text: ' Claude Code',
						startMs: 8804.333333,
						endMs: 9346.333333,
						timestampMs: 9075.333333,
						confidence: null,
					},
					{
						text: ' or',
						startMs: 9346.333333,
						endMs: 9752.333333,
						timestampMs: 9549.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' similar',
						startMs: 9752.333333,
						endMs: 10271.333333,
						timestampMs: 10012.333333,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 10271.333333,
						endMs: 10722.333333,
						timestampMs: 10497.333333,
						confidence: null,
					},
					{
						text: ' vibe',
						startMs: 10722.333333,
						endMs: 10993.333333,
						timestampMs: 10858.333333,
						confidence: null,
					},
					{
						text: ' code',
						startMs: 10993.333333,
						endMs: 11219.333333,
						timestampMs: 11106.333333,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 11219.333333,
						endMs: 11580.333333,
						timestampMs: 11400.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' video',
						startMs: 11580.333333,
						endMs: 11941.333333,
						timestampMs: 11761.333333,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 11941.333333,
						endMs: 12325.333333,
						timestampMs: 12133.333333,
						confidence: null,
					},
					{
						text: ' Remotion,',
						startMs: 12325.333333,
						endMs: 12385.333333,
						timestampMs: 12355.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' there',
						startMs: 12779.333333,
						endMs: 13032.333333,
						timestampMs: 12906.333333,
						confidence: null,
					},
					{
						text: ' just',
						startMs: 13032.333333,
						endMs: 13351.333333,
						timestampMs: 13192.333333,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 13351.333333,
						endMs: 13553.333333,
						timestampMs: 13452.333333,
						confidence: null,
					},
					{
						text: ' some',
						startMs: 13553.333333,
						endMs: 13789.333333,
						timestampMs: 13671.333333,
						confidence: null,
					},
					{
						text: ' rough',
						startMs: 13789.333333,
						endMs: 14176.333333,
						timestampMs: 13983.333333,
						confidence: null,
					},
					{
						text: ' edges',
						startMs: 14176.333333,
						endMs: 14597.333333,
						timestampMs: 14387.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 14798.333333,
						endMs: 15067.333333,
						timestampMs: 14933.333333,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 15431.333333,
						endMs: 15536.333333,
						timestampMs: 15484.333333,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 15536.333333,
						endMs: 15746.333333,
						timestampMs: 15641.333333,
						confidence: null,
					},
					{
						text: ' trying',
						startMs: 15746.333333,
						endMs: 16062.333333,
						timestampMs: 15904.333333,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 16062.333333,
						endMs: 16393.333333,
						timestampMs: 16228.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' fix',
						startMs: 16671.333333,
						endMs: 16781.333333,
						timestampMs: 16726.333333,
						confidence: null,
					},
					{
						text: ' them.',
						startMs: 16964.333333,
						endMs: 17208.333333,
						timestampMs: 17086.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' For',
						startMs: 17968.666666,
						endMs: 18355.666666,
						timestampMs: 18162.666666,
						confidence: null,
					},
					{
						text: ' example,',
						startMs: 18355.666666,
						endMs: 18415.666666,
						timestampMs: 18385.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' if',
						startMs: 18599.666666,
						endMs: 18741.666666,
						timestampMs: 18670.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 18741.666666,
						endMs: 18925.666666,
						timestampMs: 18833.666666,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 18925.666666,
						endMs: 19413.666666,
						timestampMs: 19169.666666,
						confidence: null,
					},
					{
						text: ' Studio',
						startMs: 19413.666666,
						endMs: 19617.666666,
						timestampMs: 19515.666666,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 19617.666666,
						endMs: 19943.666666,
						timestampMs: 19780.666666,
						confidence: null,
					},
					{
						text: ' already',
						startMs: 19943.666666,
						endMs: 20003.666666,
						timestampMs: 19973.666666,
						confidence: null,
					},
					{
						text: ' running',
						startMs: 20309.666666,
						endMs: 20369.666666,
						timestampMs: 20339.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 20594.666666,
						endMs: 20818.666666,
						timestampMs: 20706.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 20818.666666,
						endMs: 21062.666666,
						timestampMs: 20940.666666,
						confidence: null,
					},
					{
						text: ' AI',
						startMs: 21062.666666,
						endMs: 21347.666666,
						timestampMs: 21205.666666,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 21347.666666,
						endMs: 21612.666666,
						timestampMs: 21480.666666,
						confidence: null,
					},
					{
						text: ' trying',
						startMs: 21612.666666,
						endMs: 21917.666666,
						timestampMs: 21765.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 21917.666666,
						endMs: 22304.666666,
						timestampMs: 22111.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' start',
						startMs: 22304.666666,
						endMs: 22650.666666,
						timestampMs: 22477.666666,
						confidence: null,
					},
					{
						text: ' another',
						startMs: 22650.666666,
						endMs: 22997.666666,
						timestampMs: 22824.666666,
						confidence: null,
					},
					{
						text: ' instance,',
						startMs: 23220.666666,
						endMs: 23280.666666,
						timestampMs: 23250.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' we',
						startMs: 23794.333333,
						endMs: 23992.333333,
						timestampMs: 23893.333333,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 23992.333333,
						endMs: 24290.333333,
						timestampMs: 24141.333333,
						confidence: null,
					},
					{
						text: ' prevent',
						startMs: 24290.333333,
						endMs: 24659.333333,
						timestampMs: 24475.333333,
						confidence: null,
					},
					{
						text: ' that.',
						startMs: 24659.333333,
						endMs: 25112.333333,
						timestampMs: 24886.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' The',
						startMs: 25966.666666,
						endMs: 26428.666666,
						timestampMs: 26197.666666,
						confidence: null,
					},
					{
						text: ' daunting',
						startMs: 26428.666666,
						endMs: 27018.666666,
						timestampMs: 26723.666666,
						confidence: null,
					},
					{
						text: ' multiple',
						startMs: 27337.666666,
						endMs: 27609.666666,
						timestampMs: 27473.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' lockfile',
						startMs: 27609.666666,
						endMs: 28192.666666,
						timestampMs: 27901.666666,
						confidence: null,
					},
					{
						text: ' error',
						startMs: 28192.666666,
						endMs: 28678.666666,
						timestampMs: 28435.666666,
						confidence: null,
					},
					{
						text: ' message',
						startMs: 28678.666666,
						endMs: 29125.666666,
						timestampMs: 28902.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' is',
						startMs: 29125.666666,
						endMs: 29533.666666,
						timestampMs: 29329.666666,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 29533.666666,
						endMs: 30097.666666,
						timestampMs: 29815.666666,
						confidence: null,
					},
					{
						text: ' gone',
						startMs: 30322.666666,
						endMs: 30730.666666,
						timestampMs: 30526.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 31187.666666,
						endMs: 31463.666666,
						timestampMs: 31325.666666,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 31463.666666,
						endMs: 31722.666666,
						timestampMs: 31593.666666,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 31722.666666,
						endMs: 32120.666666,
						timestampMs: 31921.666666,
						confidence: null,
					},
					{
						text: ' removed',
						startMs: 32120.666666,
						endMs: 32258.666666,
						timestampMs: 32189.666666,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 32258.666666,
						endMs: 32361.666666,
						timestampMs: 32310.666666,
						confidence: null,
					},
					{
						text: ' lot',
						startMs: 32361.666666,
						endMs: 32430.666666,
						timestampMs: 32396.666666,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 32465.666666,
						endMs: 32525.666666,
						timestampMs: 32495.666666,
						confidence: null,
					},
					{
						text: ' friction',
						startMs: 32793.666666,
						endMs: 33035.666666,
						timestampMs: 32914.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' by',
						startMs: 33035.666666,
						endMs: 33398.666666,
						timestampMs: 33217.666666,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 33398.666666,
						endMs: 33760.666666,
						timestampMs: 33579.666666,
						confidence: null,
					},
					{
						text: ' finally',
						startMs: 33760.666666,
						endMs: 34434.666666,
						timestampMs: 34097.666666,
						confidence: null,
					},
					{
						text: ' supporting',
						startMs: 34434.666666,
						endMs: 35038.666666,
						timestampMs: 34736.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Zod 4.',
						startMs: 35411.666666,
						endMs: 36199.666666,
						timestampMs: 35805.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' What',
						startMs: 37122.333333,
						endMs: 37293.333333,
						timestampMs: 37208.333333,
						confidence: null,
					},
					{
						text: ' else',
						startMs: 37293.333333,
						endMs: 37483.333333,
						timestampMs: 37388.333333,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 37483.333333,
						endMs: 37616.333333,
						timestampMs: 37550.333333,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 37616.333333,
						endMs: 37997.333333,
						timestampMs: 37807.333333,
						confidence: null,
					},
					{
						text: ' improve?',
						startMs: 37997.333333,
						endMs: 38149.333333,
						timestampMs: 38073.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Let',
						startMs: 38400.333333,
						endMs: 38460.333333,
						timestampMs: 38430.333333,
						confidence: null,
					},
					{
						text: ' us',
						startMs: 38457.333333,
						endMs: 38571.333333,
						timestampMs: 38514.333333,
						confidence: null,
					},
					{
						text: ' know.',
						startMs: 38571.333333,
						endMs: 39006.333333,
						timestampMs: 38789.333333,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const AgentsSource = Interactive.create({
	Component: AgentsSourceInner,
	layout: 'absolute-fill',
});

const AgentsSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent={accents.agents} />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Better with agents"
						durationInFrames={94}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<AgentsSource trimBefore={122} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Rough edges"
						durationInFrames={288}
						premountFor={30}
					>
						<ShotFraming zoom={1.12}>
							<AgentsSource trimBefore={233} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Studio already running"
						durationInFrames={163}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<AgentsSource trimBefore={537} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="We prevent that"
						durationInFrames={47}
						premountFor={30}
					>
						<ShotFraming zoom={1.18}>
							<AgentsSource trimBefore={711} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Lockfiles and Zod"
						durationInFrames={314}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<AgentsSource trimBefore={777} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Let us know"
						durationInFrames={70}
						premountFor={30}
					>
						<ShotFraming zoom={1.16}>
							<AgentsSource trimBefore={1111} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

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

			<Track name="Sound effects">
				<Audio
					durationInFrames={5}
					name="Sticker whoosh"
					src="https://remotion.media/whoosh.wav"
					from={1}
					volume={0.3}
				/>
				<Audio
					durationInFrames={6}
					name="Split whip"
					src="https://remotion.media/whip.wav"
					from={92}
					volume={0.16}
				/>
				<Audio
					durationInFrames={30}
					name="Rough edges"
					src="https://remotion.media/windows-xp-error.wav"
					from={272}
					volume={0.16}
				/>
				<Audio
					durationInFrames={42}
					name="Fixed"
					src="https://remotion.media/ding.wav"
					from={362}
					volume={0.2}
				/>
				<Audio
					durationInFrames={12}
					name="Studio running"
					src="https://remotion.media/mouse-click.wav"
					from={408}
					volume={0.3}
				/>
				<Audio
					durationInFrames={10}
					name="Prevented"
					src="https://remotion.media/switch.wav"
					from={562}
					volume={0.24}
				/>
				<Audio
					durationInFrames={5}
					name="Error gone"
					src="https://remotion.media/whoosh.wav"
					from={720}
					volume={0.32}
				/>
				<Audio
					durationInFrames={15}
					name="Finally stamp"
					src="https://remotion.media/shutter-modern.wav"
					from={826}
					volume={0.22}
				/>
				<Audio
					durationInFrames={80}
					name="Zod 4"
					src="https://remotion.media/yippee.wav"
					from={874}
					volume={0.14}
				/>
			</Track>
			<Track name="Overlapping sound effects">
				<Audio
					durationInFrames={12}
					name="Let us know"
					src="https://remotion.media/mouse-click.wav"
					from={906}
					volume={0.3}
				/>
			</Track>
		</>
	);
};

export const AgentsScene = Interactive.create({
	Component: AgentsSceneInner,
	layout: 'absolute-fill',
});
