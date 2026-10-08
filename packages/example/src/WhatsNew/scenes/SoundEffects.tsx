import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
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

export const SoundEffectsScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.soundEffects} />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="AI is bad at finding them"
						durationInFrames={154}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={94}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Our own library"
						durationInFrames={256}
						premountFor={30}
					>
						<Punch zoom={1.14}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={256}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Hotlink"
						durationInFrames={114}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={533}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Same loudness"
						durationInFrames={136}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={658}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Standardized"
						durationInFrames={68}
						premountFor={30}
					>
						<Punch zoom={1.04}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={805}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Seven to start"
						durationInFrames={373}
						premountFor={30}
					>
						<Punch zoom={1.2}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={894}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Let us know"
						durationInFrames={51}
						premountFor={30}
					>
						<Punch zoom={1.04}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats3.mp4'
								}
								trimBefore={1279}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

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

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
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
						startMs: 140,
						endMs: 316,
						timestampMs: 228,
						confidence: null,
					},
					{
						text: ' effects.',
						startMs: 316,
						endMs: 1028,
						timestampMs: 672,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' Unfortunately,',
						startMs: 1310,
						endMs: 1674,
						timestampMs: 1492,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' AI',
						startMs: 2015,
						endMs: 2425,
						timestampMs: 2220,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 2425,
						endMs: 2698,
						timestampMs: 2562,
						confidence: null,
					},
					{
						text: ' pretty',
						startMs: 2698,
						endMs: 2994,
						timestampMs: 2846,
						confidence: null,
					},
					{
						text: ' bad',
						startMs: 2994,
						endMs: 3245,
						timestampMs: 3120,
						confidence: null,
					},
					{
						text: ' at',
						startMs: 3245,
						endMs: 3677,
						timestampMs: 3461,
						confidence: null,
					},
					{
						text: ' finding',
						startMs: 3677,
						endMs: 4041,
						timestampMs: 3859,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 4041,
						endMs: 4542,
						timestampMs: 4292,
						confidence: null,
					},
					{
						text: ' online,',
						startMs: 4542,
						endMs: 5020,
						timestampMs: 4781,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' so',
						startMs: 5222,
						endMs: 5622,
						timestampMs: 5422,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 5921,
						endMs: 6025,
						timestampMs: 5973,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 6025,
						endMs: 6336,
						timestampMs: 6181,
						confidence: null,
					},
					{
						text: ' making',
						startMs: 6336,
						endMs: 6612,
						timestampMs: 6474,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 6612,
						endMs: 7043,
						timestampMs: 6828,
						confidence: null,
					},
					{
						text: ' own',
						startMs: 7043,
						endMs: 7492,
						timestampMs: 7268,
						confidence: null,
					},
					{
						text: ' library',
						startMs: 7492,
						endMs: 7768,
						timestampMs: 7630,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 7768,
						endMs: 7992,
						timestampMs: 7880,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 7992,
						endMs: 8320,
						timestampMs: 8156,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 8320,
						endMs: 8803,
						timestampMs: 8562,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 9218,
						endMs: 9352,
						timestampMs: 9285,
						confidence: null,
					},
					{
						text: ' anybody',
						startMs: 9559,
						endMs: 9838,
						timestampMs: 9699,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 9838,
						endMs: 10156,
						timestampMs: 9997,
						confidence: null,
					},
					{
						text: ' use',
						startMs: 10156,
						endMs: 10514,
						timestampMs: 10335,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 10777,
						endMs: 11138,
						timestampMs: 10958,
						confidence: null,
					},
					{
						text: ' free',
						startMs: 11138,
						endMs: 11439,
						timestampMs: 11289,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 11439,
						endMs: 11780,
						timestampMs: 11610,
						confidence: null,
					},
					{
						text: ' no',
						startMs: 11780,
						endMs: 12563,
						timestampMs: 12172,
						confidence: null,
					},
					{
						text: ' attribution',
						startMs: 12563,
						endMs: 13326,
						timestampMs: 12945,
						confidence: null,
					},
					{
						text: ' required.',
						startMs: 13326,
						endMs: 13506,
						timestampMs: 13416,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 13760,
						endMs: 13934,
						timestampMs: 13847,
						confidence: null,
					},
					{
						text: ' host',
						startMs: 13934,
						endMs: 14074,
						timestampMs: 14004,
						confidence: null,
					},
					{
						text: ' them',
						startMs: 14074,
						endMs: 14231,
						timestampMs: 14153,
						confidence: null,
					},
					{
						text: ' on',
						startMs: 14231,
						endMs: 14616,
						timestampMs: 14424,
						confidence: null,
					},
					{
						text: ' our',
						startMs: 14616,
						endMs: 14948,
						timestampMs: 14782,
						confidence: null,
					},
					{
						text: ' domain,',
						startMs: 14948,
						endMs: 15140,
						timestampMs: 15044,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' you',
						startMs: 15332,
						endMs: 15472,
						timestampMs: 15402,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 15472,
						endMs: 15647,
						timestampMs: 15560,
						confidence: null,
					},
					{
						text: ' just',
						startMs: 15647,
						endMs: 15961,
						timestampMs: 15804,
						confidence: null,
					},
					{
						text: ' hotlink',
						startMs: 15961,
						endMs: 16276,
						timestampMs: 16119,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 16276,
						endMs: 16451,
						timestampMs: 16364,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 16451,
						endMs: 16818,
						timestampMs: 16635,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 16818,
						endMs: 17377,
						timestampMs: 17098,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 17545,
						endMs: 17670,
						timestampMs: 17608,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 17670,
						endMs: 17992,
						timestampMs: 17831,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 17992,
						endMs: 18242,
						timestampMs: 18117,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 18242,
						endMs: 18528,
						timestampMs: 18385,
						confidence: null,
					},
					{
						text: ' sure',
						startMs: 18528,
						endMs: 18992,
						timestampMs: 18760,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 18992,
						endMs: 19314,
						timestampMs: 19153,
						confidence: null,
					},
					{
						text: ' all',
						startMs: 19314,
						endMs: 19456,
						timestampMs: 19385,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 19456,
						endMs: 19599,
						timestampMs: 19528,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 19599,
						endMs: 19849,
						timestampMs: 19724,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 19849,
						endMs: 20046,
						timestampMs: 19948,
						confidence: null,
					},
					{
						text: ' have',
						startMs: 20046,
						endMs: 20171,
						timestampMs: 20109,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 20224,
						endMs: 20284,
						timestampMs: 20254,
						confidence: null,
					},
					{
						text: ' same',
						startMs: 20635,
						endMs: 21082,
						timestampMs: 20859,
						confidence: null,
					},
					{
						text: ' loudness',
						startMs: 21082,
						endMs: 21903,
						timestampMs: 21493,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 22096,
						endMs: 22220,
						timestampMs: 22158,
						confidence: null,
					},
					{
						text: ' get',
						startMs: 22220,
						endMs: 22353,
						timestampMs: 22287,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 22353,
						endMs: 22628,
						timestampMs: 22491,
						confidence: null,
					},
					{
						text: ' standardized',
						startMs: 22869,
						endMs: 23280,
						timestampMs: 23075,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 23280,
						endMs: 23508,
						timestampMs: 23394,
						confidence: null,
					},
					{
						text: ' well.',
						startMs: 23508,
						endMs: 24102,
						timestampMs: 23805,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' For',
						startMs: 24345,
						endMs: 24617,
						timestampMs: 24481,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 24617,
						endMs: 24852,
						timestampMs: 24735,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 24852,
						endMs: 25088,
						timestampMs: 24970,
						confidence: null,
					},
					{
						text: ' start',
						startMs: 25088,
						endMs: 25269,
						timestampMs: 25179,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 25269,
						endMs: 25631,
						timestampMs: 25450,
						confidence: null,
					},
					{
						text: ' only',
						startMs: 25631,
						endMs: 26011,
						timestampMs: 25821,
						confidence: null,
					},
					{
						text: ' seven',
						startMs: 26011,
						endMs: 26071,
						timestampMs: 26041,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 26265,
						endMs: 26537,
						timestampMs: 26401,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 26537,
						endMs: 26790,
						timestampMs: 26664,
						confidence: null,
					},
					{
						text: ' but',
						startMs: 26790,
						endMs: 26953,
						timestampMs: 26872,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 26953,
						endMs: 27153,
						timestampMs: 27053,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 27153,
						endMs: 27443,
						timestampMs: 27298,
						confidence: null,
					},
					{
						text: ' looking',
						startMs: 27443,
						endMs: 27696,
						timestampMs: 27570,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 27696,
						endMs: 28040,
						timestampMs: 27868,
						confidence: null,
					},
					{
						text: ' add',
						startMs: 28040,
						endMs: 28384,
						timestampMs: 28212,
						confidence: null,
					},
					{
						text: ' more',
						startMs: 28384,
						endMs: 28928,
						timestampMs: 28656,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 29374,
						endMs: 29568,
						timestampMs: 29471,
						confidence: null,
					},
					{
						text: ' if',
						startMs: 29768,
						endMs: 30107,
						timestampMs: 29938,
						confidence: null,
					},
					{
						text: ' you',
						startMs: 30107,
						endMs: 30701,
						timestampMs: 30404,
						confidence: null,
					},
					{
						text: ' know',
						startMs: 30701,
						endMs: 31006,
						timestampMs: 30854,
						confidence: null,
					},
					{
						text: ' how',
						startMs: 31006,
						endMs: 31227,
						timestampMs: 31117,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 31227,
						endMs: 31481,
						timestampMs: 31354,
						confidence: null,
					},
					{
						text: ' source',
						startMs: 31481,
						endMs: 31956,
						timestampMs: 31719,
						confidence: null,
					},
					{
						text: ' good',
						startMs: 32451,
						endMs: 32697,
						timestampMs: 32574,
						confidence: null,
					},
					{
						text: ' sound',
						startMs: 32943,
						endMs: 33327,
						timestampMs: 33135,
						confidence: null,
					},
					{
						text: ' effects',
						startMs: 33327,
						endMs: 33834,
						timestampMs: 33581,
						confidence: null,
					},
					{
						text: ' that',
						startMs: 34297,
						endMs: 34444,
						timestampMs: 34371,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 34444,
						endMs: 34591,
						timestampMs: 34518,
						confidence: null,
					},
					{
						text: ' can',
						startMs: 34591,
						endMs: 34771,
						timestampMs: 34681,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 34771,
						endMs: 35065,
						timestampMs: 34918,
						confidence: null,
					},
					{
						text: ' freely',
						startMs: 35065,
						endMs: 35473,
						timestampMs: 35269,
						confidence: null,
					},
					{
						text: ' available',
						startMs: 35473,
						endMs: 35669,
						timestampMs: 35571,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 35669,
						endMs: 36012,
						timestampMs: 35841,
						confidence: null,
					},
					{
						text: ' anybody',
						startMs: 36012,
						endMs: 36617,
						timestampMs: 36315,
						confidence: null,
					},
					{
						text: ' then',
						startMs: 36769,
						endMs: 36915,
						timestampMs: 36842,
						confidence: null,
					},
					{
						text: ' please',
						startMs: 36915,
						endMs: 37061,
						timestampMs: 36988,
						confidence: null,
					},
					{
						text: ' let',
						startMs: 37061,
						endMs: 37121,
						timestampMs: 37091,
						confidence: null,
					},
					{
						text: ' us',
						startMs: 37112,
						endMs: 37215,
						timestampMs: 37164,
						confidence: null,
					},
					{
						text: ' know.',
						startMs: 37215,
						endMs: 37938,
						timestampMs: 37577,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>

			<Audio
				name="Sticker ding"
				src="https://remotion.media/ding.wav"
				from={2}
				volume={0.22}
			/>
			<Audio
				name="Split whip"
				src="https://remotion.media/whip.wav"
				from={32}
				volume={0.16}
			/>
			<Audio
				name="Error"
				src="https://remotion.media/windows-xp-error.wav"
				from={124}
				volume={0.2}
			/>
			<Audio
				name="Library whoosh"
				src="https://remotion.media/whoosh.wav"
				from={188}
				volume={0.22}
			/>
			<Audio
				name="Library page turn"
				src="https://remotion.media/page-turn.wav"
				from={206}
				volume={0.3}
			/>
			<Audio
				name="Free stamp"
				src="https://remotion.media/shutter-modern.wav"
				from={334}
				volume={0.22}
			/>
			<Audio
				name="Hotlinked whoosh"
				src="https://remotion.media/whoosh.wav"
				from={504}
				volume={0.4}
			/>
			<Audio
				name="Standardized ding"
				src="https://remotion.media/ding.wav"
				from={686}
				volume={0.2}
			/>
			<Audio
				name="Seven pop"
				src="https://remotion.media/mouse-click.wav"
				from={778}
				volume={0.35}
			/>
			<Audio
				name="Back to split"
				src="https://remotion.media/whip.wav"
				from={880}
				volume={0.16}
			/>
		</AbsoluteFill>
	);
};
