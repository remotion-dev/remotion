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
import {easeInOut, pop, rise, typed} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {WaveBars} from '../components/fx';
import {ChatIcon, CheckIcon, SpeakerIcon, XIcon} from '../components/icons';
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
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 34, layout: 'split'},
	{at: 724, layout: 'full'},
	{at: 882, layout: 'split'},
];

const library = [
	'whoosh.wav',
	'whip.wav',
	'page-turn.wav',
	'switch.wav',
	'mouse-click.wav',
	'shutter-modern.wav',
	'shutter-old.wav',
];

const AiSearchFail: React.FC = () => {
	const frame = useCurrentFrame();
	const prompt = 'Find me a free whoosh sound effect';
	const results = [
		{text: 'Sign up to download', note: 'Paywall'},
		{text: 'Attribution required', note: 'License'},
		{text: '404 — link is dead', note: 'Broken'},
	];
	return (
		<Panel style={{alignItems: 'stretch', padding: '0 30px', gap: 26}}>
			<Pop from="up" style={{alignSelf: 'flex-end'}}>
				<div
					style={{
						backgroundColor: colors.blue,
						color: colors.paper,
						fontFamily: display,
						fontWeight: 700,
						fontSize: 36,
						padding: '22px 30px',
						borderRadius: '30px 30px 8px 30px',
						maxWidth: 640,
						boxShadow: '0 18px 40px rgba(11,132,243,0.35)',
					}}
				>
					{typed(frame, prompt, 4, 1.4)}
				</div>
			</Pop>
			<Pop from="up" delay={30}>
				<div
					style={{
						backgroundColor: colors.paper,
						borderRadius: '30px 30px 30px 8px',
						padding: '26px 30px',
						boxShadow: '0 24px 60px rgba(10,16,32,0.18)',
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
					}}
				>
					<Label>AI assistant</Label>
					{results.map((r, i) => {
						const p = pop(frame, 41 + i * 14, 12);
						return (
							<div
								key={r.text}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 20,
									opacity: Math.min(1, p * 2),
									translate: `${(1 - p) * 40}px 0px`,
								}}
							>
								<div
									style={{
										width: 58,
										height: 58,
										borderRadius: 16,
										backgroundColor: '#FDECEC',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<XIcon size={34} color={colors.danger} strokeWidth={3} />
								</div>
								<div
									style={{
										fontFamily: display,
										fontWeight: 700,
										fontSize: 36,
										color: colors.ink,
										flex: 1,
									}}
								>
									{r.text}
								</div>
								<div
									style={{
										fontFamily: mono,
										fontSize: 24,
										color: colors.danger,
									}}
								>
									{r.note}
								</div>
							</div>
						);
					})}
				</div>
			</Pop>
			<Stamp
				color={colors.danger}
				delay={84}
				rotate={-10}
				style={{alignSelf: 'center', marginTop: 10}}
			>
				Not helpful
			</Stamp>
		</Panel>
	);
};

const Library: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Panel style={{gap: 16}}>
			<Pop
				from="up"
				delay={20}
				style={{alignSelf: 'flex-start', marginLeft: 20}}
			>
				<Label>remotion.media</Label>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 64,
						letterSpacing: '-0.03em',
						color: colors.ink,
					}}
				>
					Our own SFX library
				</div>
			</Pop>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
					position: 'relative',
				}}
			>
				{library.map((name, i) => {
					const p = pop(frame, 36 + i * 5, 12);
					return (
						<div
							key={name}
							style={{
								width: 780,
								height: 80,
								borderRadius: 22,
								backgroundColor: colors.paper,
								boxShadow: '0 10px 26px rgba(10,16,32,0.12)',
								display: 'flex',
								alignItems: 'center',
								padding: '0 26px',
								boxSizing: 'border-box',
								gap: 22,
								opacity: Math.min(1, p * 2),
								translate: `${(1 - p) * -60}px 0px`,
							}}
						>
							<div
								style={{
									width: 50,
									height: 50,
									borderRadius: 25,
									backgroundColor: accents.soundEffects,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<SpeakerIcon size={30} color={colors.paper} />
							</div>
							<div
								style={{
									fontFamily: mono,
									fontWeight: 600,
									fontSize: 30,
									color: colors.ink,
									flex: 1,
								}}
							>
								{name}
							</div>
							<WaveBars
								seed={name}
								bars={22}
								height={46}
								color={`${accents.soundEffects}AA`}
							/>
						</div>
					);
				})}
				<Stamp
					color={colors.success}
					delay={180}
					rotate={12}
					fontSize={72}
					style={{position: 'absolute', right: -30, top: 90}}
				>
					Free
				</Stamp>
			</div>
			<Pop delay={199} from="up">
				<Chip
					background={colors.ink}
					color={colors.paper}
					icon={<CheckIcon size={36} color={colors.success} strokeWidth={3} />}
				>
					No attribution required
				</Chip>
			</Pop>
		</Panel>
	);
};

