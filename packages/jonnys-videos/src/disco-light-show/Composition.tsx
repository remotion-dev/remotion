import {Audio, Video} from '@remotion/media';
import {
	Interactive,
	Composition,
	Easing,
	Folder,
	interpolate,
	Track,
	useCurrentFrame,
	useVideoConfig,
	CanvasImage,
} from 'remotion';
import {PaperDiscoSting} from '../paper-disco/PaperDiscoSting';
import {AnimatedCaptions} from './AnimatedCaptions';
import {asset} from './assets';
import {BirthdayPartyCompilation} from './BirthdayPartyCompilation';
import {ClientSideChad} from './ClientSideChad';
import {Countdown, COUNTDOWN_DURATION_IN_FRAMES} from './Countdown';
import {DiscoBallBg} from './DiscoBallBg';
import {DragInDemo} from './DragInDemo';
import {EffectShow} from './EffectShow';
import {Fork} from './Fork';
import {ForkDrop} from './ForkDrop';
import {ForkSound} from './ForkSound';
import {HuggingFace} from './HuggingFace';
import {Mediabunny} from './Mediabunny';
import {
	SCREEN_RECORDING_DURATION_IN_FRAMES,
	ScreenRecordingComposition,
} from './ScreenRecordingComposition';
import {Separate} from './Separate';
import {SocialSafeZones} from './SocialSafeZones';
import {
	TEXT_BACKGROUND_DURATION_IN_FRAMES,
	TextBackgroundComposition,
} from './TextBackgroundComposition';
import {
	TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES,
	TextBehindVideoSeriesFirst20sComposition,
} from './TextBehindVideoSeriesFirst20s';
import {TextBehindVideoStackComposition} from './TextBehindVideoStack';
import {VibeCoded} from './VibeCoded';
import {VOICEOVER_SRC} from './voiceover';

export const MASTER_DURATION_IN_FRAMES = 1816;

