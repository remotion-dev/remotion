import {Audio, Video} from '@remotion/media';
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {easeInOut, pop} from '../anim';
import {Backdrop} from '../components/Background';
import {PunchyCaptions} from '../components/Captions';
import {WaveBars} from '../components/fx';
import {BarsIcon, LayersIcon, MicIcon, ScissorsIcon} from '../components/icons';
import {RemotionLogo} from '../components/Logo';
import {
	getCaptionPlacement,
	Punch,
	Stage,
	type LayoutKeyframe,
} from '../components/Stage';
import {ChapterSticker, CheckBadge, Panel, Pop, Stamp} from '../components/ui';
import {display, mono} from '../fonts';
import {accents, colors} from '../theme';

const layout: LayoutKeyframe[] = [
	{at: 0, layout: 'full'},
	{at: 92, layout: 'split'},
];

// Maps a scene frame to the frame in whats5.mp4 that is audible at that time.
const sourceFrameAt = (sceneFrame: number) =>
	sceneFrame < 502 ? 503 + (sceneFrame - 358) : 663 + (sceneFrame - 502);

const VoiceSpectrum: React.FC<{readonly sourceFrame: number}> = ({
	sourceFrame,
}) => {
	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
		src: 'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4',
		frame: sourceFrame,
		fps: 30,
		windowInSeconds: 10,
	});
	const bars = audioData
		? visualizeAudio({
				fps: 30,
				frame: sourceFrame,
				audioData,
				numberOfSamples: 64,
				optimizeFor: 'speed',
				dataOffsetInSeconds,
			})
				.slice(1, 19)
				.map((v) =>
					Math.min(1, Math.max(0.04, (20 * Math.log10(v + 1e-6) + 78) / 58)),
				)
		: new Array(18).fill(0.05);

	return (
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 6, height: 120}}>
			{bars.map((v, i) => (
				<div
					key={i}
					style={{
						width: 14,
						height: 120 * v,
						borderRadius: 7,
						background: `linear-gradient(180deg, #7CF0C4, ${accents.skills})`,
					}}
				/>
			))}
		</div>
	);
};

const SilenceCut: React.FC = () => {
	const frame = useCurrentFrame();
	const cut = interpolate(frame, [24, 44], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeInOut,
	});
	return (
		<div style={{display: 'flex', alignItems: 'center', height: 120}}>
			<WaveBars seed="left" bars={9} height={96} color={accents.skills} />
			<div
				style={{
					width: 110 * cut,
					height: 96,
					margin: `0 ${6 * cut}px`,
					borderRadius: 12,
					border: `3px dashed ${colors.danger}`,
					backgroundColor: 'rgba(240,68,56,0.1)',
					opacity: cut,
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						height: 4,
						width: '80%',
						backgroundColor: colors.danger,
						borderRadius: 2,
					}}
				/>
			</div>
			<WaveBars seed="right" bars={9} height={96} color={accents.skills} />
		</div>
	);
};

const Checkerboard: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				width: 300,
				height: 120,
				borderRadius: 16,
				background:
					'repeating-conic-gradient(#D9DEE7 0% 25%, #FFFFFF 0% 50%) 50% / 26px 26px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<RemotionLogo
				size={80}
				style={{
					translate: `0px ${Math.sin(frame / 10) * 8}px`,
					rotate: `${Math.sin(frame / 16) * 8}deg`,
					filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.25))',
				}}
			/>
		</div>
	);
};

