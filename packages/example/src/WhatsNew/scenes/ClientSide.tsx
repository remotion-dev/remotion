import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {pop} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {BrowserIcon, CheckIcon} from '../components/icons';
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
	Label,
	Panel,
	Pop,
	Stamp,
} from '../components/ui';
import {display, mono} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 98, layout: 'split'},
	{at: 664, layout: 'full'},
];

const BrowserRender: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [40, 190], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const done = progress >= 1;
	const bounce = Math.abs(Math.sin(frame / 9));
	return (
		<Panel style={{gap: 28}}>
			<Pop from="up" delay={4}>
				<div
					style={{
						width: 800,
						borderRadius: 26,
						overflow: 'hidden',
						backgroundColor: colors.paper,
						boxShadow: '0 30px 70px rgba(10,16,32,0.2)',
					}}
				>
					<div
						style={{
							height: 62,
							backgroundColor: '#F1F4F9',
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							padding: '0 22px',
							borderBottom: `1px solid ${colors.line}`,
						}}
					>
						{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
							<div
								key={c}
								style={{
									width: 15,
									height: 15,
									borderRadius: 8,
									backgroundColor: c,
								}}
							/>
						))}
						<div
							style={{
								marginLeft: 20,
								flex: 1,
								height: 38,
								borderRadius: 19,
								backgroundColor: colors.paper,
								border: `1px solid ${colors.line}`,
								display: 'flex',
								alignItems: 'center',
								padding: '0 18px',
								fontFamily: mono,
								fontSize: 20,
								color: colors.muted,
							}}
						>
							localhost:3000
						</div>
					</div>
					<div
						style={{
							height: 300,
							background: 'linear-gradient(135deg, #EAF4FF, #F6F0FF)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							position: 'relative',
						}}
					>
						<RemotionLogo
							size={130}
							style={{translate: `0px ${-40 * bounce}px`}}
						/>
						<div
							style={{
								position: 'absolute',
								bottom: 40,
								width: 120 - 40 * bounce,
								height: 14,
								borderRadius: 7,
								backgroundColor: 'rgba(11,15,25,0.12)',
							}}
						/>
					</div>
					<div style={{padding: '22px 28px 26px'}}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								fontFamily: display,
								fontWeight: 700,
								fontSize: 30,
								color: colors.ink,
								marginBottom: 14,
							}}
						>
							<span>
								{done
									? 'Rendered in your browser'
									: 'Rendering in your browser…'}
							</span>
							<span
								style={{
									fontFamily: mono,
									color: done ? colors.success : colors.blue,
								}}
							>
								{Math.round(progress * 100)}%
							</span>
						</div>
						<div
							style={{
								height: 16,
								borderRadius: 8,
								backgroundColor: colors.mist,
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									height: '100%',
									width: `${progress * 100}%`,
									borderRadius: 8,
									backgroundColor: done ? colors.success : colors.blue,
								}}
							/>
						</div>
					</div>
				</div>
			</Pop>
			<div style={{display: 'flex', gap: 20, alignItems: 'center'}}>
				<Pop delay={82} from="up">
					<Chip icon={<BrowserIcon size={34} color={colors.blue} />}>
						No server needed
					</Chip>
				</Pop>
				<Stamp color={accents.agents} delay={192} rotate={6} fontSize={40}>
					Experimental
				</Stamp>
			</div>
		</Panel>
	);
};

const renders = [
	{name: 'WhatsNew.mp4', start: 12, speed: 40},
	{name: 'Teaser.webm', start: 34, speed: 110},
	{name: 'Voiceover.wav', start: 58, speed: 150},
];

