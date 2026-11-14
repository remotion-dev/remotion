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
import {pop, rise} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {BellIcon, BoxIcon, CheckIcon, TriangleIcon} from '../components/icons';
import {RemotionLogo} from '../components/Logo';
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

const VercelSourceInner = () => {
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
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats4.mp4'
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
						startMs: 2241,
						endMs: 2666,
						timestampMs: 2454,
						confidence: null,
					},
					{
						text: ' videos',
						startMs: 2666,
						endMs: 3115,
						timestampMs: 2891,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 3115,
						endMs: 3398,
						timestampMs: 3257,
						confidence: null,
					},
					{
						text: ' Vercel.',
						startMs: 3398,
						endMs: 3894,
						timestampMs: 3646,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 4536,
						endMs: 4730,
						timestampMs: 4633,
						confidence: null,
					},
					{
						text: ' work',
						startMs: 4730,
						endMs: 5029,
						timestampMs: 4880,
						confidence: null,
					},
					{
						text: ' together',
						startMs: 5029,
						endMs: 5363,
						timestampMs: 5196,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 5363,
						endMs: 5751,
						timestampMs: 5557,
						confidence: null,
					},
					{
						text: ' Vercel',
						startMs: 5751,
						endMs: 6015,
						timestampMs: 5883,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 6015,
						endMs: 6279,
						timestampMs: 6147,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' make',
						startMs: 6279,
						endMs: 6666,
						timestampMs: 6473,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 6666,
						endMs: 6878,
						timestampMs: 6772,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 6878,
						endMs: 7071,
						timestampMs: 6975,
						confidence: null,
					},
					{
						text: ' their',
						startMs: 7071,
						endMs: 7564,
						timestampMs: 7318,
						confidence: null,
					},
					{
						text: ' platform',
						startMs: 7564,
						endMs: 8269,
						timestampMs: 7917,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' possible',
						startMs: 8500,
						endMs: 9048,
						timestampMs: 8774,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 9048,
						endMs: 9451,
						timestampMs: 9250,
						confidence: null,
					},
					{
						text: ' super',
						startMs: 9451,
						endMs: 9761,
						timestampMs: 9606,
						confidence: null,
					},
					{
						text: ' smooth.',
						startMs: 9761,
						endMs: 10255,
						timestampMs: 10008,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: " There's",
						startMs: 11008.333333,
						endMs: 11108.333333,
						timestampMs: 11058.333333,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 11108.333333,
						endMs: 11224.333333,
						timestampMs: 11166.333333,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 11224.333333,
						endMs: 11506.333333,
						timestampMs: 11365.333333,
						confidence: null,
					},
					{
						text: ' package',
						startMs: 11506.333333,
						endMs: 11922.333333,
						timestampMs: 11714.333333,
						confidence: null,
					},
					{
						text: ' called',
						startMs: 11922.333333,
						endMs: 12304.333333,
						timestampMs: 12113.333333,
						confidence: null,
					},
					{
						text: ' @remotion/vercel',
						startMs: 12304.333333,
						endMs: 13168.333333,
						timestampMs: 12736.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' that',
						startMs: 13168.333333,
						endMs: 13384.333333,
						timestampMs: 13276.333333,
						confidence: null,
					},
					{
						text: ' allows',
						startMs: 13384.333333,
						endMs: 13517.333333,
						timestampMs: 13451.333333,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 13517.333333,
						endMs: 13650.333333,
						timestampMs: 13584.333333,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 13650.333333,
						endMs: 13982.333333,
						timestampMs: 13816.333333,
						confidence: null,
					},
					{
						text: ' create',
						startMs: 13982.333333,
						endMs: 14630.333333,
						timestampMs: 14306.333333,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 15107.333333,
						endMs: 15721.333333,
						timestampMs: 15414.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' rendering',
						startMs: 15721.333333,
						endMs: 16409.333333,
						timestampMs: 16065.333333,
						confidence: null,
					},
					{
						text: ' instances',
						startMs: 16409.333333,
						endMs: 16521.333333,
						timestampMs: 16465.333333,
						confidence: null,
					},
					{
						text: ' using',
						startMs: 16930.333333,
						endMs: 17395.333333,
						timestampMs: 17163.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Vercel',
						startMs: 17395.333333,
						endMs: 18288.333333,
						timestampMs: 17842.333333,
						confidence: null,
					},
					{
						text: ' Sandbox',
						startMs: 18288.333333,
						endMs: 19032.333333,
						timestampMs: 18660.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 19591,
						endMs: 19860,
						timestampMs: 19726,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 19860,
						endMs: 20018,
						timestampMs: 19939,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 20018,
						endMs: 20208,
						timestampMs: 20113,
						confidence: null,
					},
					{
						text: ' have',
						startMs: 20208,
						endMs: 20494,
						timestampMs: 20351,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 20494,
						endMs: 20842,
						timestampMs: 20668,
						confidence: null,
					},
					{
						text: ' starter',
						startMs: 20842,
						endMs: 21270,
						timestampMs: 21056,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' template',
						startMs: 21270,
						endMs: 21824,
						timestampMs: 21547,
						confidence: null,
					},
					{
						text: ' where',
						startMs: 22330,
						endMs: 22739,
						timestampMs: 22535,
						confidence: null,
					},
					{
						text: ' everything',
						startMs: 22739,
						endMs: 23054,
						timestampMs: 22897,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 23054,
						endMs: 23148,
						timestampMs: 23101,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' set',
						startMs: 23148,
						endMs: 23368,
						timestampMs: 23258,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 23368,
						endMs: 23730,
						timestampMs: 23549,
						confidence: null,
					},
					{
						text: ' out',
						startMs: 24142,
						endMs: 24240,
						timestampMs: 24191,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 24240,
						endMs: 24338,
						timestampMs: 24289,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 24338,
						endMs: 24491,
						timestampMs: 24415,
						confidence: null,
					},
					{
						text: ' box.',
						startMs: 24491,
						endMs: 24742,
						timestampMs: 24617,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' This',
						startMs: 25497,
						endMs: 25588,
						timestampMs: 25543,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 25588,
						endMs: 25842,
						timestampMs: 25715,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 25842,
						endMs: 26115,
						timestampMs: 25979,
						confidence: null,
					},
					{
						text: ' a',
						startMs: 26115,
						endMs: 26497,
						timestampMs: 26306,
						confidence: null,
					},
					{
						text: ' first-class',
						startMs: 26497,
						endMs: 26952,
						timestampMs: 26725,
						confidence: null,
					},
					{
						text: ' server-side',
						startMs: 27352,
						endMs: 28189,
						timestampMs: 27771,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' rendering',
						startMs: 28189,
						endMs: 28862,
						timestampMs: 28526,
						confidence: null,
					},
					{
						text: ' solution',
						startMs: 28862,
						endMs: 29407,
						timestampMs: 29135,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 29635,
						endMs: 29916,
						timestampMs: 29776,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Remotion',
						startMs: 29916,
						endMs: 30906,
						timestampMs: 30411,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 31538.666666,
						endMs: 31764.666666,
						timestampMs: 31651.666666,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 31764.666666,
						endMs: 31915.666666,
						timestampMs: 31840.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' is',
						startMs: 31915.666666,
						endMs: 32084.666666,
						timestampMs: 32000.666666,
						confidence: null,
					},
					{
						text: ' one',
						startMs: 32084.666666,
						endMs: 32197.666666,
						timestampMs: 32141.666666,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 32197.666666,
						endMs: 32442.666666,
						timestampMs: 32320.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 32442.666666,
						endMs: 32800.666666,
						timestampMs: 32621.666666,
						confidence: null,
					},
					{
						text: ' easiest',
						startMs: 32800.666666,
						endMs: 33064.666666,
						timestampMs: 32932.666666,
						confidence: null,
					},
					{
						text: ' way',
						startMs: 33064.666666,
						endMs: 33233.666666,
						timestampMs: 33149.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 33233.666666,
						endMs: 33421.666666,
						timestampMs: 33327.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' set',
						startMs: 33421.666666,
						endMs: 33481.666666,
						timestampMs: 33451.666666,
						confidence: null,
					},
					{
						text: ' up',
						startMs: 33591.666666,
						endMs: 33651.666666,
						timestampMs: 33621.666666,
						confidence: null,
					},
					{
						text: ' server-side',
						startMs: 33817.666666,
						endMs: 34928.666666,
						timestampMs: 34373.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' rendering.',
						startMs: 35174.666666,
						endMs: 35871.666666,
						timestampMs: 35523.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' A',
						startMs: 36213.666666,
						endMs: 36379.666666,
						timestampMs: 36296.666666,
						confidence: null,
					},
					{
						text: ' small',
						startMs: 36379.666666,
						endMs: 36571.666666,
						timestampMs: 36475.666666,
						confidence: null,
					},
					{
						text: ' tutorial',
						startMs: 36571.666666,
						endMs: 36788.666666,
						timestampMs: 36680.666666,
						confidence: null,
					},
					{
						text: ' about',
						startMs: 36788.666666,
						endMs: 37019.666666,
						timestampMs: 36904.666666,
						confidence: null,
					},
					{
						text: ' this',
						startMs: 37019.666666,
						endMs: 37159.666666,
						timestampMs: 37089.666666,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 37159.666666,
						endMs: 37326.666666,
						timestampMs: 37243.666666,
						confidence: null,
					},
					{
						text: ' coming',
						startMs: 37326.666666,
						endMs: 37517.666666,
						timestampMs: 37422.666666,
						confidence: null,
					},
					{
						text: ' out',
						startMs: 37517.666666,
						endMs: 37799.666666,
						timestampMs: 37658.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' soon.',
						startMs: 37811.666666,
						endMs: 38799.666666,
						timestampMs: 38305.666666,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const VercelSource = Interactive.create({
	Component: VercelSourceInner,
	layout: 'absolute-fill',
});

const VercelSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent="#6B7280" />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Render on Vercel"
						durationInFrames={59}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<VercelSource trimBefore={63} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Working with Vercel"
						durationInFrames={178}
						premountFor={30}
					>
						<ShotFraming zoom={1.12}>
							<VercelSource trimBefore={134} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="New package"
						durationInFrames={246}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<VercelSource trimBefore={328} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Starter template"
						durationInFrames={73}
						premountFor={30}
					>
						<ShotFraming zoom={1.16}>
							<VercelSource trimBefore={585} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Out of the box"
						durationInFrames={80}
						premountFor={30}
					>
						<ShotFraming zoom={1.03}>
							<VercelSource trimBefore={667} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="First-class SSR"
						durationInFrames={168}
						premountFor={30}
					>
						<ShotFraming zoom={1.18}>
							<VercelSource trimBefore={762} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Easiest way"
						durationInFrames={236}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<VercelSource trimBefore={944} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

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

			<Track name="Sound effects">
				<Audio
					durationInFrames={5}
					name="Sticker whoosh"
					src="https://remotion.media/whoosh.wav"
					from={0}
					volume={0.3}
				/>
				<Audio
					durationInFrames={12}
					name="Logos click"
					src="https://remotion.media/mouse-click.wav"
					from={76}
					volume={0.3}
				/>
				<Audio
					durationInFrames={10}
					name="Typing"
					src="https://remotion.media/switch.wav"
					from={300}
					volume={0.2}
				/>
				<Audio
					durationInFrames={12}
					name="Template page turn"
					src="https://remotion.media/page-turn.wav"
					from={512}
					volume={0.28}
				/>
				<Audio
					durationInFrames={15}
					name="First-class stamp"
					src="https://remotion.media/shutter-modern.wav"
					from={666}
					volume={0.22}
				/>
				<Audio
					durationInFrames={6}
					name="Split whip"
					src="https://remotion.media/whip.wav"
					from={798}
					volume={0.16}
				/>
				<Audio
					durationInFrames={42}
					name="Easiest ding"
					src="https://remotion.media/ding.wav"
					from={846}
					volume={0.2}
				/>
				<Audio
					durationInFrames={12}
					name="Tutorial pop"
					src="https://remotion.media/mouse-click.wav"
					from={972}
					volume={0.3}
				/>
			</Track>
		</>
	);
};

export const VercelScene = Interactive.create({
	Component: VercelSceneInner,
	layout: 'absolute-fill',
});