const SkillCard: React.FC<{
	readonly delay: number;
	readonly checkAt: number;
	readonly title: string;
	readonly tag: string;
	readonly file: string;
	readonly icon: React.ReactNode;
	readonly children: React.ReactNode;
}> = ({delay, checkAt, title, tag, file, icon, children}) => {
	const frame = useCurrentFrame();
	const p = pop(frame, delay, 12);
	const visible = frame >= delay;
	return (
		<div
			style={{
				width: 404,
				height: 372,
				borderRadius: 32,
				backgroundColor: visible ? colors.paper : 'rgba(255,255,255,0.45)',
				border: visible ? 'none' : `3px dashed ${colors.line}`,
				boxSizing: 'border-box',
				padding: '28px 28px 26px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				boxShadow: visible ? '0 22px 50px rgba(10,16,32,0.15)' : 'none',
				scale: visible ? 0.85 + 0.15 * p : 1,
				position: 'relative',
			}}
		>
			{visible ? (
				<>
					<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
						<div
							style={{
								width: 64,
								height: 64,
								borderRadius: 18,
								backgroundColor: accents.skills,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{icon}
						</div>
						<div
							style={{
								fontFamily: mono,
								fontWeight: 600,
								fontSize: 22,
								color: accents.skills,
								backgroundColor: '#E7F8F1',
								padding: '6px 12px',
								borderRadius: 10,
							}}
						>
							{tag}
						</div>
					</div>
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 42,
							lineHeight: 1.02,
							letterSpacing: '-0.02em',
							color: colors.ink,
						}}
					>
						{title}
					</div>
					<div style={{height: 120, display: 'flex', alignItems: 'center'}}>
						<Sequence from={delay} layout="none">
							{children}
						</Sequence>
					</div>
					<div style={{fontFamily: mono, fontSize: 22, color: colors.muted}}>
						{file}
					</div>
					{frame >= checkAt ? (
						<div style={{position: 'absolute', right: -14, top: -14}}>
							<CheckBadge delay={checkAt} size={62} />
						</div>
					) : null}
				</>
			) : null}
		</div>
	);
};

const SkillGrid: React.FC = () => {
	const frame = useCurrentFrame();
	// This sequence starts at scene frame 100.
	const sceneFrame = frame + 100;
	return (
		<Panel style={{gap: 22}}>
			<Pop from="up" style={{alignSelf: 'flex-start', marginLeft: 8}}>
				<div
					style={{
						fontFamily: display,
						fontWeight: 700,
						fontSize: 56,
						letterSpacing: '-0.03em',
						color: colors.ink,
					}}
				>
					New agent skills
				</div>
			</Pop>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '404px 404px',
					gap: 22,
				}}
			>
				<SkillCard
					delay={66}
					checkAt={427}
					title="Voiceovers"
					tag="ElevenLabs"
					file="voiceover.md"
					icon={<MicIcon size={38} color={colors.paper} />}
				>
					<WaveBars
						seed="voice"
						bars={30}
						height={96}
						color={accents.skills}
						live
					/>
				</SkillCard>
				<SkillCard
					delay={188}
					checkAt={434}
					title="Silence detection"
					tag="FFmpeg"
					file="silence-detection.md"
					icon={<ScissorsIcon size={36} color={colors.paper} />}
				>
					<SilenceCut />
				</SkillCard>
				<SkillCard
					delay={271}
					checkAt={445}
					title="Audio visualization"
					tag="media-utils"
					file="audio-visualization.md"
					icon={<BarsIcon size={38} color={colors.paper} />}
				>
					{frame >= 258 ? (
						<VoiceSpectrum sourceFrame={sourceFrameAt(sceneFrame)} />
					) : null}
				</SkillCard>
				<SkillCard
					delay={347}
					checkAt={460}
					title="Transparent videos"
					tag="ProRes · WebM"
					file="transparent-videos.md"
					icon={<LayersIcon size={38} color={colors.paper} />}
				>
					<Checkerboard />
				</SkillCard>
			</div>
		</Panel>
	);
};

