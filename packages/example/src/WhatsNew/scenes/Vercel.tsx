import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {BellIcon, BoxIcon, CheckIcon, TriangleIcon} from '../components/icons';
import {RemotionLogo} from '../components/Logo';
import {
	getCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {
	ChapterSticker,
	CheckBadge,
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
import {colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 56, layout: 'split'},
	{at: 636, layout: 'full'},
	{at: 800, layout: 'split'},
];

const Partnership: React.FC = () => {
	const frame = useCurrentFrame();
	const x = pop(frame, 14, 10);
	return (
		<Panel style={{gap: 44}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 46}}>
				<Pop from="left" delay={2}>
					<div
						style={{
							width: 250,
							height: 250,
							borderRadius: 60,
							backgroundColor: colors.paper,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 26px 60px rgba(10,16,32,0.18)',
						}}
					>
						<RemotionLogo size={150} />
					</div>
				</Pop>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 90,
						color: colors.muted,
						scale: x,
						rotate: `${(1 - x) * 90}deg`,
					}}
				>
					×
				</div>
				<Pop from="right" delay={8}>
					<div
						style={{
							width: 250,
							height: 250,
							borderRadius: 60,
							backgroundColor: colors.vercelBlack,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 26px 60px rgba(10,16,32,0.35)',
						}}
					>
						<TriangleIcon size={140} color={colors.paper} />
					</div>
				</Pop>
			</div>
			<Pop from="up" delay={30}>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 64,
						letterSpacing: '-0.03em',
						color: colors.ink,
						textAlign: 'center',
					}}
				>
					Rendering on Vercel
				</div>
			</Pop>
			<Pop from="up" delay={148}>
				<Chip
					background={colors.ink}
					color={colors.paper}
					icon={<CheckIcon size={34} color={colors.success} strokeWidth={3} />}
				>
					Super smooth
				</Chip>
			</Pop>
		</Panel>
	);
};

const Sandbox: React.FC<{readonly index: number; readonly delay: number}> = ({
	index,
	delay,
}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(
		frame,
		[delay + 10, delay + 110 + index * 18],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const done = progress >= 1;
	return (
		<Pop delay={delay} from="up">
			<div
				style={{
					width: 250,
					borderRadius: 24,
					backgroundColor: colors.vercelBlack,
					padding: '22px 22px 24px',
					boxSizing: 'border-box',
					boxShadow: '0 20px 44px rgba(10,16,32,0.3)',
					display: 'flex',
					flexDirection: 'column',
					gap: 14,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
					<TriangleIcon size={24} color={colors.paper} />
					<div style={{fontFamily: mono, fontSize: 22, color: '#A1A1AA'}}>
						sandbox-{index + 1}
					</div>
				</div>
				<div
					style={{
						height: 12,
						borderRadius: 6,
						backgroundColor: '#27272A',
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							height: '100%',
							width: `${progress * 100}%`,
							backgroundColor: done ? colors.success : colors.blue,
						}}
					/>
				</div>
				<div
					style={{
						fontFamily: mono,
						fontWeight: 600,
						fontSize: 24,
						color: done ? colors.success : colors.paper,
					}}
				>
					{done ? '✓ done' : `rendering ${Math.round(progress * 100)}%`}
				</div>
			</div>
		</Pop>
	);
};

const NewPackage: React.FC = () => (
	<Panel style={{gap: 30}}>
		<Pop from="up" delay={2}>
			<Window title="Terminal" width={820} fontSize={32}>
				<CodeLines
					start={14}
					speed={1.1}
					lines={[
						[
							['$ ', syntax.prompt],
							['npm i ', syntax.plain],
							['@remotion/vercel', syntax.fn],
						],
					]}
				/>
				<Pop delay={62} from="up">
					<div style={{color: syntax.prompt, marginTop: 6}}>
						✓ added @remotion/vercel
					</div>
				</Pop>
			</Window>
		</Pop>
		<div style={{display: 'flex', gap: 20}}>
			<Sandbox index={0} delay={92} />
			<Sandbox index={1} delay={100} />
			<Sandbox index={2} delay={108} />
		</div>
		<Pop delay={190} from="up">
			<Chip
				background={colors.vercelBlack}
				color={colors.paper}
				icon={<TriangleIcon size={30} color={colors.paper} />}
			>
				Vercel Sandbox
			</Chip>
		</Pop>
	</Panel>
);

const StarterTemplate: React.FC = () => {
	const frame = useCurrentFrame();
	const items = ['Render on demand', 'Store in Vercel Blob', 'Progress UI'];
	return (
		<Panel style={{gap: 28}}>
			<Pop from="up" delay={2}>
				<Window title="Terminal" width={820} fontSize={30}>
					<CodeLines
						start={10}
						speed={1.6}
						lines={[
							[
								['$ ', syntax.prompt],
								['npx create-video@latest ', syntax.plain],
								['--vercel', syntax.attr],
							],
						]}
					/>
				</Window>
			</Pop>
			<Pop from="up" delay={30}>
				<div
					style={{
						width: 820,
						borderRadius: 34,
						backgroundColor: colors.paper,
						boxShadow: '0 26px 60px rgba(10,16,32,0.16)',
						padding: '32px 38px',
						boxSizing: 'border-box',
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
					}}
				>
					<Label>Starter template</Label>
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 50,
							letterSpacing: '-0.02em',
							color: colors.ink,
						}}
					>
						Next.js + Vercel Sandbox
					</div>
					{items.map((item, i) => {
						const p = rise(frame, 88 + i * 8, 12);
						return (
							<div
								key={item}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 16,
									opacity: p,
									translate: `${(1 - p) * 30}px 0px`,
								}}
							>
								<CheckBadge delay={88 + i * 8} size={44} />
								<div
									style={{
										fontFamily: display,
										fontWeight: 500,
										fontSize: 36,
										color: colors.ink,
									}}
								>
									{item}
								</div>
							</div>
						);
					})}
				</div>
			</Pop>
			<Pop delay={128} from="up">
				<Chip
					background={colors.ink}
					color={colors.paper}
					icon={<BoxIcon size={34} color={colors.paper} />}
				>
					Set up out of the box
				</Chip>
			</Pop>
		</Panel>
	);
};

