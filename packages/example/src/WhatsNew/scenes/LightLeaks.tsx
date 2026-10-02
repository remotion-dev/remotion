import {lightLeak} from '@remotion/effects/light-leak';
import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	Series,
	Solid,
	useCurrentFrame,
} from 'remotion';
import {pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {FileIcon, SparkIcon} from '../components/icons';
import {LightLeakFx} from '../components/LightLeakFx';
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
	syntax,
	Window,
} from '../components/ui';
import {leakGrid} from '../effects/leak-grid';
import {display, mono} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 132, layout: 'split'},
];

const LeakTile: React.FC<{
	readonly seed: number;
	readonly width: number;
	readonly height: number;
	readonly hueShift: number;
	readonly progress: number;
}> = ({seed, width, height, hueShift, progress}) => (
	<div
		style={{
			width,
			height,
			borderRadius: 20,
			overflow: 'hidden',
			backgroundColor: '#140F0B',
			boxShadow: '0 14px 34px rgba(10,16,32,0.22)',
		}}
	>
		<Solid
			width={width}
			height={height}
			effects={[lightLeak({seed, hueShift, progress})]}
		/>
	</div>
);

const NativeComponent: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Panel>
			<Pop from="up">
				<LeakTile
					seed={3}
					width={800}
					height={300}
					hueShift={20}
					progress={interpolate(frame, [0, 90], [0.15, 0.7])}
				/>
			</Pop>
			<Pop from="up" delay={6}>
				<Window title="MyVideo.tsx" width={800} fontSize={30}>
					<CodeLines
						start={10}
						speed={1.6}
						lines={[
							[
								['<', syntax.punct],
								['Solid', syntax.tag],
							],
							[
								['  effects', syntax.attr],
								['={[', syntax.punct],
							],
							[
								['    lightLeak', syntax.fn],
								['({', syntax.punct],
								[' seed', syntax.plain],
								[': ', syntax.punct],
								['3', syntax.number],
								[', ', syntax.punct],
								['hueShift', syntax.plain],
								[': ', syntax.punct],
								['20', syntax.number],
								[' })', syntax.punct],
							],
							[['  ]}', syntax.punct]],
							[['/>', syntax.punct]],
						]}
					/>
				</Window>
			</Pop>
		</Panel>
	);
};

