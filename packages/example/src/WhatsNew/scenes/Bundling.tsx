import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	Track,
	Interactive,
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

const FasterSlamInner: React.FC = () => {
	const frame = useCurrentFrame();
	const p = pop(frame, 12, 8);
	return (
		<>
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
		</>
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

const BundlingSourceInner = () => {
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
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats8.mp4'
						}
					/>
				</Punch>
			</Stage>
			<PunchyCaptions
				combineTokensWithinMilliseconds={10000}
				width={captions.width}
				fontSize={captions.fontSize}
				style={{...captions.style, zIndex: 1}}
				keywords={['rspack', 'faster.', 'twice', 'fast', 'default']}
				captions={[
					// @captions whats8
					{
						text: 'Faster',
						startMs: 2734,
						endMs: 2994,
						timestampMs: 2864,
						confidence: null,
					},
					{
						text: ' bundling.',
						startMs: 2994,
						endMs: 3850,
						timestampMs: 3422,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 4644.666666,
						endMs: 4817.666666,
						timestampMs: 4731.666666,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 4817.666666,
						endMs: 5028.666666,
						timestampMs: 4923.666666,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 5028.666666,
						endMs: 5277.666666,
						timestampMs: 5153.666666,
						confidence: null,
					},
					{
						text: ' opt',
						startMs: 5277.666666,
						endMs: 5565.666666,
						timestampMs: 5421.666666,
						confidence: null,
					},
					{
						text: ' into',
						startMs: 5565.666666,
						endMs: 5795.666666,
						timestampMs: 5680.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 6013.666666,
						endMs: 6395.666666,
						timestampMs: 6204.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Rspack',
						startMs: 6395.666666,
						endMs: 7544.666666,
						timestampMs: 6970.666666,
						confidence: null,
					},
					{
						text: ' experiment',
						startMs: 7544.666666,
						endMs: 8036.666666,
						timestampMs: 7790.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' which',
						startMs: 8036.666666,
						endMs: 8291.666666,
						timestampMs: 8164.666666,
						confidence: null,
					},
					{
						text: ' just',
						startMs: 8291.666666,
						endMs: 8492.666666,
						timestampMs: 8392.666666,
						confidence: null,
					},
					{
						text: ' has',
						startMs: 8492.666666,
						endMs: 8856.666666,
						timestampMs: 8674.666666,
						confidence: null,
					},
					{
						text: ' one',
						startMs: 8856.666666,
						endMs: 9294.666666,
						timestampMs: 9075.666666,
						confidence: null,
					},
					{
						text: ' purpose.',
						startMs: 9294.666666,
						endMs: 9658.666666,
						timestampMs: 9476.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' To',
						startMs: 10200.666666,
						endMs: 10375.666666,
						timestampMs: 10288.666666,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 10375.666666,
						endMs: 10578.666666,
						timestampMs: 10477.666666,
						confidence: null,
					},
					{
						text: ' things',
						startMs: 10578.666666,
						endMs: 10942.666666,
						timestampMs: 10760.666666,
						confidence: null,
					},
					{
						text: ' faster.',
						startMs: 10942.666666,
						endMs: 11402.666666,
						timestampMs: 11172.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' When',
						startMs: 12182,
						endMs: 12563,
						timestampMs: 12373,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 12563,
						endMs: 12867,
						timestampMs: 12715,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 12867,
						endMs: 13229,
						timestampMs: 13048,
						confidence: null,
					},
					{
						text: ' video',
						startMs: 13229,
						endMs: 13610,
						timestampMs: 13420,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 13610,
						endMs: 13801,
						timestampMs: 13706,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' bundling',
						startMs: 13801,
						endMs: 14334,
						timestampMs: 14068,
						confidence: null,
					},
					{
						text: ' stage',
						startMs: 14334,
						endMs: 14620,
						timestampMs: 14477,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 14620,
						endMs: 14830,
						timestampMs: 14725,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 14830,
						endMs: 15115,
						timestampMs: 14973,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 15115,
						endMs: 15496,
						timestampMs: 15306,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' twice',
						startMs: 15496,
						endMs: 15877,
						timestampMs: 15687,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 15877,
						endMs: 16335,
						timestampMs: 16106,
						confidence: null,
					},
					{
						text: ' fast',
						startMs: 16335,
						endMs: 16639,
						timestampMs: 16487,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 17211,
						endMs: 17569,
						timestampMs: 17390,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' changes',
						startMs: 17569,
						endMs: 17942,
						timestampMs: 17756,
						confidence: null,
					},
					{
						text: ' made',
						startMs: 17942,
						endMs: 18106,
						timestampMs: 18024,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 18106,
						endMs: 18225,
						timestampMs: 18166,
						confidence: null,
					},
					{
						text: ' your',
						startMs: 18225,
						endMs: 18524,
						timestampMs: 18375,
						confidence: null,
					},
					{
						text: ' code',
						startMs: 18524,
						endMs: 19061,
						timestampMs: 18793,
						confidence: null,
					},
					{
						text: ' will',
						startMs: 19545,
						endMs: 19694,
						timestampMs: 19620,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' be',
						startMs: 19694,
						endMs: 20196,
						timestampMs: 19945,
						confidence: null,
					},
					{
						text: ' reflected',
						startMs: 20196,
						endMs: 20567,
						timestampMs: 20382,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 20567,
						endMs: 20790,
						timestampMs: 20679,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 20790,
						endMs: 21032,
						timestampMs: 20911,
						confidence: null,
					},
					{
						text: ' canvas',
						startMs: 21032,
						endMs: 21515,
						timestampMs: 21274,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' much',
						startMs: 21515,
						endMs: 22017,
						timestampMs: 21766,
						confidence: null,
					},
					{
						text: ' faster.',
						startMs: 22017,
						endMs: 22500,
						timestampMs: 22259,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' You',
						startMs: 23368.333333,
						endMs: 23553.333333,
						timestampMs: 23461.333333,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 23553.333333,
						endMs: 23738.333333,
						timestampMs: 23646.333333,
						confidence: null,
					},
					{
						text: ' opt',
						startMs: 23738.333333,
						endMs: 24078.333333,
						timestampMs: 23908.333333,
						confidence: null,
					},
					{
						text: ' into',
						startMs: 24078.333333,
						endMs: 24293.333333,
						timestampMs: 24186.333333,
						confidence: null,
					},
					{
						text: ' this',
						startMs: 24293.333333,
						endMs: 24633.333333,
						timestampMs: 24463.333333,
						confidence: null,
					},
					{
						text: ' today',
						startMs: 24648.333333,
						endMs: 24910.333333,
						timestampMs: 24779.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 24910.333333,
						endMs: 25018.333333,
						timestampMs: 24964.333333,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 25018.333333,
						endMs: 25141.333333,
						timestampMs: 25080.333333,
						confidence: null,
					},
					{
						text: ' will',
						startMs: 25141.333333,
						endMs: 25249.333333,
						timestampMs: 25195.333333,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 25280.333333,
						endMs: 25340.333333,
						timestampMs: 25310.333333,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 25419.333333,
						endMs: 25558.333333,
						timestampMs: 25489.333333,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 25558.333333,
						endMs: 25882.333333,
						timestampMs: 25720.333333,
						confidence: null,
					},
					{
						text: ' default',
						startMs: 25882.333333,
						endMs: 26067.333333,
						timestampMs: 25975.333333,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 26067.333333,
						endMs: 26175.333333,
						timestampMs: 26121.333333,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 26175.333333,
						endMs: 26390.333333,
						timestampMs: 26283.333333,
						confidence: null,
					},
					{
						text: ' future',
						startMs: 26390.333333,
						endMs: 26668.333333,
						timestampMs: 26529.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' version',
						startMs: 26668.333333,
						endMs: 26853.333333,
						timestampMs: 26761.333333,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 26853.333333,
						endMs: 27007.333333,
						timestampMs: 26930.333333,
						confidence: null,
					},
					{
						text: ' Remotion.',
						startMs: 27007.333333,
						endMs: 28471.333333,
						timestampMs: 27739.333333,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const BundlingSource = Interactive.create({
	Component: BundlingSourceInner,
	layout: 'absolute-fill',
});

const BundlingSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent={accents.bundling} />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Faster bundling"
						durationInFrames={42}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<BundlingSource trimBefore={78} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Rspack experiment"
						durationInFrames={158}
						premountFor={30}
					>
						<ShotFraming zoom={1.12}>
							<BundlingSource trimBefore={137} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="To make things faster"
						durationInFrames={43}
						premountFor={30}
					>
						<ShotFraming zoom={1.34}>
							<BundlingSource trimBefore={304} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Twice as fast"
						durationInFrames={139}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<BundlingSource trimBefore={363} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Canvas updates"
						durationInFrames={166}
						premountFor={30}
					>
						<ShotFraming zoom={1.16}>
							<BundlingSource trimBefore={514} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Opt in today"
						durationInFrames={172}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<BundlingSource trimBefore={699} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

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
			<FasterSlam
				name="Faster slam"
				from={200}
				durationInFrames={43}
				style={{overflow: 'visible', flexDirection: 'column'}}
			/>
			<Sequence name="Race" from={245} durationInFrames={139}>
				<Race />
			</Sequence>
			<Sequence name="Fast refresh" from={384} durationInFrames={164}>
				<FastRefresh />
			</Sequence>
			<Sequence name="Roadmap" from={548} durationInFrames={172}>
				<Roadmap />
			</Sequence>

			<Track name="Sound effects">
				<Audio
					durationInFrames={5}
					name="Sticker whoosh"
					src="https://remotion.media/whoosh.wav"
					from={0}
					volume={0.3}
				/>
				<Audio
					durationInFrames={6}
					name="Split whip"
					src="https://remotion.media/whip.wav"
					from={40}
					volume={0.16}
				/>
				<Audio
					durationInFrames={6}
					name="Faster whip"
					src="https://remotion.media/whip.wav"
					from={210}
					volume={0.4}
				/>
				<Audio
					durationInFrames={5}
					name="Race whoosh"
					src="https://remotion.media/whoosh.wav"
					from={258}
					volume={0.24}
				/>
				<Audio
					durationInFrames={42}
					name="Twice ding"
					src="https://remotion.media/ding.wav"
					from={345}
					volume={0.22}
				/>
				<Audio
					durationInFrames={10}
					name="Canvas switch"
					src="https://remotion.media/switch.wav"
					from={472}
					volume={0.26}
				/>
				<Audio
					durationInFrames={12}
					name="Today click"
					src="https://remotion.media/mouse-click.wav"
					from={584}
					volume={0.3}
				/>
				<Audio
					durationInFrames={12}
					name="Default click"
					src="https://remotion.media/mouse-click.wav"
					from={624}
					volume={0.3}
				/>
			</Track>
		</>
	);
};

const FasterSlam = Interactive.create({
	Component: FasterSlamInner,
	layout: 'absolute-fill',
});
export const BundlingScene = Interactive.create({
	Component: BundlingSceneInner,
	layout: 'absolute-fill',
});
