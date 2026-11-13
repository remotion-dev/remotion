import {Audio, Video} from '@remotion/media';
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {
	Track,
	Interactive,
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
	ShotFraming,
	StageLayout,
	useCaptionPlacement,
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

const SkillsSourceInner = () => {
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
							'https://remotion.media/announcements/whats-new-in-remotion/cursor/footage/whats5.mp4'
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
						startMs: 3041,
						endMs: 3318,
						timestampMs: 3180,
						confidence: null,
					},
					{
						text: ' skills.',
						startMs: 3318,
						endMs: 3886,
						timestampMs: 3602,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' We',
						startMs: 4588.666666,
						endMs: 4786.666666,
						timestampMs: 4687.666666,
						confidence: null,
					},
					{
						text: ' looked',
						startMs: 4786.666666,
						endMs: 5033.666666,
						timestampMs: 4910.666666,
						confidence: null,
					},
					{
						text: ' at',
						startMs: 5033.666666,
						endMs: 5198.666666,
						timestampMs: 5116.666666,
						confidence: null,
					},
					{
						text: ' what',
						startMs: 5198.666666,
						endMs: 5297.666666,
						timestampMs: 5248.666666,
						confidence: null,
					},
					{
						text: ' is',
						startMs: 5297.666666,
						endMs: 5429.666666,
						timestampMs: 5363.666666,
						confidence: null,
					},
					{
						text: ' not',
						startMs: 5429.666666,
						endMs: 5693.666666,
						timestampMs: 5561.666666,
						confidence: null,
					},
					{
						text: ' working',
						startMs: 5693.666666,
						endMs: 5923.666666,
						timestampMs: 5808.666666,
						confidence: null,
					},
					{
						text: ' so',
						startMs: 5923.666666,
						endMs: 6171.666666,
						timestampMs: 6047.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' well',
						startMs: 6171.666666,
						endMs: 6550.666666,
						timestampMs: 6361.666666,
						confidence: null,
					},
					{
						text: ' and',
						startMs: 6550.666666,
						endMs: 6698.666666,
						timestampMs: 6624.666666,
						confidence: null,
					},
					{
						text: ' we',
						startMs: 6698.666666,
						endMs: 6929.666666,
						timestampMs: 6814.666666,
						confidence: null,
					},
					{
						text: ' wrote',
						startMs: 6929.666666,
						endMs: 7192.666666,
						timestampMs: 7061.666666,
						confidence: null,
					},
					{
						text: ' new',
						startMs: 7192.666666,
						endMs: 7473.666666,
						timestampMs: 7333.666666,
						confidence: null,
					},
					{
						text: ' skills',
						startMs: 7473.666666,
						endMs: 7885.666666,
						timestampMs: 7679.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' for',
						startMs: 7885.666666,
						endMs: 8709.666666,
						timestampMs: 8297.666666,
						confidence: null,
					},
					{
						text: ' generating',
						startMs: 9254.333333,
						endMs: 9596.333333,
						timestampMs: 9425.333333,
						confidence: null,
					},
					{
						text: ' voiceovers',
						startMs: 9596.333333,
						endMs: 10433.333333,
						timestampMs: 10015.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' with',
						startMs: 10433.333333,
						endMs: 10870.333333,
						timestampMs: 10652.333333,
						confidence: null,
					},
					{
						text: ' ElevenLabs,',
						startMs: 10870.333333,
						endMs: 11877.333333,
						timestampMs: 11374.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' doing',
						startMs: 12470.666666,
						endMs: 13022.666666,
						timestampMs: 12746.666666,
						confidence: null,
					},
					{
						text: ' tasks',
						startMs: 13022.666666,
						endMs: 13329.666666,
						timestampMs: 13176.666666,
						confidence: null,
					},
					{
						text: ' with',
						startMs: 13329.666666,
						endMs: 13758.666666,
						timestampMs: 13544.666666,
						confidence: null,
					},
					{
						text: ' FFmpeg',
						startMs: 13758.666666,
						endMs: 14351.666666,
						timestampMs: 14055.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' such',
						startMs: 14351.666666,
						endMs: 14596.666666,
						timestampMs: 14474.666666,
						confidence: null,
					},
					{
						text: ' as',
						startMs: 14807.666666,
						endMs: 15062.666666,
						timestampMs: 14935.666666,
						confidence: null,
					},
					{
						text: ' silence',
						startMs: 15062.666666,
						endMs: 15445.666666,
						timestampMs: 15254.666666,
						confidence: null,
					},
					{
						text: ' detection,',
						startMs: 15445.666666,
						endMs: 16014.666666,
						timestampMs: 15730.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' doing',
						startMs: 16842.333333,
						endMs: 17199.333333,
						timestampMs: 17021.333333,
						confidence: null,
					},
					{
						text: ' audio',
						startMs: 17199.333333,
						endMs: 17893.333333,
						timestampMs: 17546.333333,
						confidence: null,
					},
					{
						text: ' visualization',
						startMs: 17893.333333,
						endMs: 18794.333333,
						timestampMs: 18344.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' and',
						startMs: 19145.333333,
						endMs: 19721.333333,
						timestampMs: 19433.333333,
						confidence: null,
					},
					{
						text: ' exporting',
						startMs: 19721.333333,
						endMs: 20462.333333,
						timestampMs: 20092.333333,
						confidence: null,
					},
					{
						text: ' transparent',
						startMs: 20462.333333,
						endMs: 21071.333333,
						timestampMs: 20767.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' videos.',
						startMs: 21071.333333,
						endMs: 21400.333333,
						timestampMs: 21236.333333,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' All',
						startMs: 22186.666666,
						endMs: 22358.666666,
						timestampMs: 22272.666666,
						confidence: null,
					},
					{
						text: ' of',
						startMs: 22358.666666,
						endMs: 22530.666666,
						timestampMs: 22444.666666,
						confidence: null,
					},
					{
						text: ' these',
						startMs: 22530.666666,
						endMs: 22925.666666,
						timestampMs: 22728.666666,
						confidence: null,
					},
					{
						text: ' tasks',
						startMs: 22925.666666,
						endMs: 23165.666666,
						timestampMs: 23045.666666,
						confidence: null,
					},
					{
						text: ' should',
						startMs: 23165.666666,
						endMs: 23526.666666,
						timestampMs: 23346.666666,
						confidence: null,
					},
					{
						text: ' now',
						startMs: 23526.666666,
						endMs: 24041.666666,
						timestampMs: 23784.666666,
						confidence: null,
						pageBreakAfter: true,
					},
					{
						text: ' work',
						startMs: 24041.666666,
						endMs: 24334.666666,
						timestampMs: 24188.666666,
						confidence: null,
					},
					{
						text: ' much',
						startMs: 24334.666666,
						endMs: 24729.666666,
						timestampMs: 24532.666666,
						confidence: null,
					},
					{
						text: ' smoother.',
						startMs: 24729.666666,
						endMs: 25313.666666,
						timestampMs: 25021.666666,
						confidence: null,
						pageBreakAfter: true,
					},
				]}
			/>
		</>
	);
};