const Hotlink: React.FC = () => (
	<Panel>
		<Pop from="up" delay={2}>
			<Label style={{textAlign: 'center', marginBottom: 6}}>
				Hosted on our domain
			</Label>
		</Pop>
		<Pop from="up" delay={4}>
			<Window title="MyVideo.tsx" width={820} fontSize={30}>
				<CodeLines
					start={8}
					speed={1.5}
					highlightLine={1}
					highlightFrom={69}
					lines={[
						[
							['<', syntax.punct],
							['Audio', syntax.tag],
						],
						[
							['  src', syntax.attr],
							['=', syntax.punct],
							['"https://remotion.media/whoosh.wav"', syntax.string],
						],
						[['/>', syntax.punct]],
					]}
				/>
			</Window>
		</Pop>
		<Pop delay={68} from="up">
			<Chip
				background={accents.soundEffects}
				color={colors.paper}
				icon={<SpeakerIcon size={34} color={colors.paper} />}
			>
				Just hotlink it
			</Chip>
		</Pop>
	</Panel>
);

const levels = [0.42, 0.95, 0.6, 0.3, 0.78, 0.52, 0.86];

const Loudness: React.FC = () => {
	const frame = useCurrentFrame();
	const normalize = interpolate(frame, [95, 125], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	const line = rise(frame, 110, 14);
	return (
		<Panel style={{gap: 34}}>
			<Pop from="up">
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
					Same loudness
				</div>
			</Pop>
			<Pop from="up" delay={4}>
				<div
					style={{
						width: 780,
						height: 470,
						borderRadius: 34,
						backgroundColor: colors.paper,
						boxShadow: '0 24px 60px rgba(10,16,32,0.16)',
						position: 'relative',
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'space-between',
						padding: '70px 50px 40px',
						boxSizing: 'border-box',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 40,
							right: 40,
							top: 70 + (1 - 0.9) * 360 - 3,
							borderTop: `4px dashed ${colors.success}`,
							opacity: line,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							right: 44,
							top: 18,
							fontFamily: mono,
							fontWeight: 600,
							fontSize: 26,
							color: colors.success,
							opacity: line,
						}}
					>
						peak −3 dB
					</div>
					{levels.map((level, i) => {
						const grow = rise(frame, 8 + i * 4, 16);
						const h = interpolate(normalize, [0, 1], [level, 0.9]) * 360 * grow;
						return (
							<div
								key={i}
								style={{
									width: 74,
									height: h,
									borderRadius: 18,
									background: `linear-gradient(180deg, ${accents.soundEffects}, #B7A6FF)`,
								}}
							/>
						);
					})}
				</div>
			</Pop>
			<Pop delay={162} from="up">
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
					<CheckBadge delay={162} size={60} />
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 40,
							color: colors.ink,
						}}
					>
						Standardized
					</div>
				</div>
			</Pop>
		</Panel>
	);
};

const SevenCallout: React.FC = () => {
	const frame = useCurrentFrame();
	const p = pop(frame, 8, 9);
	return (
		<div
			style={{
				position: 'absolute',
				left: 120,
				top: 250,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 18,
				opacity: Math.min(1, p * 2),
				scale: 0.3 + 0.7 * p,
				rotate: `${(1 - p) * -20}deg`,
			}}
		>
			<div
				style={{
					width: 300,
					height: 300,
					borderRadius: 150,
					backgroundColor: accents.soundEffects,
					color: colors.paper,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: display,
					fontWeight: 700,
					fontSize: 220,
					lineHeight: 1,
					paddingBottom: 16,
					boxSizing: 'border-box',
					boxShadow:
						'0 30px 70px rgba(124,92,255,0.5), inset 0 0 0 10px rgba(255,255,255,0.9)',
				}}
			>
				7
			</div>
			<Chip fontSize={34}>sound effects to start</Chip>
		</div>
	);
};

