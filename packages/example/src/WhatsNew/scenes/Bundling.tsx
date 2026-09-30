import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	interpolateColors,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {easeInOut, pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {SpeedLines} from '../components/fx';
import {BoltIcon} from '../components/icons';
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
import {display, mono} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 42, layout: 'split'},
	{at: 200, layout: 'full', duration: 1},
	{at: 243, layout: 'split'},
];

const RspackConfig: React.FC = () => (
	<Panel style={{gap: 30}}>
		<Pop from="up" delay={4}>
			<Window title="remotion.config.ts" width={820} fontSize={30}>
				<CodeLines
					start={14}
					speed={2.2}
					highlightLine={2}
					highlightFrom={50}
					lines={[
						[
							['import', syntax.keyword],
							[' {Config} ', syntax.plain],
							['from', syntax.keyword],
							[" '@remotion/cli/config'", syntax.string],
							[';', syntax.punct],
						],
						[],
						[
							['Config', syntax.plain],
							['.', syntax.punct],
							['setRspack', syntax.fn],
							['(', syntax.punct],
							['true', syntax.number],
							[');', syntax.punct],
						],
					]}
				/>
			</Window>
		</Pop>
		<div style={{display: 'flex', gap: 18}}>
			<Pop delay={86} from="up">
				<Chip background={colors.ink} color={colors.paper}>
					Rspack experiment
				</Chip>
			</Pop>
			<Pop delay={126} from="up">
				<Chip
					background={accents.bundling}
					icon={<BoltIcon size={34} color={colors.ink} />}
				>
					One purpose: speed
				</Chip>
			</Pop>
		</div>
	</Panel>
);

const FasterSlam: React.FC = () => {
	const frame = useCurrentFrame();
	const p = pop(frame, 12, 8);
	return (
		<AbsoluteFill>
			<SpeedLines color="rgba(255,196,0,0.9)" />
			<div
				style={{
					position: 'absolute',
					left: 90,
					top: 300,
					display: 'flex',
					alignItems: 'center',
					gap: 20,
					padding: '20px 44px 26px 30px',
					borderRadius: 40,
					backgroundColor: accents.bundling,
					opacity: Math.min(1, p * 2),
					scale: 0.3 + 0.7 * p,
					rotate: `${-6 + (1 - p) * -20}deg`,
					boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
				}}
			>
				<BoltIcon size={120} color={colors.ink} strokeWidth={2.6} />
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 150,
						lineHeight: 1,
						letterSpacing: '-0.04em',
						color: colors.ink,
					}}
				>
					Faster
				</div>
			</div>
		</AbsoluteFill>
	);
};

const Race: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 245; "twice as fast" is at local 100.
	const rspack = interpolate(frame, [14, 58], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const webpack = interpolate(frame, [14, 102], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const twice = pop(frame, 100, 8);
	const rows = [
		{label: 'webpack', value: webpack, color: '#8DA2C0'},
		{label: 'Rspack', value: rspack, color: accents.bundling},
	];
	return (
		<Panel style={{gap: 34}}>
			<Pop from="up">
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 60,
						letterSpacing: '-0.03em',
						color: colors.ink,
					}}
				>
					Bundling stage
				</div>
			</Pop>
			<div
				style={{
					width: 800,
					borderRadius: 34,
					backgroundColor: colors.paper,
					padding: '40px 40px',
					boxSizing: 'border-box',
					boxShadow: '0 24px 60px rgba(10,16,32,0.16)',
					display: 'flex',
					flexDirection: 'column',
					gap: 34,
				}}
			>
				{rows.map((row) => (
					<div key={row.label}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								fontFamily: mono,
								fontWeight: 600,
								fontSize: 32,
								color: colors.ink,
								marginBottom: 12,
							}}
						>
							<span>{row.label}</span>
							<span
								style={{color: row.value >= 1 ? colors.success : colors.muted}}
							>
								{row.value >= 1
									? '✓ bundled'
									: `${Math.round(row.value * 100)}%`}
							</span>
						</div>
						<div
							style={{
								height: 34,
								borderRadius: 17,
								backgroundColor: colors.mist,
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									height: '100%',
									width: `${row.value * 100}%`,
									borderRadius: 17,
									backgroundColor: row.color,
								}}
							/>
						</div>
					</div>
				))}
			</div>
			<div
				style={{
					fontFamily: display,
					fontWeight: 700,
					fontSize: 170,
					lineHeight: 1,
					letterSpacing: '-0.05em',
					color: colors.ink,
					opacity: Math.min(1, twice * 2),
					scale: 0.3 + 0.7 * twice,
					textShadow: `0 10px 0 ${accents.bundling}`,
				}}
			>
				up to 2×
			</div>
		</Panel>
	);
};

