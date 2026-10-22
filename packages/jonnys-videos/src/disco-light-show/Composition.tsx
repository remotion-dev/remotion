import {Audio} from '@remotion/media';
import {
	Interactive,
	Composition,
	Folder,
	interpolate,
	Track,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {asset} from './assets';
import {BackgroundRemovalScene} from './BackgroundRemovalScene';
import {CustomToolScene} from './CustomToolScene';
import {DiscoBallBg} from './DiscoBallBg';
import {FinaleScene} from './FinaleScene';
import {Narration} from './Narration';
import {OpeningScene} from './OpeningScene';
import {RemotionAssemblyScene} from './RemotionAssemblyScene';
import {
	SCREEN_RECORDING_DURATION_IN_FRAMES,
	ScreenRecordingComposition,
} from './ScreenRecordingComposition';
import {SocialSafeZones} from './SocialSafeZones';
import {
	TEXT_BACKGROUND_DURATION_IN_FRAMES,
	TextBackgroundComposition,
} from './TextBackgroundComposition';

export const MASTER_DURATION_IN_FRAMES = 1608;

export const MyComposition = () => {
	return (
		<>
			<Composition
				id="Master"
				component={MyComponent}
				durationInFrames={MASTER_DURATION_IN_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Folder name="backgrounds">
				<Composition
					id="Waves"
					component={ScreenRecordingComposition}
					durationInFrames={SCREEN_RECORDING_DURATION_IN_FRAMES}
					fps={30}
					width={1080}
					height={1920}
				/>
				<Composition
					id="TextBackground"
					component={TextBackgroundComposition}
					durationInFrames={TEXT_BACKGROUND_DURATION_IN_FRAMES}
					fps={30}
					width={1920}
					height={1080}
				/>
			</Folder>
		</>
	);
};

const InstrumentalMusic: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<Audio
			name="Kein Kokain — instrumental"
			src={asset('kein-kokain-instrumental-fad54dabc4a4.mp3')}
			trimBefore={0.95075 * fps}
			durationInFrames={(1368 / 30) * fps}
			volume={interpolate(frame, [0, 7, 1113, 1355], [0, 0.07, 0.07, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
		/>
	);
};

const MyComponentInner: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			<Track name="Background">
				<DiscoBallBg
					name="DiscoBallBg"
					width={1080}
					height={1920}
					durationInFrames={MASTER_DURATION_IN_FRAMES}
					style={{
						position: 'absolute',
					}}
				/>
			</Track>
			<OpeningScene
				name="Opening and dance"
				from={0}
				durationInFrames={325}
				width={1080}
				height={1920}
			/>
			<BackgroundRemovalScene
				name="Background removal and layers"
				from={296}
				durationInFrames={526}
				width={1080}
				height={1920}
			/>
			<CustomToolScene
				name="Fork and custom export tool"
				from={803}
				durationInFrames={255}
				width={1080}
				height={1920}
			/>
			<RemotionAssemblyScene
				name="Assemble in Remotion"
				from={1053}
				durationInFrames={265}
				width={1080}
				height={1920}
			/>
			<FinaleScene
				name="Countdown and final result"
				from={1364}
				durationInFrames={244}
				width={1080}
				height={1920}
			/>
			<Track name="Music">
				<InstrumentalMusic />
				<Audio
					name="Outro music"
					src={asset('text-behind-video-2.wav')}
					from={(1368 / 30) * fps}
					trimBefore={52 * fps}
					durationInFrames={MASTER_DURATION_IN_FRAMES - (1368 / 30) * fps}
				/>
			</Track>
			<SocialSafeZones
				name="Social safe zones — toggle visibility"
				width={1080}
				height={1920}
				durationInFrames={MASTER_DURATION_IN_FRAMES}
				platform="instagram"
				style={{pointerEvents: 'none', zIndex: 2147483647}}
				hidden
			/>
			<Sequence
				name="Narration and captions"
				durationInFrames={MASTER_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
				style={{
					position: 'absolute',
					zIndex: 2147483647,
					pointerEvents: 'none',
				}}
			>
				<Narration />
			</Sequence>
		</>
	);
};

export const MyComponent = Interactive.create({
	Component: MyComponentInner,
	layout: 'absolute-fill',
});