const Variations: React.FC = () => {
	const frame = useCurrentFrame();
	// Word timings relative to this sequence (starts at scene frame 226).
	const hueShift = interpolate(frame, [150, 222], [0, 360], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const seedCounter = Math.floor(
		interpolate(frame, [80, 124], [8, 9999], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
	);
	const hueBar = rise(frame, 140, 14);

	return (
		<Panel style={{gap: 26}}>
			<Solid
				width={838}
				height={586}
				style={{margin: '-20px 0'}}
				effects={[
					leakGrid({
						seed: 1,
						seedOffset: frame > 80 && frame < 124 ? frame : 0,
						hueShift,
						hueSpread: 40 * (hueShift / 360),
						progress: 0.45,
						progressWobble: 0.18,
						phase: frame / 14,
						appear: new Array(9).fill(0).map((_, i) => pop(frame, 14 + i * 4)),
					}),
				]}
			/>
			<div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
				<Pop delay={40}>
					<Chip
						fontSize={30}
						background={colors.ink}
						color={colors.paper}
						icon={<SparkIcon size={32} color={accents.lightLeaks} />}
					>
						Procedurally generated
					</Chip>
				</Pop>
				<Pop delay={72}>
					<Chip fontSize={30} style={{fontFamily: mono, fontWeight: 600}}>
						seed: {frame < 80 ? 8 : seedCounter}
						{frame >= 124 ? '…∞' : ''}
					</Chip>
				</Pop>
			</div>
			<div
				style={{
					width: 790,
					opacity: hueBar,
					translate: `0px ${(1 - hueBar) * 20}px`,
				}}
			>
				<div
					style={{
						height: 22,
						borderRadius: 11,
						background:
							'linear-gradient(90deg, #ff8a00, #ffe600, #37ff5b, #00e5ff, #3a6bff, #c63bff, #ff3b8d, #ff8a00)',
						position: 'relative',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: (hueShift / 360) * 790 - 20,
							top: -9,
							width: 40,
							height: 40,
							borderRadius: 20,
							backgroundColor: colors.paper,
							boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
						}}
					/>
				</div>
				<div
					style={{
						marginTop: 20,
						fontFamily: mono,
						fontWeight: 600,
						fontSize: 30,
						color: colors.ink,
						textAlign: 'center',
					}}
				>
					hueShift: {Math.round(hueShift)}
				</div>
			</div>
		</Panel>
	);
};

const DirectOrSkill: React.FC = () => (
	<Panel style={{gap: 34, alignItems: 'stretch', padding: '0 20px'}}>
		<Pop from="left" delay={6}>
			<div
				style={{
					backgroundColor: colors.paper,
					borderRadius: 30,
					padding: '30px 36px',
					boxShadow: '0 24px 60px rgba(10,16,32,0.18)',
				}}
			>
				<Label>Use it directly</Label>
				<div
					style={{
						marginTop: 14,
						fontFamily: mono,
						fontWeight: 600,
						fontSize: 44,
						color: colors.ink,
					}}
				>
					<span style={{color: accents.lightLeaks}}>lightLeak</span>()
				</div>
				<div
					style={{
						marginTop: 8,
						fontFamily: mono,
						fontSize: 26,
						color: colors.muted,
					}}
				>
					@remotion/effects/light-leak
				</div>
			</div>
		</Pop>
		<Pop
			delay={72}
			style={{
				fontFamily: display,
				fontWeight: 700,
				fontSize: 40,
				color: colors.muted,
				textAlign: 'center',
			}}
		>
			— or —
		</Pop>
		<Pop from="left" delay={80}>
			<div
				style={{
					backgroundColor: colors.ink,
					borderRadius: 30,
					padding: '30px 36px',
					boxShadow: '0 24px 60px rgba(10,16,32,0.3)',
					display: 'flex',
					alignItems: 'center',
					gap: 28,
				}}
			>
				<div
					style={{
						width: 96,
						height: 96,
						borderRadius: 24,
						backgroundColor: accents.lightLeaks,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<FileIcon size={54} color={colors.paper} />
				</div>
				<div>
					<Label color="#9AA4B8">New agent skill</Label>
					<div
						style={{
							marginTop: 8,
							fontFamily: mono,
							fontWeight: 600,
							fontSize: 40,
							color: colors.paper,
						}}
					>
						light-leaks.md
					</div>
				</div>
			</div>
		</Pop>
	</Panel>
);

// Scene A -> light leak -> Scene B, played inside the panel.
const TransitionDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const showB = frame >= 34;
	return (
		<Panel>
			<Pop from="up">
				<div
					style={{
						width: 800,
						height: 450,
						borderRadius: 30,
						overflow: 'hidden',
						position: 'relative',
						boxShadow: '0 30px 70px rgba(10,16,32,0.3)',
					}}
				>
					<AbsoluteFill
						style={{
							background: showB
								? 'linear-gradient(135deg, #FF5F6D, #FFC371)'
								: 'linear-gradient(135deg, #0B84F3, #5B3CFF)',
							justifyContent: 'center',
							alignItems: 'center',
							fontFamily: display,
							fontWeight: 700,
							fontSize: 110,
							color: colors.paper,
							letterSpacing: '-0.03em',
						}}
					>
						{showB ? 'Scene B' : 'Scene A'}
					</AbsoluteFill>
					<Sequence from={10} durationInFrames={48} layout="none">
						<TileLeak />
					</Sequence>
				</div>
			</Pop>
			<Pop delay={4}>
				<Chip
					fontSize={32}
					background={colors.ink}
					color={colors.paper}
					icon={<SparkIcon size={32} color={accents.lightLeaks} />}
				>
					Stylish scene transitions
				</Chip>
			</Pop>
		</Panel>
	);
};

const TileLeak: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Solid
			width={800}
			height={450}
			style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}
			effects={[
				lightLeak({
					seed: 5,
					hueShift: 65,
					progress: interpolate(frame, [0, 47], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}),
			]}
		/>
	);
};

export const LightLeaksScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.lightLeaks} />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Intro line"
						durationInFrames={224}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
								}
								trimBefore={191}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Procedurally generated"
						durationInFrames={226}
						premountFor={30}
					>
						<Punch zoom={1.14}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
								}
								trimBefore={435}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Components or skill"
						durationInFrames={270}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats2.mp4'
								}
								trimBefore={671}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Light leak over footage" from={24} durationInFrames={72}>
				<LightLeakFx seed={2} hueShift={0} />
			</Sequence>
			<Sequence name="Chapter sticker" from={6} durationInFrames={118}>
				<ChapterSticker
					index="01"
					title="Light leaks"
					accent={accents.lightLeaks}
				/>
			</Sequence>
			<Sequence name="Native component" from={146} durationInFrames={80}>
				<NativeComponent />
			</Sequence>
			<Sequence name="Variations" from={226} durationInFrames={226}>
				<Variations />
			</Sequence>
			<Sequence name="Direct or skill" from={452} durationInFrames={184}>
				<DirectOrSkill />
			</Sequence>
			<Sequence name="Transition demo" from={636} durationInFrames={84}>
				<TransitionDemo />
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={['light', 'leaks', 'leak', 'infinite', 'color', 'skill']}
				captions={[
					// @captions whats2
					{
						text: 'First',
						startMs: 154,
						endMs: 491,
						timestampMs: 323,
						confidence: null,
					},
					{
						text: ' up,',
						startMs: 491,
						endMs: 772,
						timestampMs: 632,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' light',
						startMs: 959,
						endMs: 1333,
						timestampMs: 1146,
						confidence: null,
					},
					{
						text: ' leaks.',
						startMs: 1333,
						endMs: 1633,
						timestampMs: 1483,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' They',
						startMs: 1633,
						endMs: 1913,
						timestampMs: 1773,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 1913,
						endMs: 2157,
						timestampMs: 2035,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 2157,
						endMs: 2418,
						timestampMs: 2288,
						confidence: null,
					},
					{
						text: ' common',
						startMs: 2418,
						endMs: 2680,
						timestampMs: 2549,
						confidence: null,
					},
					{
						text: ' effect',
						startMs: 2680,
						endMs: 2980,
						timestampMs: 2830,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 2980,
						endMs: 3298,
						timestampMs: 3139,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 3298,
						endMs: 3635,
						timestampMs: 3467,
						confidence: null,
					},
					{
						text: ' editing',
						startMs: 3635,
						endMs: 3915,
						timestampMs: 3775,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 3915,
						endMs: 4252,
						timestampMs: 4084,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 4252,
						endMs: 4757,
						timestampMs: 4505,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 5185,
						endMs: 5418,
						timestampMs: 5302,
						confidence: null,
					},
					{
						text: ' have',
						startMs: 5418,
						endMs: 5670,
						timestampMs: 5544,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 5670,
						endMs: 6064,
						timestampMs: 5867,
						confidence: null,
					},
					{
						text: ' native',
						startMs: 6064,
						endMs: 6602,
						timestampMs: 6333,
						confidence: null,
					},
					{
						text: ' component',
						startMs: 6602,
						endMs: 6907,
						timestampMs: 6755,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 6907,
						endMs: 7158,
						timestampMs: 7033,
						confidence: null,
					},
					{
						text: ' it.',
						startMs: 7158,
						endMs: 7302,
						timestampMs: 7230,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' They',
						startMs: 7550,
						endMs: 7785,
						timestampMs: 7668,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 7785,
						endMs: 8056,
						timestampMs: 7921,
						confidence: null,
					},
					{
						text: ' procedurally',
						startMs: 8056,
						endMs: 8779,
						timestampMs: 8418,
						confidence: null,
					},
					{
						text: ' generated',
						startMs: 8779,
						endMs: 8995,
						timestampMs: 8887,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 8995,
						endMs: 9194,
						timestampMs: 9095,
						confidence: null,
					},
					{
						text: ' there',
						startMs: 9194,
						endMs: 9519,
						timestampMs: 9357,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 9519,
						endMs: 9808,
						timestampMs: 9664,
						confidence: null,
					},
					{
						text: ' an',
						startMs: 9808,
						endMs: 10206,
						timestampMs: 10007,
						confidence: null,
					},
					{
						text: ' infinite',
						startMs: 10206,
						endMs: 10531,
						timestampMs: 10369,
						confidence: null,
					},
					{
						text: ' amount',
						startMs: 10531,
						endMs: 10747,
						timestampMs: 10639,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 10747,
						endMs: 11163,
						timestampMs: 10955,
						confidence: null,
					},
					{
						text: ' variations',
						startMs: 11163,
						endMs: 11470,
						timestampMs: 11317,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 11470,
						endMs: 11614,
						timestampMs: 11542,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 11614,
						endMs: 11795,
						timestampMs: 11705,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 11795,
						endMs: 12102,
						timestampMs: 11949,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 12102,
						endMs: 12319,
						timestampMs: 12211,
						confidence: null,
					},
					{
						text: ' they',
						startMs: 12319,
						endMs: 12481,
						timestampMs: 12400,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 12481,
						endMs: 12897,
						timestampMs: 12689,
						confidence: null,
					},
					{
						text: ' assume',
						startMs: 12897,
						endMs: 13637,
						timestampMs: 13267,
						confidence: null,
					},
					{
						text: ' any',
						startMs: 14120,
						endMs: 14620,
						timestampMs: 14370,
						confidence: null,
					},
					{
						text: ' color.',
						startMs: 14620,
						endMs: 14845,
						timestampMs: 14733,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 15081,
						endMs: 15191,
						timestampMs: 15136,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 15191,
						endMs: 15317,
						timestampMs: 15254,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 15317,
						endMs: 15475,
						timestampMs: 15396,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 15475,
						endMs: 15633,
						timestampMs: 15554,
						confidence: null,
					},
					{
						text: ' light',
						startMs: 15633,
						endMs: 15839,
						timestampMs: 15736,
						confidence: null,
					},
					{
						text: ' leak',
						startMs: 15839,
						endMs: 16281,
						timestampMs: 16060,
						confidence: null,
					},
					{
						text: ' components',
						startMs: 16281,
						endMs: 16897,
						timestampMs: 16589,
						confidence: null,
					},
					{
						text: ' directly',
						startMs: 16897,
						endMs: 16957,
						timestampMs: 16927,
						confidence: null,
					},
					{
						text: ' or',
						startMs: 17292,
						endMs: 17529,
						timestampMs: 17411,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 17529,
						endMs: 17655,
						timestampMs: 17592,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 17655,
						endMs: 17971,
						timestampMs: 17813,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 17971,
						endMs: 18713,
						timestampMs: 18342,
						confidence: null,
					},
					{
						text: ' accompanying',
						startMs: 19067,
						endMs: 20819,
						timestampMs: 19943,
						confidence: null,
					},
					{
						text: ' skill',
						startMs: 20819,
						endMs: 20879,
						timestampMs: 20849,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 21316,
						endMs: 21433,
						timestampMs: 21375,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 21433,
						endMs: 21551,
						timestampMs: 21492,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 21551,
						endMs: 21760,
						timestampMs: 21656,
						confidence: null,
					},
					{
						text: ' stylish',
						startMs: 21760,
						endMs: 22153,
						timestampMs: 21957,
						confidence: null,
					},
					{
						text: ' transition',
						startMs: 22153,
						endMs: 22493,
						timestampMs: 22323,
						confidence: null,
					},
					{
						text: ' between',
						startMs: 22493,
						endMs: 22847,
						timestampMs: 22670,
						confidence: null,
					},
					{
						text: ' scenes.',
						startMs: 22847,
						endMs: 23540,
						timestampMs: 23194,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Audio
				name="Sticker whoosh"
				src="https://remotion.media/whoosh.wav"
				from={4}
				volume={0.32}
			/>
			<Audio
				name="Split whip"
				src="https://remotion.media/whip.wav"
				from={130}
				volume={0.18}
			/>
			<Audio
				name="Grid click"
				src="https://remotion.media/mouse-click.wav"
				from={240}
				volume={0.3}
			/>
			<Audio
				name="Skill switch"
				src="https://remotion.media/switch.wav"
				from={532}
				volume={0.3}
			/>
			<Audio
				name="Demo whoosh"
				src="https://remotion.media/whoosh.wav"
				from={660}
				volume={0.26}
			/>
		</AbsoluteFill>
	);
};