const FastRefresh: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 384; "reflected on the canvas" is at local 90.
	const edit = interpolate(frame, [70, 86], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const color = interpolateColors(edit, [0, 1], [colors.blue, accents.agents]);
	const flash = interpolate(frame, [88, 92, 110], [0, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const hex = edit < 0.5 ? '#0B84F3' : '#FF5A36';
	return (
		<Panel style={{gap: 24}}>
			<Pop from="up" delay={2}>
				<Window title="MyVideo.tsx" width={820} fontSize={30}>
					<div>
						<span style={{color: syntax.punct}}>{'<'}</span>
						<span style={{color: syntax.tag}}>AbsoluteFill</span>
					</div>
					<div
						style={{
							margin: '0 -32px',
							padding: '0 32px',
							backgroundColor: `rgba(255,196,0,${0.22 * rise(frame, 66, 8)})`,
						}}
					>
						<span style={{color: syntax.attr}}>{'  style'}</span>
						<span style={{color: syntax.punct}}>{'={{backgroundColor: '}</span>
						<span style={{color: syntax.string}}>{`"${hex}"`}</span>
						<span style={{color: syntax.punct}}>{'}}'}</span>
					</div>
					<div style={{color: syntax.punct}}>{'/>'}</div>
				</Window>
			</Pop>
			<Pop from="up" delay={10}>
				<div
					style={{
						width: 820,
						height: 380,
						borderRadius: 30,
						backgroundColor: '#1F2126',
						padding: 26,
						boxSizing: 'border-box',
						position: 'relative',
						boxShadow: '0 24px 60px rgba(10,16,32,0.3)',
					}}
				>
					<Label color="#8A8F98" style={{fontSize: 22}}>
						Canvas
					</Label>
					<div
						style={{
							marginTop: 14,
							height: 280,
							borderRadius: 18,
							backgroundColor: color,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: `0 0 ${80 * flash}px ${accents.bundling}`,
						}}
					>
						<BoltIcon
							size={120}
							color={`rgba(255,255,255,${0.35 + 0.65 * flash})`}
						/>
					</div>
				</div>
			</Pop>
			<Pop delay={124} from="up">
				<Chip
					background={accents.bundling}
					icon={<BoltIcon size={34} color={colors.ink} />}
				>
					Changes show up much faster
				</Chip>
			</Pop>
		</Panel>
	);
};

const Roadmap: React.FC = () => {
	const frame = useCurrentFrame();
	// Sequence starts at scene frame 548; "default" is at local 77.
	const line = interpolate(frame, [50, 80], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const steps = [
		{title: 'Today', body: 'Opt in', delay: 36, color: accents.bundling},
		{
			title: 'Future version',
			body: 'On by default',
			delay: 76,
			color: colors.blue,
		},
	];
	return (
		<Panel style={{gap: 0}}>
			<div style={{position: 'relative', width: 760, height: 520}}>
				<div
					style={{
						position: 'absolute',
						left: 58,
						top: 110,
						width: 8,
						height: 300 * line,
						borderRadius: 4,
						backgroundColor: colors.line,
					}}
				/>
				{steps.map((s, i) => {
					const p = pop(frame, s.delay, 11);
					return (
						<div
							key={s.title}
							style={{
								position: 'absolute',
								left: 0,
								top: i * 300,
								display: 'flex',
								alignItems: 'center',
								gap: 30,
								opacity: Math.min(1, p * 2),
								translate: `${(1 - p) * -40}px 0px`,
							}}
						>
							<div
								style={{
									width: 124,
									height: 124,
									borderRadius: 62,
									backgroundColor: s.color,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: '0 18px 40px rgba(10,16,32,0.2)',
									scale: 0.6 + 0.4 * p,
								}}
							>
								<BoltIcon
									size={62}
									color={i === 0 ? colors.ink : colors.paper}
								/>
							</div>
							<div
								style={{
									backgroundColor: colors.paper,
									borderRadius: 30,
									padding: '24px 34px',
									boxShadow: '0 18px 44px rgba(10,16,32,0.14)',
								}}
							>
								<Label>{s.title}</Label>
								<div
									style={{
										fontFamily: display,
										fontWeight: 700,
										fontSize: 58,
										letterSpacing: '-0.02em',
										color: colors.ink,
									}}
								>
									{s.body}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</Panel>
	);
};

export const BundlingScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.bundling} />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Faster bundling"
						durationInFrames={42}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
								}
								trimBefore={78}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Rspack experiment"
						durationInFrames={158}
						premountFor={30}
					>
						<Punch zoom={1.12}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
								}
								trimBefore={137}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="To make things faster"
						durationInFrames={43}
						premountFor={30}
					>
						<Punch zoom={1.34}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
								}
								trimBefore={304}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Twice as fast"
						durationInFrames={139}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
								}
								trimBefore={363}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Canvas updates"
						durationInFrames={166}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
								}
								trimBefore={514}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Opt in today"
						durationInFrames={172}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
								}
								trimBefore={699}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Chapter sticker" from={2} durationInFrames={46}>
				<ChapterSticker
					index="07"
					title="Faster bundling"
					accent={accents.bundling}
					accentText={colors.ink}
				/>
			</Sequence>
			<Sequence name="Rspack config" from={48} durationInFrames={152}>
				<RspackConfig />
			</Sequence>
			<Sequence name="Faster slam" from={200} durationInFrames={43}>
				<FasterSlam />
			</Sequence>
			<Sequence name="Race" from={245} durationInFrames={139}>
				<Race />
			</Sequence>
			<Sequence name="Fast refresh" from={384} durationInFrames={164}>
				<FastRefresh />
			</Sequence>
			<Sequence name="Roadmap" from={548} durationInFrames={172}>
				<Roadmap />
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={['rspack', 'faster.', 'twice', 'fast', 'default']}
				captions={[
					// @captions whats8
					{
						text: 'Faster',
						startMs: 134,
						endMs: 394,
						timestampMs: 264,
						confidence: null,
					},
					{
						text: ' bundling.',
						startMs: 394,
						endMs: 1250,
						timestampMs: 822,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 1478,
						endMs: 1651,
						timestampMs: 1565,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 1651,
						endMs: 1862,
						timestampMs: 1757,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 1862,
						endMs: 2111,
						timestampMs: 1987,
						confidence: null,
					},
					{
						text: ' opt',
						startMs: 2111,
						endMs: 2399,
						timestampMs: 2255,
						confidence: null,
					},
					{
						text: ' into',
						startMs: 2399,
						endMs: 2629,
						timestampMs: 2514,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 2847,
						endMs: 3229,
						timestampMs: 3038,
						confidence: null,
					},
					{
						text: ' Rspack',
						startMs: 3229,
						endMs: 4378,
						timestampMs: 3804,
						confidence: null,
					},
					{
						text: ' experiment',
						startMs: 4378,
						endMs: 4870,
						timestampMs: 4624,
						confidence: null,
					},
					{
						text: ' which',
						startMs: 4870,
						endMs: 5125,
						timestampMs: 4998,
						confidence: null,
					},
					{
						text: ' just',
						startMs: 5125,
						endMs: 5326,
						timestampMs: 5226,
						confidence: null,
					},
					{
						text: ' has',
						startMs: 5326,
						endMs: 5690,
						timestampMs: 5508,
						confidence: null,
					},
					{
						text: ' one',
						startMs: 5690,
						endMs: 6128,
						timestampMs: 5909,
						confidence: null,
					},
					{
						text: ' purpose.',
						startMs: 6128,
						endMs: 6492,
						timestampMs: 6310,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' To',
						startMs: 6734,
						endMs: 6909,
						timestampMs: 6822,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 6909,
						endMs: 7112,
						timestampMs: 7011,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 7112,
						endMs: 7476,
						timestampMs: 7294,
						confidence: null,
					},
					{
						text: ' faster.',
						startMs: 7476,
						endMs: 7936,
						timestampMs: 7706,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' When',
						startMs: 8182,
						endMs: 8563,
						timestampMs: 8373,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 8563,
						endMs: 8867,
						timestampMs: 8715,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 8867,
						endMs: 9229,
						timestampMs: 9048,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 9229,
						endMs: 9610,
						timestampMs: 9420,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 9610,
						endMs: 9801,
						timestampMs: 9706,
						confidence: null,
					},
					{
						text: ' bundling',
						startMs: 9801,
						endMs: 10334,
						timestampMs: 10068,
						confidence: null,
					},
					{
						text: ' stage',
						startMs: 10334,
						endMs: 10620,
						timestampMs: 10477,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 10620,
						endMs: 10830,
						timestampMs: 10725,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 10830,
						endMs: 11115,
						timestampMs: 10973,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 11115,
						endMs: 11496,
						timestampMs: 11306,
						confidence: null,
					},
					{
						text: ' twice',
						startMs: 11496,
						endMs: 11877,
						timestampMs: 11687,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 11877,
						endMs: 12335,
						timestampMs: 12106,
						confidence: null,
					},
					{
						text: ' fast',
						startMs: 12335,
						endMs: 12639,
						timestampMs: 12487,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 12811,
						endMs: 13169,
						timestampMs: 12990,
						confidence: null,
					},
					{
						text: ' changes',
						startMs: 13169,
						endMs: 13542,
						timestampMs: 13356,
						confidence: null,
					},
					{
						text: ' made',
						startMs: 13542,
						endMs: 13706,
						timestampMs: 13624,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 13706,
						endMs: 13825,
						timestampMs: 13766,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 13825,
						endMs: 14124,
						timestampMs: 13975,
						confidence: null,
					},
					{
						text: ' code',
						startMs: 14124,
						endMs: 14661,
						timestampMs: 14393,
						confidence: null,
					},
					{
						text: ' will',
						startMs: 15145,
						endMs: 15294,
						timestampMs: 15220,
						confidence: null,
					},
					{
						text: ' be',
						startMs: 15294,
						endMs: 15796,
						timestampMs: 15545,
						confidence: null,
					},
					{
						text: ' reflected',
						startMs: 15796,
						endMs: 16167,
						timestampMs: 15982,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 16167,
						endMs: 16390,
						timestampMs: 16279,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 16390,
						endMs: 16632,
						timestampMs: 16511,
						confidence: null,
					},
					{
						text: ' canvas',
						startMs: 16632,
						endMs: 17115,
						timestampMs: 16874,
						confidence: null,
					},
					{
						text: ' much',
						startMs: 17115,
						endMs: 17617,
						timestampMs: 17366,
						confidence: null,
					},
					{
						text: ' faster.',
						startMs: 17617,
						endMs: 18100,
						timestampMs: 17859,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 18335,
						endMs: 18520,
						timestampMs: 18428,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 18520,
						endMs: 18705,
						timestampMs: 18613,
						confidence: null,
					},
					{
						text: ' opt',
						startMs: 18705,
						endMs: 19045,
						timestampMs: 18875,
						confidence: null,
					},
					{
						text: ' into',
						startMs: 19045,
						endMs: 19260,
						timestampMs: 19153,
						confidence: null,
					},
					{
						text: ' this',
						startMs: 19260,
						endMs: 19600,
						timestampMs: 19430,
						confidence: null,
					},
					{
						text: ' today',
						startMs: 19615,
						endMs: 19877,
						timestampMs: 19746,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 19877,
						endMs: 19985,
						timestampMs: 19931,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 19985,
						endMs: 20108,
						timestampMs: 20047,
						confidence: null,
					},
					{
						text: ' will',
						startMs: 20108,
						endMs: 20216,
						timestampMs: 20162,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 20247,
						endMs: 20307,
						timestampMs: 20277,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 20386,
						endMs: 20525,
						timestampMs: 20456,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 20525,
						endMs: 20849,
						timestampMs: 20687,
						confidence: null,
					},
					{
						text: ' default',
						startMs: 20849,
						endMs: 21034,
						timestampMs: 20942,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 21034,
						endMs: 21142,
						timestampMs: 21088,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 21142,
						endMs: 21357,
						timestampMs: 21250,
						confidence: null,
					},
					{
						text: ' future',
						startMs: 21357,
						endMs: 21635,
						timestampMs: 21496,
						confidence: null,
					},
					{
						text: ' version',
						startMs: 21635,
						endMs: 21820,
						timestampMs: 21728,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 21820,
						endMs: 21974,
						timestampMs: 21897,
						confidence: null,
					},
					{
						text: ' Remotion.',
						startMs: 21974,
						endMs: 23438,
						timestampMs: 22706,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Audio
				name="Sticker whoosh"
				src="https://remotion.media/whoosh.wav"
				from={0}
				volume={0.3}
			/>
			<Audio
				name="Split whip"
				src="https://remotion.media/whip.wav"
				from={40}
				volume={0.16}
			/>
			<Audio
				name="Faster whip"
				src="https://remotion.media/whip.wav"
				from={210}
				volume={0.4}
			/>
			<Audio
				name="Race whoosh"
				src="https://remotion.media/whoosh.wav"
				from={258}
				volume={0.24}
			/>
			<Audio
				name="Twice ding"
				src="https://remotion.media/ding.wav"
				from={345}
				volume={0.22}
			/>
			<Audio
				name="Canvas switch"
				src="https://remotion.media/switch.wav"
				from={472}
				volume={0.26}
			/>
			<Audio
				name="Today click"
				src="https://remotion.media/mouse-click.wav"
				from={584}
				volume={0.3}
			/>
			<Audio
				name="Default click"
				src="https://remotion.media/mouse-click.wav"
				from={624}
				volume={0.3}
			/>
		</AbsoluteFill>
	);
};