const RenderQueue: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Panel>
			<Pop from="up">
				<div
					style={{
						width: 800,
						borderRadius: 28,
						overflow: 'hidden',
						backgroundColor: '#1F2126',
						boxShadow: '0 30px 70px rgba(10,16,32,0.35)',
					}}
				>
					<div
						style={{
							display: 'flex',
							height: 70,
							borderBottom: '1px solid #33363D',
						}}
					>
						{['Inspector', 'Renders'].map((tab) => (
							<div
								key={tab}
								style={{
									flex: 1,
									display: 'flex',
									alignItems: 'center',
									padding: '0 28px',
									fontFamily: display,
									fontWeight: 500,
									fontSize: 28,
									color: tab === 'Renders' ? colors.paper : '#8A8F98',
									borderTop:
										tab === 'Renders'
											? `4px solid ${colors.blue}`
											: '4px solid transparent',
									backgroundColor: tab === 'Renders' ? '#1F2126' : '#2A2D33',
								}}
							>
								{tab}
							</div>
						))}
					</div>
					<div
						style={{
							padding: '18px 26px 26px',
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
						}}
					>
						{renders.map((r) => {
							const p = pop(frame, r.start, 12);
							const progress = interpolate(
								frame,
								[r.start + 16, r.start + 16 + r.speed],
								[0, 1],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							);
							const queued = frame < r.start + 16;
							const done = progress >= 1;
							return (
								<div
									key={r.name}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 20,
										padding: '18px 20px',
										borderRadius: 18,
										backgroundColor: '#2A2D33',
										opacity: Math.min(1, p * 2),
										translate: `${(1 - p) * 50}px 0px`,
									}}
								>
									<div style={{flex: 1}}>
										<div
											style={{
												fontFamily: mono,
												fontWeight: 600,
												fontSize: 28,
												color: colors.paper,
											}}
										>
											{r.name}
										</div>
										<div
											style={{
												marginTop: 10,
												height: 10,
												borderRadius: 5,
												backgroundColor: '#3A3E46',
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
									</div>
									<div
										style={{
											width: 130,
											textAlign: 'right',
											fontFamily: mono,
											fontSize: 24,
											color: done
												? colors.success
												: queued
													? '#8A8F98'
													: colors.paper,
										}}
									>
										{done
											? '✓ Done'
											: queued
												? 'Queued'
												: `${Math.round(progress * 100)}%`}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</Pop>
			<Pop delay={100} from="up">
				<Chip
					icon={<CheckIcon size={34} color={colors.success} strokeWidth={3} />}
				>
					Queue & track in the Studio
				</Chip>
			</Pop>
		</Panel>
	);
};

const FormatChip: React.FC<{
	readonly label: string;
	readonly isNew: boolean;
	readonly delay: number;
	readonly audio?: boolean;
}> = ({label, isNew, delay, audio}) => {
	const frame = useCurrentFrame();
	const p = pop(frame, delay, 11);
	return (
		<div
			style={{
				width: 180,
				height: 120,
				borderRadius: 24,
				backgroundColor: isNew
					? audio
						? accents.soundEffects
						: colors.blue
					: colors.paper,
				color: isNew ? colors.paper : colors.muted,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: display,
				fontWeight: 700,
				fontSize: 40,
				boxShadow: isNew
					? '0 18px 40px rgba(11,132,243,0.3)'
					: '0 10px 24px rgba(10,16,32,0.1)',
				opacity: Math.min(1, p * 2),
				scale: 0.6 + 0.4 * p,
				position: 'relative',
			}}
		>
			.{label.toLowerCase()}
			{isNew ? (
				<div
					style={{
						position: 'absolute',
						top: -14,
						right: -10,
						backgroundColor: colors.ink,
						color: colors.paper,
						fontSize: 18,
						letterSpacing: '0.1em',
						padding: '5px 10px',
						borderRadius: 8,
					}}
				>
					NEW
				</div>
			) : null}
		</div>
	);
};

const Formats: React.FC = () => (
	<Panel style={{gap: 26}}>
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
				New export formats
			</div>
		</Pop>
		<Label style={{alignSelf: 'flex-start', marginLeft: 22}}>Video</Label>
		<div style={{display: 'flex', gap: 18}}>
			<FormatChip label="MP4" isNew={false} delay={6} />
			<FormatChip label="WebM" isNew={false} delay={10} />
			<FormatChip label="MKV" isNew delay={60} />
			<FormatChip label="MOV" isNew delay={66} />
		</div>
		<Label style={{alignSelf: 'flex-start', marginLeft: 22, opacity: 1}}>
			Audio only
		</Label>
		<div style={{display: 'flex', gap: 18}}>
			<FormatChip label="WAV" isNew audio delay={138} />
			<FormatChip label="MP3" isNew audio delay={144} />
			<FormatChip label="AAC" isNew audio delay={150} />
			<FormatChip label="OGG" isNew audio delay={156} />
		</div>
	</Panel>
);

// Each property is rendered using the property it names.
const cssProperties: {label: string; style: React.CSSProperties}[] = [
	{
		label: 'text-shadow',
		style: {textShadow: '0 6px 0 #0B84F3, 0 12px 20px rgba(11,132,243,0.4)'},
	},
	{
		label: '-webkit-text-stroke',
		style: {WebkitTextStroke: '3px #0B0F19', color: '#FFFFFF'},
	},
	{
		label: 'paint-order',
		style: {
			WebkitTextStroke: '8px #0B84F3',
			paintOrder: 'stroke fill',
			color: '#FFFFFF',
		},
	},
	{label: 'font-style', style: {fontStyle: 'italic'}},
	{
		label: 'filter',
		style: {filter: 'hue-rotate(160deg) saturate(2)', color: '#FF5A36'},
	},
];

const CssProperties: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				right: 70,
				top: 150,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				gap: 18,
			}}
		>
			<Pop from="right">
				<Label
					color={colors.paper}
					style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}
				>
					Newly supported CSS
				</Label>
			</Pop>
			{cssProperties.map((prop, i) => {
				const p = pop(frame, 8 + i * 12, 11);
				const checkAt = 118 + i * 3;
				return (
					<div
						key={prop.label}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 16,
							padding: '16px 26px 18px',
							borderRadius: 24,
							backgroundColor: colors.paper,
							boxShadow: '0 18px 40px rgba(10,16,32,0.3)',
							opacity: Math.min(1, p * 2),
							translate: `${(1 - p) * -260}px ${(1 - p) * 40}px`,
							scale: 0.6 + 0.4 * p,
							transformOrigin: '100% 50%',
						}}
					>
						<div
							style={{
								fontFamily: mono,
								fontWeight: 600,
								fontSize: 38,
								color: colors.ink,
								...prop.style,
							}}
						>
							{prop.label}
						</div>
						{frame >= checkAt ? <CheckBadge delay={checkAt} size={48} /> : null}
					</div>
				);
			})}
		</div>
	);
};