const SkillsSource = Interactive.create({
	Component: SkillsSourceInner,
	layout: 'absolute-fill',
});

const SkillsSceneInner: React.FC = () => {
	return (
		<>
			<Backdrop accent={accents.skills} />
			<StageLayout keyframes={layout}>
				<Series>
					<Series.Sequence
						name="New skills"
						durationInFrames={34}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<SkillsSource trimBefore={87} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="What did not work"
						durationInFrames={129}
						premountFor={30}
					>
						<ShotFraming zoom={1.14}>
							<SkillsSource trimBefore={135} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Voiceovers"
						durationInFrames={84}
						premountFor={30}
					>
						<ShotFraming zoom={1}>
							<SkillsSource trimBefore={275} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="FFmpeg"
						durationInFrames={111}
						premountFor={30}
					>
						<ShotFraming zoom={1.16}>
							<SkillsSource trimBefore={372} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Visualization and transparency"
						durationInFrames={144}
						premountFor={30}
					>
						<ShotFraming zoom={1.02}>
							<SkillsSource trimBefore={503} />
						</ShotFraming>
					</Series.Sequence>
					<Series.Sequence
						name="Much smoother"
						durationInFrames={106}
						premountFor={30}
					>
						<ShotFraming zoom={1.18}>
							<SkillsSource trimBefore={663} />
						</ShotFraming>
					</Series.Sequence>
				</Series>
			</StageLayout>

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
					from={90}
					volume={0.16}
				/>
				<Audio
					durationInFrames={12}
					name="Card 1"
					src="https://remotion.media/mouse-click.wav"
					from={166}
					volume={0.3}
				/>
				<Audio
					durationInFrames={12}
					name="Card 2"
					src="https://remotion.media/mouse-click.wav"
					from={288}
					volume={0.3}
				/>
				<Audio
					durationInFrames={12}
					name="Card 3"
					src="https://remotion.media/mouse-click.wav"
					from={371}
					volume={0.3}
				/>
				<Audio
					durationInFrames={12}
					name="Card 4"
					src="https://remotion.media/mouse-click.wav"
					from={447}
					volume={0.3}
				/>
				<Audio
					durationInFrames={42}
					name="All checked"
					src="https://remotion.media/ding.wav"
					from={527}
					volume={0.22}
				/>
			</Track>
		</>
	);
};

export const SkillsScene = Interactive.create({
	Component: SkillsSceneInner,
	layout: 'absolute-fill',
});