const options = [
	{name: 'AWS Lambda', note: '@remotion/lambda', highlight: false},
	{name: 'Google Cloud Run', note: '@remotion/cloudrun', highlight: false},
	{name: 'Vercel', note: '@remotion/vercel', highlight: true},
];

const SsrOptions: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Panel style={{gap: 22}}>
			<Pop from="up">
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 58,
						letterSpacing: '-0.03em',
						color: colors.ink,
						textAlign: 'center',
						marginBottom: 10,
					}}
				>
					Server-side rendering
				</div>
			</Pop>
			{options.map((o, i) => {
				const p = pop(frame, 6 + i * 7, 12);
				const glow = o.highlight ? rise(frame, 38, 14) : 0;
				return (
					<div
						key={o.name}
						style={{
							width: 780,
							height: 124,
							borderRadius: 30,
							backgroundColor: o.highlight ? colors.vercelBlack : colors.paper,
							color: o.highlight ? colors.paper : colors.ink,
							display: 'flex',
							alignItems: 'center',
							padding: '0 36px',
							boxSizing: 'border-box',
							gap: 24,
							opacity: Math.min(1, p * 2),
							scale: (0.8 + 0.2 * p) * (1 + glow * 0.04),
							boxShadow: o.highlight
								? `0 0 0 ${6 * glow}px ${colors.blue}, 0 26px 60px rgba(10,16,32,0.35)`
								: '0 14px 34px rgba(10,16,32,0.12)',
							position: 'relative',
						}}
					>
						<div style={{flex: 1}}>
							<div
								style={{
									fontFamily: display,
									fontWeight: 700,
									fontSize: 44,
								}}
							>
								{o.name}
							</div>
							<div
								style={{
									fontFamily: mono,
									fontSize: 24,
									opacity: 0.65,
								}}
							>
								{o.note}
							</div>
						</div>
						{o.highlight ? (
							<Stamp color={colors.blue} delay={38} rotate={-6} fontSize={40}>
								Easiest
							</Stamp>
						) : (
							<CheckIcon size={44} color={colors.success} strokeWidth={3} />
						)}
					</div>
				);
			})}
		</Panel>
	);
};