export const ClientSideScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.clientSide} />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="Client-side rendering"
						durationInFrames={71}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats6.mp4'
								}
								trimBefore={65}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="In the browser"
						durationInFrames={258}
						premountFor={30}
					>
						<Punch zoom={1.14}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats6.mp4'
								}
								trimBefore={160}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Render queue"
						durationInFrames={160}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats6.mp4'
								}
								trimBefore={429}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="New formats"
						durationInFrames={107}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats6.mp4'
								}
								trimBefore={600}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Audio formats"
						durationInFrames={71}
						premountFor={30}
					>
						<Punch zoom={1.04}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats6.mp4'
								}
								trimBefore={718}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="CSS properties"
						durationInFrames={165}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats6.mp4'
								}
								trimBefore={800}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Chapter sticker" from={3} durationInFrames={98}>
				<ChapterSticker
					index="05"
					title="Client-side rendering"
					accent={accents.clientSide}
				/>
			</Sequence>
			<Sequence name="Browser render" from={104} durationInFrames={225}>
				<BrowserRender />
			</Sequence>
			<Sequence name="Render queue" from={329} durationInFrames={160}>
				<RenderQueue />
			</Sequence>
			<Sequence name="Formats" from={489} durationInFrames={178}>
				<Formats />
			</Sequence>
			<Sequence name="CSS properties" from={684} durationInFrames={148}>
				<CssProperties />
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={[
					'browser',
					'experimental',
					'queue',
					'multiple',
					'formats,',
					'audio',
					'css',
				]}
				captions={[
					// @captions whats6
					{
						text: 'Client-side',
						startMs: 151,
						endMs: 945,
						timestampMs: 548,
						confidence: null,
					},
					{
						text: ' rendering',
						startMs: 945,
						endMs: 1415,
						timestampMs: 1180,
						confidence: null,
					},
					{
						text: ' progress.',
						startMs: 1415,
						endMs: 2209,
						timestampMs: 1812,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 2436,
						endMs: 2546,
						timestampMs: 2491,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 2546,
						endMs: 2751,
						timestampMs: 2649,
						confidence: null,
					},
					{
						text: ' trying',
						startMs: 2751,
						endMs: 2909,
						timestampMs: 2830,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 2909,
						endMs: 3035,
						timestampMs: 2972,
						confidence: null,
					},
					{
						text: ' make',
						startMs: 3035,
						endMs: 3177,
						timestampMs: 3106,
						confidence: null,
					},
					{
						text: ' it',
						startMs: 3177,
						endMs: 3461,
						timestampMs: 3319,
						confidence: null,
					},
					{
						text: ' possible',
						startMs: 3461,
						endMs: 3697,
						timestampMs: 3579,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 3697,
						endMs: 3981,
						timestampMs: 3839,
						confidence: null,
					},
					{
						text: ' render',
						startMs: 3981,
						endMs: 4454,
						timestampMs: 4218,
						confidence: null,
					},
					{
						text: ' videos',
						startMs: 4454,
						endMs: 5053,
						timestampMs: 4754,
						confidence: null,
					},
					{
						text: ' purely',
						startMs: 5344,
						endMs: 5404,
						timestampMs: 5374,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 5720,
						endMs: 5898,
						timestampMs: 5809,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 5898,
						endMs: 6194,
						timestampMs: 6046,
						confidence: null,
					},
					{
						text: ' browser',
						startMs: 6194,
						endMs: 6650,
						timestampMs: 6422,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 6650,
						endMs: 6808,
						timestampMs: 6729,
						confidence: null,
					},
					{
						text: " we've",
						startMs: 6808,
						endMs: 7065,
						timestampMs: 6937,
						confidence: null,
					},
					{
						text: ' made',
						startMs: 7065,
						endMs: 7224,
						timestampMs: 7145,
						confidence: null,
					},
					{
						text: ' some',
						startMs: 7224,
						endMs: 7441,
						timestampMs: 7333,
						confidence: null,
					},
					{
						text: ' good',
						startMs: 7441,
						endMs: 7956,
						timestampMs: 7699,
						confidence: null,
					},
					{
						text: ' progress',
						startMs: 7956,
						endMs: 8530,
						timestampMs: 8243,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 8910,
						endMs: 9143,
						timestampMs: 9027,
						confidence: null,
					},
					{
						text: ' this',
						startMs: 9143,
						endMs: 9824,
						timestampMs: 9484,
						confidence: null,
					},
					{
						text: ' experimental',
						startMs: 9824,
						endMs: 10256,
						timestampMs: 10040,
						confidence: null,
					},
					{
						text: ' feature.',
						startMs: 10256,
						endMs: 10805,
						timestampMs: 10531,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' It',
						startMs: 11063,
						endMs: 11138,
						timestampMs: 11101,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 11138,
						endMs: 11198,
						timestampMs: 11168,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 11346,
						endMs: 11406,
						timestampMs: 11376,
						confidence: null,
					},
					{
						text: ' possible',
						startMs: 11704,
						endMs: 11987,
						timestampMs: 11846,
						confidence: null,
					},
					{
						text: ' to',
						startMs: 11987,
						endMs: 12157,
						timestampMs: 12072,
						confidence: null,
					},
					{
						text: ' queue',
						startMs: 12157,
						endMs: 12383,
						timestampMs: 12270,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 12383,
						endMs: 12742,
						timestampMs: 12563,
						confidence: null,
					},
					{
						text: ' track',
						startMs: 12742,
						endMs: 13459,
						timestampMs: 13101,
						confidence: null,
					},
					{
						text: ' multiple',
						startMs: 13459,
						endMs: 13874,
						timestampMs: 13667,
						confidence: null,
					},
					{
						text: ' renders',
						startMs: 13874,
						endMs: 14345,
						timestampMs: 14110,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 14345,
						endMs: 14553,
						timestampMs: 14449,
						confidence: null,
					},
					{
						text: ' the',
						startMs: 14553,
						endMs: 14779,
						timestampMs: 14666,
						confidence: null,
					},
					{
						text: ' Remotion',
						startMs: 14779,
						endMs: 15704,
						timestampMs: 15242,
						confidence: null,
					},
					{
						text: ' Studio,',
						startMs: 15704,
						endMs: 16194,
						timestampMs: 15949,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' we',
						startMs: 16372,
						endMs: 16553,
						timestampMs: 16463,
						confidence: null,
					},
					{
						text: ' added',
						startMs: 16553,
						endMs: 16866,
						timestampMs: 16710,
						confidence: null,
					},
					{
						text: ' support',
						startMs: 16916,
						endMs: 16982,
						timestampMs: 16949,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 17080,
						endMs: 17707,
						timestampMs: 17394,
						confidence: null,
					},
					{
						text: ' exporting',
						startMs: 17707,
						endMs: 18119,
						timestampMs: 17913,
						confidence: null,
					},
					{
						text: ' in',
						startMs: 18119,
						endMs: 18399,
						timestampMs: 18259,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 18399,
						endMs: 19025,
						timestampMs: 18712,
						confidence: null,
					},
					{
						text: ' formats,',
						startMs: 19233,
						endMs: 19768,
						timestampMs: 19501,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' including',
						startMs: 19931,
						endMs: 20347,
						timestampMs: 20139,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 20347,
						endMs: 20895,
						timestampMs: 20621,
						confidence: null,
					},
					{
						text: ' audio',
						startMs: 21109,
						endMs: 22146,
						timestampMs: 21628,
						confidence: null,
					},
					{
						text: ' formats',
						startMs: 22146,
						endMs: 22206,
						timestampMs: 22176,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 22298,
						endMs: 22598,
						timestampMs: 22448,
						confidence: null,
					},
					{
						text: ' also',
						startMs: 22598,
						endMs: 23055,
						timestampMs: 22827,
						confidence: null,
					},
					{
						text: ' these',
						startMs: 23404,
						endMs: 23744,
						timestampMs: 23574,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 23744,
						endMs: 24334,
						timestampMs: 24039,
						confidence: null,
					},
					{
						text: ' CSS',
						startMs: 24334,
						endMs: 24888,
						timestampMs: 24611,
						confidence: null,
					},
					{
						text: ' properties',
						startMs: 24888,
						endMs: 25568,
						timestampMs: 25228,
						confidence: null,
					},
					{
						text: ' are',
						startMs: 26044,
						endMs: 26208,
						timestampMs: 26126,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 26208,
						endMs: 26517,
						timestampMs: 26363,
						confidence: null,
					},
					{
						text: ' supported.',
						startMs: 26726,
						endMs: 27204,
						timestampMs: 26965,
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
				from={96}
				volume={0.16}
			/>
			<Audio
				name="Rendered ding"
				src="https://remotion.media/ding.wav"
				from={294}
				volume={0.2}
			/>
			<Audio
				name="Queue click"
				src="https://remotion.media/mouse-click.wav"
				from={341}
				volume={0.3}
			/>
			<Audio
				name="Formats switch"
				src="https://remotion.media/switch.wav"
				from={549}
				volume={0.22}
			/>
			<Audio
				name="Audio formats switch"
				src="https://remotion.media/switch.wav"
				from={627}
				volume={0.22}
			/>
			<Audio
				name="CSS whoosh"
				src="https://remotion.media/whoosh.wav"
				from={688}
				volume={0.28}
			/>
			<Audio
				name="Supported ding"
				src="https://remotion.media/ding.wav"
				from={802}
				volume={0.2}
			/>
		</AbsoluteFill>
	);
};