const MoreComing: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: 110,
			top: 690,
			display: 'flex',
			gap: 14,
		}}
	>
		{['+ more', '+ more', '+ more'].map((t, i) => (
			<Pop key={i} delay={i * 5} rotate={i % 2 === 0 ? -6 : 6}>
				<Chip background={colors.ink} color={colors.paper} fontSize={32}>
					{t}
				</Chip>
			</Pop>
		))}
	</div>
);

const CallForSources: React.FC = () => (
	<Panel>
		<Pop from="up" delay={8}>
			<div
				style={{
					width: 760,
					backgroundColor: colors.paper,
					borderRadius: 40,
					padding: '46px 50px',
					boxSizing: 'border-box',
					boxShadow: '0 30px 70px rgba(10,16,32,0.18)',
					display: 'flex',
					flexDirection: 'column',
					gap: 22,
				}}
			>
				<div
					style={{
						width: 96,
						height: 96,
						borderRadius: 28,
						backgroundColor: accents.soundEffects,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<ChatIcon size={56} color={colors.paper} />
				</div>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 62,
						lineHeight: 1.05,
						letterSpacing: '-0.03em',
						color: colors.ink,
					}}
				>
					Know where to find great free sound effects?
				</div>
				<div style={{fontFamily: mono, fontSize: 28, color: colors.muted}}>
					Freely available to anybody
				</div>
			</div>
		</Pop>
		<Pop delay={216} from="up">
			<Chip
				background={colors.blue}
				color={colors.paper}
				fontSize={40}
				style={{padding: '20px 38px 22px'}}
			>
				Let us know →
			</Chip>
		</Pop>
	</Panel>
);