export const SkillsScene: React.FC = () => {
	const frame = useCurrentFrame();
	const captions = getCaptionPlacement(frame, layout);

	return (
		<AbsoluteFill>
			<Backdrop accent={accents.skills} />
			<Stage keyframes={layout}>
				<Series>
					<Series.Sequence
						name="New skills"
						durationInFrames={34}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
								}
								trimBefore={87}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="What did not work"
						durationInFrames={129}
						premountFor={30}
					>
						<Punch zoom={1.14}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
								}
								trimBefore={135}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Voiceovers"
						durationInFrames={84}
						premountFor={30}
					>
						<Punch zoom={1}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
								}
								trimBefore={275}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="FFmpeg"
						durationInFrames={111}
						premountFor={30}
					>
						<Punch zoom={1.16}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
								}
								trimBefore={372}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Visualization and transparency"
						durationInFrames={144}
						premountFor={30}
					>
						<Punch zoom={1.02}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
								}
								trimBefore={503}
							/>
						</Punch>
					</Series.Sequence>
					<Series.Sequence
						name="Much smoother"
						durationInFrames={106}
						premountFor={30}
					>
						<Punch zoom={1.18}>
							<Video
								src={
									'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
								}
								trimBefore={663}
							/>
						</Punch>
					</Series.Sequence>
				</Series>
			</Stage>

			<Sequence name="Chapter sticker" from={2} durationInFrames={96}>
				<ChapterSticker index="04" title="New skills" accent={accents.skills} />
			</Sequence>
			<Sequence name="Skill grid" from={100} durationInFrames={508}>
				<SkillGrid />
			</Sequence>
			<Sequence name="Smoother stamp" from={566} durationInFrames={42}>
				<div
					style={{
						position: 'absolute',
						left: 500,
						top: 540,
						translate: '-50% -50%',
					}}
				>
					<Stamp color={accents.skills} rotate={-8} fontSize={80}>
						Much smoother
					</Stamp>
				</div>
			</Sequence>

			<PunchyCaptions
				width={captions.width}
				fontSize={captions.fontSize}
				style={captions.style}
				keywords={[
					'voiceovers',
					'elevenlabs,',
					'ffmpeg',
					'silence',
					'visualization',
					'transparent',
					'smoother.',
				]}
				captions={[
					// @captions whats5
					{
						text: 'New',
						startMs: 141,
						endMs: 418,
						timestampMs: 280,
						confidence: null,
					},
					{
						text: ' skills.',
						startMs: 418,
						endMs: 986,
						timestampMs: 702,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 1222,
						endMs: 1420,
						timestampMs: 1321,
						confidence: null,
					},
					{
						text: ' looked',
						startMs: 1420,
						endMs: 1667,
						timestampMs: 1544,
						confidence: null,
					},
					{
						text: ' at',
						startMs: 1667,
						endMs: 1832,
						timestampMs: 1750,
						confidence: null,
					},
					{
						text: ' what',
						startMs: 1832,
						endMs: 1931,
						timestampMs: 1882,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 1931,
						endMs: 2063,
						timestampMs: 1997,
						confidence: null,
					},
					{
						text: ' not',
						startMs: 2063,
						endMs: 2327,
						timestampMs: 2195,
						confidence: null,
					},
					{
						text: ' working',
						startMs: 2327,
						endMs: 2557,
						timestampMs: 2442,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 2557,
						endMs: 2805,
						timestampMs: 2681,
						confidence: null,
					},
					{
						text: ' well',
						startMs: 2805,
						endMs: 3184,
						timestampMs: 2995,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 3184,
						endMs: 3332,
						timestampMs: 3258,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 3332,
						endMs: 3563,
						timestampMs: 3448,
						confidence: null,
					},
					{
						text: ' wrote',
						startMs: 3563,
						endMs: 3826,
						timestampMs: 3695,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 3826,
						endMs: 4107,
						timestampMs: 3967,
						confidence: null,
					},
					{
						text: ' skills',
						startMs: 4107,
						endMs: 4519,
						timestampMs: 4313,
						confidence: null,
					},
					{
						text: ' for',
						startMs: 4519,
						endMs: 5343,
						timestampMs: 4931,
						confidence: null,
					},
					{
						text: ' generating',
						startMs: 5521,
						endMs: 5863,
						timestampMs: 5692,
						confidence: null,
					},
					{
						text: ' voiceovers',
						startMs: 5863,
						endMs: 6700,
						timestampMs: 6282,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 6700,
						endMs: 7137,
						timestampMs: 6919,
						confidence: null,
					},
					{
						text: ' ElevenLabs,',
						startMs: 7137,
						endMs: 8144,
						timestampMs: 7641,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' doing',
						startMs: 8304,
						endMs: 8856,
						timestampMs: 8580,
						confidence: null,
					},
					{
						text: ' tasks',
						startMs: 8856,
						endMs: 9163,
						timestampMs: 9010,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 9163,
						endMs: 9592,
						timestampMs: 9378,
						confidence: null,
					},
					{
						text: ' FFmpeg',
						startMs: 9592,
						endMs: 10185,
						timestampMs: 9889,
						confidence: null,
					},
					{
						text: ' such',
						startMs: 10185,
						endMs: 10430,
						timestampMs: 10308,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 10641,
						endMs: 10896,
						timestampMs: 10769,
						confidence: null,
					},
					{
						text: ' silence',
						startMs: 10896,
						endMs: 11279,
						timestampMs: 11088,
						confidence: null,
					},
					{
						text: ' detection,',
						startMs: 11279,
						endMs: 11848,
						timestampMs: 11564,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' doing',
						startMs: 12009,
						endMs: 12366,
						timestampMs: 12188,
						confidence: null,
					},
					{
						text: ' audio',
						startMs: 12366,
						endMs: 13060,
						timestampMs: 12713,
						confidence: null,
					},
					{
						text: ' visualization',
						startMs: 13060,
						endMs: 13961,
						timestampMs: 13511,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 14312,
						endMs: 14888,
						timestampMs: 14600,
						confidence: null,
					},
					{
						text: ' exporting',
						startMs: 14888,
						endMs: 15629,
						timestampMs: 15259,
						confidence: null,
					},
					{
						text: ' transparent',
						startMs: 15629,
						endMs: 16238,
						timestampMs: 15934,
						confidence: null,
					},
					{
						text: ' videos.',
						startMs: 16238,
						endMs: 16567,
						timestampMs: 16403,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' All',
						startMs: 16820,
						endMs: 16992,
						timestampMs: 16906,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 16992,
						endMs: 17164,
						timestampMs: 17078,
						confidence: null,
					},
					{
						text: ' these',
						startMs: 17164,
						endMs: 17559,
						timestampMs: 17362,
						confidence: null,
					},
					{
						text: ' tasks',
						startMs: 17559,
						endMs: 17799,
						timestampMs: 17679,
						confidence: null,
					},
					{
						text: ' should',
						startMs: 17799,
						endMs: 18160,
						timestampMs: 17980,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 18160,
						endMs: 18675,
						timestampMs: 18418,
						confidence: null,
					},
					{
						text: ' work',
						startMs: 18675,
						endMs: 18968,
						timestampMs: 18822,
						confidence: null,
					},
					{
						text: ' much',
						startMs: 18968,
						endMs: 19363,
						timestampMs: 19166,
						confidence: null,
					},
					{
						text: ' smoother.',
						startMs: 19363,
						endMs: 19947,
						timestampMs: 19655,
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
				from={90}
				volume={0.16}
			/>
			<Audio
				name="Card 1"
				src="https://remotion.media/mouse-click.wav"
				from={166}
				volume={0.3}
			/>
			<Audio
				name="Card 2"
				src="https://remotion.media/mouse-click.wav"
				from={288}
				volume={0.3}
			/>
			<Audio
				name="Card 3"
				src="https://remotion.media/mouse-click.wav"
				from={371}
				volume={0.3}
			/>
			<Audio
				name="Card 4"
				src="https://remotion.media/mouse-click.wav"
				from={447}
				volume={0.3}
			/>
			<Audio
				name="All checked"
				src="https://remotion.media/ding.wav"
				from={527}
				volume={0.22}
			/>
		</AbsoluteFill>
	);
};
