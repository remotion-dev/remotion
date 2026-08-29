import {loadFont} from '@remotion/fonts';
import {Audio} from '@remotion/media';
import {getWaveformPortion, useAudioData} from '@remotion/media-utils';
import {
	animeWow,
	boneCrack,
	bruh,
	ding,
	dramaticBoomer,
	fah,
	illuminatiConfirmed,
	loadingLag,
	macQuack,
	minecraftHurt,
	mouseClick,
	nellyAhh,
	ohMyGodVine,
	omgHellNah,
	pageTurn,
	priceIsRightFail,
	recordScratch,
	romanceMeme,
	sanctuaryGuardianWhat,
	shutterModern,
	shutterOld,
	skedaddle,
	snapchatNotification,
	spongebobFail,
	triggered,
	uiSwitch,
	vineBoom,
	whip,
	whoosh,
	wilhelmScream,
	windowsXpError,
	yippee,
} from '@remotion/sfx';
import {
	AbsoluteFill,
	Series,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const fontFamily = 'GT Planar';

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Bold.woff2'),
	weight: '700',
});

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

const soundEffects = [
	{name: 'whip', src: whip, durationInFrames: 45},
	{name: 'whoosh', src: whoosh, durationInFrames: 45},
	{name: 'pageTurn', src: pageTurn, durationInFrames: 45},
	{name: 'uiSwitch', src: uiSwitch, durationInFrames: 45},
	{name: 'mouseClick', src: mouseClick, durationInFrames: 45},
	{name: 'shutterModern', src: shutterModern, durationInFrames: 45},
	{name: 'shutterOld', src: shutterOld, durationInFrames: 45},
	{name: 'ding', src: ding, durationInFrames: 50},
	{name: 'bruh', src: bruh, durationInFrames: 45},
	{name: 'vineBoom', src: vineBoom, durationInFrames: 46},
	{name: 'windowsXpError', src: windowsXpError, durationInFrames: 45},
	{name: 'fah', src: fah, durationInFrames: 66},
	{name: 'spongebobFail', src: spongebobFail, durationInFrames: 110},
	{name: 'omgHellNah', src: omgHellNah, durationInFrames: 141},
	{name: 'priceIsRightFail', src: priceIsRightFail, durationInFrames: 144},
	{name: 'romanceMeme', src: romanceMeme, durationInFrames: 183},
	{name: 'boneCrack', src: boneCrack, durationInFrames: 45},
	{name: 'animeWow', src: animeWow, durationInFrames: 134},
	{name: 'yippee', src: yippee, durationInFrames: 88},
	{name: 'loadingLag', src: loadingLag, durationInFrames: 89},
	{name: 'wilhelmScream', src: wilhelmScream, durationInFrames: 71},
	{name: 'macQuack', src: macQuack, durationInFrames: 45},
	{name: 'skedaddle', src: skedaddle, durationInFrames: 205},
	{
		name: 'snapchatNotification',
		src: snapchatNotification,
		durationInFrames: 45,
	},
	{name: 'nellyAhh', src: nellyAhh, durationInFrames: 52},
	{
		name: 'sanctuaryGuardianWhat',
		src: sanctuaryGuardianWhat,
		durationInFrames: 279,
	},
	{name: 'minecraftHurt', src: minecraftHurt, durationInFrames: 45},
	{name: 'ohMyGodVine', src: ohMyGodVine, durationInFrames: 57},
	{
		name: 'illuminatiConfirmed',
		src: illuminatiConfirmed,
		durationInFrames: 244,
	},
	{name: 'dramaticBoomer', src: dramaticBoomer, durationInFrames: 48},
	{name: 'triggered', src: triggered, durationInFrames: 45},
	{name: 'recordScratch', src: recordScratch, durationInFrames: 46},
] as const;

export const sfxShowcaseDurationInFrames = soundEffects.reduce(
	(sum, soundEffect) => sum + soundEffect.durationInFrames,
	0,
);

const WAVEFORM_BAR_COUNT = 64;

const Waveform: React.FC<{readonly src: string}> = ({src}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const audioData = useAudioData(src);

	if (!audioData) {
		return null;
	}

	const waveform = getWaveformPortion({
		audioData,
		startTimeInSeconds: 0,
		durationInSeconds: audioData.durationInSeconds,
		numberOfSamples: WAVEFORM_BAR_COUNT,
	});
	const progress = Math.min(1, frame / (audioData.durationInSeconds * fps));

	return (
		<div
			style={{
				width: '100%',
				height: 144,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginTop: 96,
			}}
		>
			{waveform.map(({amplitude, index}) => (
				<div
					key={index}
					style={{
						width: 5,
						height: Math.max(8, amplitude * 128),
						borderRadius: 999,
						backgroundColor:
							progress >= (index + 1) / WAVEFORM_BAR_COUNT
								? 'black'
								: '#D9D9D9',
					}}
				/>
			))}
		</div>
	);
};

const SoundEffect: React.FC<{
	readonly name: string;
	readonly src: string;
}> = ({name, src}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 80,
				fontFamily,
				fontWeight: 700,
				color: 'black',
				overflow: 'hidden',
			}}
		>
			<div
				style={{fontSize: 48, lineHeight: 1, color: '#666', fontWeight: 500}}
			>
				@remotion/sfx
			</div>
			<div
				style={{
					display: 'flex',
					alignItems: 'baseline',
					lineHeight: 0.95,
					marginTop: 32,
				}}
			>
				<span
					style={{
						fontSize: Math.min(112, 1550 / name.length),
						letterSpacing: '-0.04em',
					}}
				>
					{name}
				</span>
				<span
					aria-hidden
					style={{fontSize: 112, visibility: 'hidden', width: 0, flexShrink: 0}}
				>
					M
				</span>
			</div>
			<Waveform src={src} />
			<Audio src={src} />
		</AbsoluteFill>
	);
};

export const SfxShowcase: React.FC = () => {
	return (
		<Series>
			{soundEffects.map((soundEffect) => (
				<Series.Sequence
					key={soundEffect.name}
					durationInFrames={soundEffect.durationInFrames}
				>
					<SoundEffect name={soundEffect.name} src={soundEffect.src} />
				</Series.Sequence>
			))}
		</Series>
	);
};