const SoundEffectsSourceInner = () => {
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
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
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
					'free',
					'attribution',
					'hotlink',
					'loudness',
					'seven',
					'anybody',
				]}
				captions={[
					// @captions whats3
					{
						text: 'Sound',
						startMs: 3273.333333,
						endMs: 3449.333333,
						timestampMs: 3361.333333,
						confidence: null,
					},
					{
						text: ' effects.',
						startMs: 3449.333333,
						endMs: 4161.333333,
						timestampMs: 3805.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Unfortunately,',
						startMs: 4443.333333,
						endMs: 4807.333333,
						timestampMs: 4625.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' AI',
						startMs: 5148.333333,
						endMs: 5558.333333,
						timestampMs: 5353.333333,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 5558.333333,
						endMs: 5831.333333,
						timestampMs: 5695.333333,
						confidence: null,
					},
					{
						text: ' pretty',
						startMs: 5831.333333,
						endMs: 6127.333333,
						timestampMs: 5979.333333,
						confidence: null,
					},
					{
						text: ' bad',
						startMs: 6127.333333,
						endMs: 6378.333333,
						timestampMs: 6253.333333,
						confidence: null,
					},
					{
						text: ' at',
						startMs: 6378.333333,
						endMs: 6810.333333,
						timestampMs: 6594.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' finding',
						startMs: 6810.333333,
						endMs: 7174.333333,
						timestampMs: 6992.333333,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 7174.333333,
						endMs: 7675.333333,
						timestampMs: 7425.333333,
						confidence: null,
					},
					{
						text: ' online,',
						startMs: 7675.333333,
						endMs: 8153.333333,
						timestampMs: 7914.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' so',
						startMs: 8622,
						endMs: 9022,
						timestampMs: 8822,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 9321,
						endMs: 9425,
						timestampMs: 9373,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 9425,
						endMs: 9736,
						timestampMs: 9581,
						confidence: null,
					},
					{
						text: ' making',
						startMs: 9736,
						endMs: 10012,
						timestampMs: 9874,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 10012,
						endMs: 10443,
						timestampMs: 10228,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' own',
						startMs: 10443,
						endMs: 10892,
						timestampMs: 10668,
						confidence: null,
					},
					{
						text: ' library',
						startMs: 10892,
						endMs: 11168,
						timestampMs: 11030,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 11168,
						endMs: 11392,
						timestampMs: 11280,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 11392,
						endMs: 11720,
						timestampMs: 11556,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 11720,
						endMs: 12203,
						timestampMs: 11962,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' that',
						startMs: 12618,
						endMs: 12752,
						timestampMs: 12685,
						confidence: null,
					},
					{
						text: ' anybody',
						startMs: 12959,
						endMs: 13238,
						timestampMs: 13099,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 13238,
						endMs: 13556,
						timestampMs: 13397,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 13556,
						endMs: 13914,
						timestampMs: 13735,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 14177,
						endMs: 14538,
						timestampMs: 14358,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' free',
						startMs: 14538,
						endMs: 14839,
						timestampMs: 14689,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 14839,
						endMs: 15180,
						timestampMs: 15010,
						confidence: null,
					},
					{
						text: ' no',
						startMs: 15180,
						endMs: 15963,
						timestampMs: 15572,
						confidence: null,
					},
					{
						text: ' attribution',
						startMs: 15963,
						endMs: 16726,
						timestampMs: 16345,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' required.',
						startMs: 16726,
						endMs: 16906,
						timestampMs: 16816,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 17860,
						endMs: 18034,
						timestampMs: 17947,
						confidence: null,
					},
					{
						text: ' host',
						startMs: 18034,
						endMs: 18174,
						timestampMs: 18104,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 18174,
						endMs: 18331,
						timestampMs: 18253,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 18331,
						endMs: 18716,
						timestampMs: 18524,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 18716,
						endMs: 19048,
						timestampMs: 18882,
						confidence: null,
					},
					{
						text: ' domain,',
						startMs: 19048,
						endMs: 19240,
						timestampMs: 19144,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' you',
						startMs: 19432,
						endMs: 19572,
						timestampMs: 19502,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 19572,
						endMs: 19747,
						timestampMs: 19660,
						confidence: null,
					},
					{
						text: ' just',
						startMs: 19747,
						endMs: 20061,
						timestampMs: 19904,
						confidence: null,
					},
					{
						text: ' hotlink',
						startMs: 20061,
						endMs: 20376,
						timestampMs: 20219,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 20376,
						endMs: 20551,
						timestampMs: 20464,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 20551,
						endMs: 20918,
						timestampMs: 20735,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 20918,
						endMs: 21477,
						timestampMs: 21198,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 22011.666666,
						endMs: 22136.666666,
						timestampMs: 22074.666666,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 22136.666666,
						endMs: 22458.666666,
						timestampMs: 22297.666666,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 22458.666666,
						endMs: 22708.666666,
						timestampMs: 22583.666666,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 22708.666666,
						endMs: 22994.666666,
						timestampMs: 22851.666666,
						confidence: null,
					},
					{
						text: ' sure',
						startMs: 22994.666666,
						endMs: 23458.666666,
						timestampMs: 23226.666666,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 23458.666666,
						endMs: 23780.666666,
						timestampMs: 23619.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' all',
						startMs: 23780.666666,
						endMs: 23922.666666,
						timestampMs: 23851.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 23922.666666,
						endMs: 24065.666666,
						timestampMs: 23994.666666,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 24065.666666,
						endMs: 24315.666666,
						timestampMs: 24190.666666,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 24315.666666,
						endMs: 24512.666666,
						timestampMs: 24414.666666,
						confidence: null,
					},
					{
						text: ' have',
						startMs: 24512.666666,
						endMs: 24637.666666,
						timestampMs: 24575.666666,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 24690.666666,
						endMs: 24750.666666,
						timestampMs: 24720.666666,
						confidence: null,
					},
					{
						text: ' same',
						startMs: 25101.666666,
						endMs: 25548.666666,
						timestampMs: 25325.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' loudness',
						startMs: 25548.666666,
						endMs: 26369.666666,
						timestampMs: 25959.666666,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 26929.333333,
						endMs: 27053.333333,
						timestampMs: 26991.333333,
						confidence: null,
					},
					{
						text: ' get',
						startMs: 27053.333333,
						endMs: 27186.333333,
						timestampMs: 27120.333333,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 27186.333333,
						endMs: 27461.333333,
						timestampMs: 27324.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' standardized',
						startMs: 27702.333333,
						endMs: 28113.333333,
						timestampMs: 27908.333333,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 28113.333333,
						endMs: 28341.333333,
						timestampMs: 28227.333333,
						confidence: null,
					},
					{
						text: ' well.',
						startMs: 28341.333333,
						endMs: 28935.333333,
						timestampMs: 28638.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' For',
						startMs: 29878.333333,
						endMs: 30150.333333,
						timestampMs: 30014.333333,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 30150.333333,
						endMs: 30385.333333,
						timestampMs: 30268.333333,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 30385.333333,
						endMs: 30621.333333,
						timestampMs: 30503.333333,
						confidence: null,
					},
					{
						text: ' start',
						startMs: 30621.333333,
						endMs: 30802.333333,
						timestampMs: 30712.333333,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 30802.333333,
						endMs: 31164.333333,
						timestampMs: 30983.333333,
						confidence: null,
					},
					{
						text: ' only',
						startMs: 31164.333333,
						endMs: 31544.333333,
						timestampMs: 31354.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' seven',
						startMs: 31544.333333,
						endMs: 31604.333333,
						timestampMs: 31574.333333,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 31798.333333,
						endMs: 32070.333333,
						timestampMs: 31934.333333,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 32070.333333,
						endMs: 32323.333333,
						timestampMs: 32197.333333,
						confidence: null,
					},
					{
						text: ' but',
						startMs: 32323.333333,
						endMs: 32486.333333,
						timestampMs: 32405.333333,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 32486.333333,
						endMs: 32686.333333,
						timestampMs: 32586.333333,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 32686.333333,
						endMs: 32976.333333,
						timestampMs: 32831.333333,
						confidence: null,
					},
					{
						text: ' looking',
						startMs: 32976.333333,
						endMs: 33229.333333,
						timestampMs: 33103.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' to',
						startMs: 33229.333333,
						endMs: 33573.333333,
						timestampMs: 33401.333333,
						confidence: null,
					},
					{
						text: ' add',
						startMs: 33573.333333,
						endMs: 33917.333333,
						timestampMs: 33745.333333,
						confidence: null,
					},
					{
						text: ' more',
						startMs: 33917.333333,
						endMs: 34461.333333,
						timestampMs: 34189.333333,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 34907.333333,
						endMs: 35101.333333,
						timestampMs: 35004.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' if',
						startMs: 35301.333333,
						endMs: 35640.333333,
						timestampMs: 35471.333333,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 35640.333333,
						endMs: 36234.333333,
						timestampMs: 35937.333333,
						confidence: null,
					},
					{
						text: ' know',
						startMs: 36234.333333,
						endMs: 36539.333333,
						timestampMs: 36387.333333,
						confidence: null,
					},
					{
						text: ' how',
						startMs: 36539.333333,
						endMs: 36760.333333,
						timestampMs: 36650.333333,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 36760.333333,
						endMs: 37014.333333,
						timestampMs: 36887.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' source',
						startMs: 37014.333333,
						endMs: 37489.333333,
						timestampMs: 37252.333333,
						confidence: null,
					},
					{
						text: ' good',
						startMs: 37984.333333,
						endMs: 38230.333333,
						timestampMs: 38107.333333,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 38476.333333,
						endMs: 38860.333333,
						timestampMs: 38668.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' effects',
						startMs: 38860.333333,
						endMs: 39367.333333,
						timestampMs: 39114.333333,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 39830.333333,
						endMs: 39977.333333,
						timestampMs: 39904.333333,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 39977.333333,
						endMs: 40124.333333,
						timestampMs: 40051.333333,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 40124.333333,
						endMs: 40304.333333,
						timestampMs: 40214.333333,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 40304.333333,
						endMs: 40598.333333,
						timestampMs: 40451.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' freely',
						startMs: 40598.333333,
						endMs: 41006.333333,
						timestampMs: 40802.333333,
						confidence: null,
					},
					{
						text: ' available',
						startMs: 41006.333333,
						endMs: 41202.333333,
						timestampMs: 41104.333333,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 41202.333333,
						endMs: 41545.333333,
						timestampMs: 41374.333333,
						confidence: null,
					},
					{
						text: ' anybody',
						startMs: 41545.333333,
						endMs: 42150.333333,
						timestampMs: 41848.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' then',
						startMs: 42702.333333,
						endMs: 42848.333333,
						timestampMs: 42775.333333,
						confidence: null,
					},
					{
						text: ' please',
						startMs: 42848.333333,
						endMs: 42994.333333,
						timestampMs: 42921.333333,
						confidence: null,
					},
					{
						text: ' let',
						startMs: 42994.333333,
						endMs: 43054.333333,
						timestampMs: 43024.333333,
						confidence: null,
					},
					{
						text: ' us',
						startMs: 43045.333333,
						endMs: 43148.333333,
						timestampMs: 43097.333333,
						confidence: null,
					},
					{
						text: ' know.',
						startMs: 43148.333333,
						endMs: 43871.333333,
						timestampMs: 43510.333333,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const SoundEffectsSource = Interactive.create({
	Component: SoundEffectsSourceInner,
	layout: 'absolute-fill',
});

const SoundEffectsSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent={accents.soundEffects} />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="AI is bad at finding them"
						durationInFrames={154}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<SoundEffectsSource trimBefore={94} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Our own library"
						durationInFrames={256}
						premountFor={30}
					>
						<ShotFraming zoom={1.14}>
							<SoundEffectsSource trimBefore={256} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Hotlink"
						durationInFrames={114}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<SoundEffectsSource trimBefore={533} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Same loudness"
						durationInFrames={136}
						premountFor={30}
					>
						<ShotFraming zoom={1.16}>
							<SoundEffectsSource trimBefore={658} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Standardized"
						durationInFrames={68}
						premountFor={30}
					>
						<ShotFraming zoom={1.04}>
							<SoundEffectsSource trimBefore={805} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Seven to start"
						durationInFrames={373}
						premountFor={30}
					>
						<ShotFraming zoom={1.2}>
							<SoundEffectsSource trimBefore={894} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Let us know"
						durationInFrames={51}
						premountFor={30}
					>
						<ShotFraming zoom={1.04}>
							<SoundEffectsSource trimBefore={1279} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

			<Sequence name="Chapter sticker" from={2} durationInFrames={52}>
				<ChapterSticker
					index="02"
					title="Sound effects"
					accent={accents.soundEffects}
				/>
			</Sequence>
			<Sequence name="AI search fail" from={40} durationInFrames={114}>
				<AiSearchFail />
			</Sequence>
			<Sequence name="Library" from={154} durationInFrames={256}>
				<Library />
			</Sequence>
			<Sequence name="Hotlink" from={410} durationInFrames={114}>
				<Hotlink />
			</Sequence>
			<Sequence name="Loudness" from={524} durationInFrames={202}>
				<Loudness />
			</Sequence>
			<Sequence name="Seven" from={770} durationInFrames={112}>
				<SevenCallout />
			</Sequence>
			<Sequence name="More coming" from={838} durationInFrames={44}>
				<MoreComing />
			</Sequence>
			<Sequence name="Call for sources" from={884} durationInFrames={268}>
				<CallForSources />
			</Sequence>

			<Track name="Sound effects">
				<Audio
					durationInFrames={42}
					name="Sticker ding"
					src="https://remotion.media/ding.wav"
					from={2}
					volume={0.22}
				/>
				<Audio
					durationInFrames={30}
					name="Error"
					src="https://remotion.media/windows-xp-error.wav"
					from={124}
					volume={0.2}
				/>
				<Audio
					durationInFrames={5}
					name="Library whoosh"
					src="https://remotion.media/whoosh.wav"
					from={188}
					volume={0.22}
				/>
				<Audio
					durationInFrames={12}
					name="Library page turn"
					src="https://remotion.media/page-turn.wav"
					from={206}
					volume={0.3}
				/>
				<Audio
					durationInFrames={15}
					name="Free stamp"
					src="https://remotion.media/shutter-modern.wav"
					from={334}
					volume={0.22}
				/>
				<Audio
					durationInFrames={5}
					name="Hotlinked whoosh"
					src="https://remotion.media/whoosh.wav"
					from={504}
					volume={0.4}
				/>
				<Audio
					durationInFrames={42}
					name="Standardized ding"
					src="https://remotion.media/ding.wav"
					from={686}
					volume={0.2}
				/>
				<Audio
					durationInFrames={12}
					name="Seven pop"
					src="https://remotion.media/mouse-click.wav"
					from={778}
					volume={0.35}
				/>
				<Audio
					durationInFrames={6}
					name="Back to split"
					src="https://remotion.media/whip.wav"
					from={880}
					volume={0.16}
				/>
			</Track>
			<Track name="Overlapping sound effects">
				<Audio
					durationInFrames={6}
					name="Split whip"
					src="https://remotion.media/whip.wav"
					from={32}
					volume={0.16}
				/>
			</Track>
		</>
	);
};

export const SoundEffectsScene = Interactive.create({
	Component: SoundEffectsSceneInner,
	layout: 'absolute-fill',
});