const TutorialSoon: React.FC = () => (
	<Panel>
		<Pop from="up" delay={2}>
			<div
				style={{
					width: 780,
					height: 440,
					borderRadius: 36,
					overflow: 'hidden',
					position: 'relative',
					background:
						'linear-gradient(135deg, #111 0%, #1F2937 55%, #0B84F3 140%)',
					boxShadow: '0 30px 70px rgba(10,16,32,0.35)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 40,
						top: 36,
						display: 'flex',
						alignItems: 'center',
						gap: 16,
					}}
				>
					<RemotionLogo size={52} color={colors.paper} />
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 34,
							color: colors.paper,
						}}
					>
						×
					</div>
					<TriangleIcon size={40} color={colors.paper} />
				</div>
				<div
					style={{
						width: 140,
						height: 140,
						borderRadius: 70,
						backgroundColor: colors.paper,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<svg width={60} height={60} viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" fill={colors.ink} />
					</svg>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 40,
						bottom: 34,
						fontFamily: display,
						fontWeight: 700,
						fontSize: 46,
						color: colors.paper,
					}}
				>
					Server-side rendering on Vercel
				</div>
			</div>
		</Pop>
		<Pop delay={28} from="up">
			<Chip
				background={colors.blue}
				color={colors.paper}
				icon={<BellIcon size={34} color={colors.paper} />}
			>
				Tutorial coming soon
			</Chip>
		</Pop>
	</Panel>
);

const FirstClass: React.FC = () => (
	<div style={{position: 'absolute', left: 130, top: 330}}>
		<Stamp color={colors.blue} rotate={-8} fontSize={84}>
			First-class
		</Stamp>
	</div>
);