export const MyComposition = () => {
	return (
		<>
			<Composition
				id="Master"
				component={MyComponent}
				durationInFrames={1800}
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

const MyComponentInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<>
			<DiscoBallBg
				name="DiscoBallBg"
				width={1080}
				height={1920}
				durationInFrames={MASTER_DURATION_IN_FRAMES}
				style={{
					position: 'absolute',
				}}
			/>
			<TextBackgroundComposition
				name="Text background"
				width={1920}
				height={1080}
				durationInFrames={201}
				style={{
					position: 'absolute',
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[0, 58, 76, 122, 140, 181],
						[
							'-565px -40px',
							'-565px -40px',
							'-310px -140px',
							'-310px -140px',
							'-640px -140px',
							'-640px -140px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: interpolate(
						frame,
						[0, 58, 76, 181],
						[1.12, 1.12, 1.24, 1.24],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
			/>
			<BirthdayPartyCompilation
				name="BirthdayPartyCompilation"
				width={1080}
				height={1920}
				durationInFrames={178}
				style={{
					position: 'absolute',
					// Keep the next caption behind the outgoing paper during the reveal.
					zIndex: frame >= 347 ? 1 : 0,
				}}
				from={182}
			/>
			<Audio name="Voiceover" src={VOICEOVER_SRC} />
			<Track name="Music">
				<Audio
					name="Kein Kokain — instrumental"
					src={asset('kein-kokain-instrumental-fad54dabc4a4.mp3')}
					trimBefore={0.95075 * fps}
					durationInFrames={52 * fps}
					volume={interpolate(
						frame,
						[0, 0.3 * fps, 43.5 * fps, 51.5 * fps],
						[0, 0.07, 0.07, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)}
				/>
				<Audio
					name="Outro music"
					src={asset('text-behind-video-2.wav')}
					from={52 * fps}
					trimBefore={52 * fps}
					durationInFrames={MASTER_DURATION_IN_FRAMES - 52 * fps}
				/>
			</Track>
			<Track name="Captions">
				{/* Text background is white: black captions */}
				<AnimatedCaptions
					name="AnimatedCaptions"
					width={1080}
					height={360}
					durationInFrames={182}
					style={{
						position: 'absolute',
						translate: '0px 1260px',
						scale: 0.9,
						transformOrigin: '50% 0%',
					}}
				/>
				{/* Over the birthday party footage: white captions */}
				<AnimatedCaptions
					name="AnimatedCaptions (over footage)"
					width={1080}
					height={360}
					from={182}
					durationInFrames={165}
					trimBefore={182}
					theme="dark"
					style={{
						position: 'absolute',
						translate: '0px 1260px',
						scale: 0.9,
						transformOrigin: '50% 0%',
					}}
				/>
				<AnimatedCaptions
					name="AnimatedCaptions"
					width={1080}
					height={360}
					from={347}
					durationInFrames={187}
					trimBefore={347}
					style={{
						position: 'absolute',
						translate: '0px 1260px',
						scale: 0.9,
						transformOrigin: '50% 0%',
					}}
				/>
				{/* No captions for "How did I do this?" (534-571): the disco sting plays instead */}
				<AnimatedCaptions
					name="AnimatedCaptions (after sting)"
					width={1080}
					height={360}
					from={571}
					durationInFrames={674}
					trimBefore={571}
					style={{
						position: 'absolute',
						translate: '0px 1260px',
						scale: 0.9,
						transformOrigin: '50% 0%',
					}}
				/>
				<AnimatedCaptions
					name="AnimatedCaptions (after import)"
					width={1080}
					height={360}
					from={1347}
					durationInFrames={453}
					trimBefore={1347}
					style={{
						position: 'absolute',
						translate: '0px 1260px',
						scale: 0.9,
						transformOrigin: '50% 0%',
					}}
				/>
			</Track>
			<Track name="Effect and model demos">
				<EffectShow
					name="EffectShow"
					width={1080}
					height={1920}
					durationInFrames={200}
					cropBottom={interpolate(frame, [345, 359], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.cubic),
					})}
					style={{
						position: 'absolute',
						translate: interpolate(
							frame,
							[345, 359, 512, 522],
							['0px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.inOut(Easing.cubic),
							},
						),
					}}
					from={337}
				/>
				<HuggingFace
					name="HuggingFace"
					width={1080}
					height={1920}
					durationInFrames={166}
					style={{
						position: 'absolute',
						translate: interpolate(
							frame,
							[567, 575, 694, 702],
							['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.inOut(Easing.cubic),
							},
						),
					}}
					from={537}
				/>
			</Track>
			<PaperDiscoSting
				name="How did I do this? — disco sting"
				width={1080}
				height={1920}
				from={534}
				durationInFrames={37}
				style={{position: 'absolute'}}
			/>
			<ClientSideChad
				name="ClientSideChad"
				width={1080}
				height={1920}
				durationInFrames={168}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[694, 702, 823, 831],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
				from={694}
			/>
			<Separate
				name="Separate"
				width={1080}
				height={1920}
				from={823}
				durationInFrames={154}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[823, 831, 966, 976],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
			/>
			<Fork
				name="Fork"
				width={1080}
				height={1920}
				durationInFrames={140}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[966, 976],
						['1119.2px -299.4px', '39.2px -299.4px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					rotate: interpolate(frame, [1048, 1063], ['0deg', '60deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					}),
					transformOrigin: interpolate(
						frame,
						[1034, 1045],
						['50% 50%', '50% 150%'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
				from={953}
			/>
			<ForkDrop
				name="ForkDrop"
				width={1080}
				height={1920}
				from={1052}
				durationInFrames={65}
				style={{
					position: 'absolute',
					overflow: 'hidden',
					translate: interpolate(
						frame,
						[1052, 1059],
						['1080px -395.2px', '0px -395.2px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					scale: 1,
				}}
			/>
			<VibeCoded
				name="VibeCoded"
				width={1080}
				height={1920}
				durationInFrames={140}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[1093, 1104, 1226, 1232],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					scale: 0.9999999983052765,
				}}
				from={1093}
				trimBefore={3}
			/>
			<Mediabunny
				name="Mediabunny"
				width={1080}
				height={1920}
				from={1231}
				durationInFrames={30}
				style={{
					position: 'absolute',
				}}
			/>
			<DragInDemo
				name="DragInDemo"
				width={1080}
				height={1920}
				durationInFrames={102}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[1245, 1251, 1338, 1346],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.linear,
							],
						},
					),
				}}
				from={1245}
			/>
			<AnimatedCaptions
				name="AnimatedCaptions (over import)"
				width={1080}
				height={360}
				from={1245}
				durationInFrames={102}
				trimBefore={1245}
				style={{
					position: 'absolute',
					translate: '0px 1260px',
					scale: 0.9,
					transformOrigin: '50% 0%',
				}}
			/>
			<TextBehindVideoStackComposition
				name="TextBehindVideoStack"
				width={1080}
				height={1920}
				durationInFrames={154}
				style={{
					position: 'absolute',
					overflow: 'hidden',
					scale: 1.236,
					translate: interpolate(
						frame,
						[1338, 1346],
						['1012.8px 226.6px', '0px 226.6px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
				from={1337}
			/>
			<CanvasImage
				name="Code snippet"
				src={asset('Screenshot 2026-07-19 at 18.28.52.png')}
				from={1455}
				durationInFrames={57}
				cropTop={0.124}
				cropBottom={0.12}
				cropLeft={0.016}
				cropRight={0.016}
				style={{
					position: 'absolute',
					width: 1188,
					height: 1260,
					scale: 1.04,
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[1455, 1469, 1498, 1502, 1511],
						[
							'1080px -20px',
							'-75px -20px',
							'-125px -40px',
							'-125px -40px',
							'-1400px -40px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.inOut(Easing.cubic),
								Easing.linear,
								Easing.linear,
								Easing.inOut(Easing.cubic),
							],
						},
					),
				}}
			/>
			<ForkSound
				name="Fork sound effect"
				from={1036}
				durationInFrames={772}
				style={{pointerEvents: 'none'}}
			/>
			<Video
				name="Drumsticks"
				src={asset('drumsticks.mp4')}
				style={{
					position: 'absolute',
					translate: '220px 672.4px',
					width: 640,
					height: 360,
					scale: 1.739,
				}}
				from={1615}
				durationInFrames={66}
				playbackRate={0.8}
			/>
			<TextBehindVideoSeriesFirst20sComposition
				name="TextBehindVideoSeriesFirst20s"
				from={1648}
				durationInFrames={TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
			/>
			<Countdown
				name="Countdown"
				from={1556}
				durationInFrames={COUNTDOWN_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
			/>
			<SocialSafeZones
				name="Social safe zones — toggle visibility"
				width={1080}
				height={1920}
				durationInFrames={MASTER_DURATION_IN_FRAMES}
				platform="instagram"
				hidden
				style={{pointerEvents: 'none', zIndex: 2147483647}}
			/>
		</>
	);
};

export const MyComponent = Interactive.create({
	Component: MyComponentInner,
	layout: 'absolute-fill',
});