export const VercelScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent="#6B7280" />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Render on Vercel"
						durationInFrames={59}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={63}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Working with Vercel"
						durationInFrames={178}
						premountFor={30}
					>
						<Punch zoom={1.12}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={134}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="New package"
						durationInFrames={246}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={328}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Starter template"
						durationInFrames={73}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={585}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Out of the box"
						durationInFrames={80}
						premountFor={30}
					>
						<Punch zoom={1.03}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={667}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="First-class SSR"
						durationInFrames={168}
						premountFor={30}
					>
						<Punch zoom={1.18}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={762}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Easiest way"
						durationInFrames={236}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
								}
								trimBefore={944}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Chapter sticker" from={2} durationInFrames={62}>
				<ChapterSticker
					index="03"
					title="Render on Vercel"
					accent={colors.vercelBlack}
				/>
			</Sequence>
			<Sequence name="Partnership" from={62} durationInFrames={175}>
				<Partnership />
			</Sequence>
			<Sequence name="New package" from={237} durationInFrames={246}>
				<NewPackage />
			</Sequence>
			<Sequence name="Starter template" from={483} durationInFrames={153}>
				<StarterTemplate />
			</Sequence>
			<Sequence name="First-class stamp" from={664} durationInFrames={136}>
				<FirstClass />
			</Sequence>
			<Sequence name="SSR options" from={806} durationInFrames={138}>
				<SsrOptions />
			</Sequence>
			<Sequence name="Tutorial soon" from={944} durationInFrames={96}>
				<TutorialSoon />
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={[
					'vercel',
					'vercel.',
					'sandbox',
					'template',
					'first',
					'easiest',
					'soon.',
				]}
				captions={[
					// @captions whats4
					{
						text: 'Render',
						startMs: 141,
						endMs: 566,
						timestampMs: 354,
						confidence: null,
					},
					{
						text: ' videos',
						startMs: 566,
						endMs: 1015,
						timestampMs: 791,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 1015,
						endMs: 1298,
						timestampMs: 1157,
						confidence: null,
					},
					{
						text: ' Vercel.',
						startMs: 1298,
						endMs: 1794,
						timestampMs: 1546,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 2036,
						endMs: 2230,
						timestampMs: 2133,
						confidence: null,
					},
					{
						text: ' work',
						startMs: 2230,
						endMs: 2529,
						timestampMs: 2380,
						confidence: null,
					},
					{
						text: ' together',
						startMs: 2529,
						endMs: 2863,
						timestampMs: 2696,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 2863,
						endMs: 3251,
						timestampMs: 3057,
						confidence: null,
					},
					{
						text: ' Vercel',
						startMs: 3251,
						endMs: 3515,
						timestampMs: 3383,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 3515,
						endMs: 3779,
						timestampMs: 3647,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 3779,
						endMs: 4166,
						timestampMs: 3973,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 4166,
						endMs: 4378,
						timestampMs: 4272,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 4378,
						endMs: 4571,
						timestampMs: 4475,
						confidence: null,
					},
					{
						text: ' their',
						startMs: 4571,
						endMs: 5064,
						timestampMs: 4818,
						confidence: null,
					},
					{
						text: ' platform',
						startMs: 5064,
						endMs: 5769,
						timestampMs: 5417,
						confidence: null,
					},
					{
						text: ' possible',
						startMs: 6000,
						endMs: 6548,
						timestampMs: 6274,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 6548,
						endMs: 6951,
						timestampMs: 6750,
						confidence: null,
					},
					{
						text: ' super',
						startMs: 6951,
						endMs: 7261,
						timestampMs: 7106,
						confidence: null,
					},
					{
						text: ' smooth.',
						startMs: 7261,
						endMs: 7755,
						timestampMs: 7508,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: " There's",
						startMs: 7975,
						endMs: 8075,
						timestampMs: 8025,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 8075,
						endMs: 8191,
						timestampMs: 8133,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 8191,
						endMs: 8473,
						timestampMs: 8332,
						confidence: null,
					},
					{
						text: ' package',
						startMs: 8473,
						endMs: 8889,
						timestampMs: 8681,
						confidence: null,
					},
					{
						text: ' called',
						startMs: 8889,
						endMs: 9271,
						timestampMs: 9080,
						confidence: null,
					},
					{
						text: ' @remotion/vercel',
						startMs: 9271,
						endMs: 10135,
						timestampMs: 9703,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 10135,
						endMs: 10351,
						timestampMs: 10243,
						confidence: null,
					},
					{
						text: ' allows',
						startMs: 10351,
						endMs: 10484,
						timestampMs: 10418,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 10484,
						endMs: 10617,
						timestampMs: 10551,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 10617,
						endMs: 10949,
						timestampMs: 10783,
						confidence: null,
					},
					{
						text: ' create',
						startMs: 10949,
						endMs: 11597,
						timestampMs: 11273,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 12074,
						endMs: 12688,
						timestampMs: 12381,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 12688,
						endMs: 13376,
						timestampMs: 13032,
						confidence: null,
					},
					{
						text: ' instances',
						startMs: 13376,
						endMs: 13488,
						timestampMs: 13432,
						confidence: null,
					},
					{
						text: ' using',
						startMs: 13897,
						endMs: 14362,
						timestampMs: 14130,
						confidence: null,
					},
					{
						text: ' Vercel',
						startMs: 14362,
						endMs: 15255,
						timestampMs: 14809,
						confidence: null,
					},
					{
						text: ' Sandbox',
						startMs: 15255,
						endMs: 15999,
						timestampMs: 15627,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 16191,
						endMs: 16460,
						timestampMs: 16326,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 16460,
						endMs: 16618,
						timestampMs: 16539,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 16618,
						endMs: 16808,
						timestampMs: 16713,
						confidence: null,
					},
					{
						text: ' have',
						startMs: 16808,
						endMs: 17094,
						timestampMs: 16951,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 17094,
						endMs: 17442,
						timestampMs: 17268,
						confidence: null,
					},
					{
						text: ' starter',
						startMs: 17442,
						endMs: 17870,
						timestampMs: 17656,
						confidence: null,
					},
					{
						text: ' template',
						startMs: 17870,
						endMs: 18424,
						timestampMs: 18147,
						confidence: null,
					},
					{
						text: ' where',
						startMs: 18630,
						endMs: 19039,
						timestampMs: 18835,
						confidence: null,
					},
					{
						text: ' everything',
						startMs: 19039,
						endMs: 19354,
						timestampMs: 19197,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 19354,
						endMs: 19448,
						timestampMs: 19401,
						confidence: null,
					},
					{
						text: ' set',
						startMs: 19448,
						endMs: 19668,
						timestampMs: 19558,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 19668,
						endMs: 20030,
						timestampMs: 19849,
						confidence: null,
					},
					{
						text: ' out',
						startMs: 20442,
						endMs: 20540,
						timestampMs: 20491,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 20540,
						endMs: 20638,
						timestampMs: 20589,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 20638,
						endMs: 20791,
						timestampMs: 20715,
						confidence: null,
					},
					{
						text: ' box.',
						startMs: 20791,
						endMs: 21042,
						timestampMs: 20917,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' This',
						startMs: 21297,
						endMs: 21388,
						timestampMs: 21343,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 21388,
						endMs: 21642,
						timestampMs: 21515,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 21642,
						endMs: 21915,
						timestampMs: 21779,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 21915,
						endMs: 22297,
						timestampMs: 22106,
						confidence: null,
					},
					{
						text: ' first-class',
						startMs: 22297,
						endMs: 22752,
						timestampMs: 22525,
						confidence: null,
					},
					{
						text: ' server-side',
						startMs: 23152,
						endMs: 23989,
						timestampMs: 23571,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 23989,
						endMs: 24662,
						timestampMs: 24326,
						confidence: null,
					},
					{
						text: ' solution',
						startMs: 24662,
						endMs: 25207,
						timestampMs: 24935,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 25435,
						endMs: 25716,
						timestampMs: 25576,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 25716,
						endMs: 26706,
						timestampMs: 26211,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 26872,
						endMs: 27098,
						timestampMs: 26985,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 27098,
						endMs: 27249,
						timestampMs: 27174,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 27249,
						endMs: 27418,
						timestampMs: 27334,
						confidence: null,
					},
					{
						text: ' one',
						startMs: 27418,
						endMs: 27531,
						timestampMs: 27475,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 27531,
						endMs: 27776,
						timestampMs: 27654,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 27776,
						endMs: 28134,
						timestampMs: 27955,
						confidence: null,
					},
					{
						text: ' easiest',
						startMs: 28134,
						endMs: 28398,
						timestampMs: 28266,
						confidence: null,
					},
					{
						text: ' way',
						startMs: 28398,
						endMs: 28567,
						timestampMs: 28483,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 28567,
						endMs: 28755,
						timestampMs: 28661,
						confidence: null,
					},
					{
						text: ' set',
						startMs: 28755,
						endMs: 28815,
						timestampMs: 28785,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 28925,
						endMs: 28985,
						timestampMs: 28955,
						confidence: null,
					},
					{
						text: ' server-side',
						startMs: 29151,
						endMs: 30262,
						timestampMs: 29707,
						confidence: null,
					},
					{
						text: ' rendering.',
						startMs: 30508,
						endMs: 31205,
						timestampMs: 30857,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' A',
						startMs: 31547,
						endMs: 31713,
						timestampMs: 31630,
						confidence: null,
					},
					{
						text: ' small',
						startMs: 31713,
						endMs: 31905,
						timestampMs: 31809,
						confidence: null,
					},
					{
						text: ' tutorial',
						startMs: 31905,
						endMs: 32122,
						timestampMs: 32014,
						confidence: null,
					},
					{
						text: ' about',
						startMs: 32122,
						endMs: 32353,
						timestampMs: 32238,
						confidence: null,
					},
					{
						text: ' this',
						startMs: 32353,
						endMs: 32493,
						timestampMs: 32423,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 32493,
						endMs: 32660,
						timestampMs: 32577,
						confidence: null,
					},
					{
						text: ' coming',
						startMs: 32660,
						endMs: 32851,
						timestampMs: 32756,
						confidence: null,
					},
					{
						text: ' out',
						startMs: 32851,
						endMs: 33133,
						timestampMs: 32992,
						confidence: null,
					},
					{
						text: ' soon.',
						startMs: 33145,
						endMs: 34133,
						timestampMs: 33639,
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
				name="Logos click"
				src="https://remotion.media/mouse-click.wav"
				from={76}
				volume={0.3}
			/>
			<Audio
				name="Typing"
				src="https://remotion.media/switch.wav"
				from={300}
				volume={0.2}
			/>
			<Audio
				name="Template page turn"
				src="https://remotion.media/page-turn.wav"
				from={512}
				volume={0.28}
			/>
			<Audio
				name="First-class stamp"
				src="https://remotion.media/shutter-modern.wav"
				from={666}
				volume={0.22}
			/>
			<Audio
				name="Split whip"
				src="https://remotion.media/whip.wav"
				from={798}
				volume={0.16}
			/>
			<Audio
				name="Easiest ding"
				src="https://remotion.media/ding.wav"
				from={846}
				volume={0.2}
			/>
			<Audio
				name="Tutorial pop"
				src="https://remotion.media/mouse-click.wav"
				from={972}
				volume={0.3}
			/>
		</AbsoluteFill>
	);
};
