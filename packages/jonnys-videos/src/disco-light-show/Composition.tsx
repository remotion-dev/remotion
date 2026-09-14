import {Audio, Video} from '@remotion/media';
import {
	CalculateMetadataFunction,
	Composition,
	Easing,
	Folder,
	Sequence,
	interpolate,
	useCurrentFrame,
	Img,
} from 'remotion';
import {AnimatedCaptions} from './AnimatedCaptions';
import {AnimatedCaptionsBigWords} from './AnimatedCaptionsBigWords';
import {asset} from './assets';
import {BirthdayPartyCompilation} from './BirthdayPartyCompilation';
import {ClientSideChad} from './ClientSideChad';
import {Countdown, COUNTDOWN_DURATION_IN_FRAMES} from './Countdown';
import {DiscoBallBg} from './DiscoBallBg';
import {DragInDemo} from './DragInDemo';
import {EffectShow} from './EffectShow';
import {Fork} from './Fork';
import {ForkDrop} from './ForkDrop';
import {HuggingFace} from './HuggingFace';
import {Mediabunny} from './Mediabunny';
import {OneShot} from './OneShot';
import {
	SCREEN_RECORDING_DURATION_IN_FRAMES,
	ScreenRecordingComposition,
} from './ScreenRecordingComposition';
import {Separate} from './Separate';
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

type Props = {};

export const MASTER_DURATION_IN_FRAMES = 1816;

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
	return {};
};

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
				calculateMetadata={calculateMetadata}
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

export const MyComponent: React.FC<Props> = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Sequence
				name="DiscoBallBg"
				width={1080}
				height={1920}
				durationInFrames={MASTER_DURATION_IN_FRAMES}
				style={{
					position: 'absolute',
				}}
			>
				<DiscoBallBg />
			</Sequence>
			<Sequence
				name="Text background"
				width={1920}
				height={1080}
				durationInFrames={201}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[0, 91, 103, 127, 136, 172],
						[
							'-384.3px -80.8px',
							'-420px 45.5px',
							'135.6px -76.9px',
							'135.6px -76.9px',
							'-419.93606px 93.283812px',
							'-419.93606px 93.283812px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.linear,
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
								Easing.linear,
							],
						},
					),
					scale: interpolate(
						frame,
						[91, 103, 127, 136, 172, 179],
						[0.73, 1.297, 1.297, 1.35, 1.35, 0.684],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
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
				}}
			>
				<TextBackgroundComposition />
			</Sequence>
			<Sequence
				name="BirthdayPartyCompilation"
				width={1080}
				height={1920}
				durationInFrames={169}
				style={{
					position: 'absolute',
				}}
				from={182}
				premountFor={30}
			>
				<BirthdayPartyCompilation />
			</Sequence>
			<Audio src={asset('text-behind-video-2.wav')} />
			<Sequence
				name="AnimatedCaptions"
				width={1080}
				height={360}
				durationInFrames={334}
				style={{
					position: 'absolute',
					translate: '0px 1132.3px',
				}}
			>
				<AnimatedCaptions />
			</Sequence>
			<Sequence
				name="AnimatedCaptions"
				width={1080}
				height={360}
				from={347}
				durationInFrames={175}
				trimBefore={347}
				style={{
					position: 'absolute',
					translate: '0px 1132.3px',
				}}
			>
				<AnimatedCaptions />
			</Sequence>
			<Sequence
				name="AnimatedCaptions"
				width={1080}
				height={360}
				from={566}
				durationInFrames={1234}
				trimBefore={566}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[567, 575],
						['1080px 1132.3px', '0px 1132.3px'],
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
				}}
			>
				<AnimatedCaptions />
			</Sequence>
			<Sequence
				name="AnimatedCaptionsBigWords"
				width={1080}
				height={1920}
				from={529}
				durationInFrames={55}
				trimBefore={522}
				style={{
					position: 'absolute',
					scale: 0.85,
					translate: interpolate(
						frame,
						[567, 575],
						['0px 0px', '-1070.4px 0px'],
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
				}}
			>
				<AnimatedCaptionsBigWords />
			</Sequence>
			<Sequence
				name="EffectShow"
				width={1080}
				height={1920}
				durationInFrames={197}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[337, 352],
						['0px 1920px', '0px -330.8px'],
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
					scale: interpolate(frame, [512, 522], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: false,
								durationRestThreshold: 0.01,
								overshootClamping: false,
							}),
						],
					}),
				}}
				from={337}
				premountFor={30}
			>
				<EffectShow />
			</Sequence>
			<Sequence
				name="HuggingFace"
				width={1920}
				height={1080}
				durationInFrames={162}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[567, 575],
						['704.8px 79.9px', '-420px 79.9px'],
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
					scale: interpolate(frame, [692, 697], [0.707, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
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
				}}
				from={537}
				premountFor={30}
			>
				<HuggingFace />
			</Sequence>
			<Sequence
				name="ClientSideChad"
				width={1080}
				height={1920}
				durationInFrames={168}
				style={{
					position: 'absolute',
					opacity: interpolate(frame, [817, 821], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
				from={694}
				premountFor={30}
			>
				<ClientSideChad />
			</Sequence>
			<Sequence
				name="Separate"
				width={1080}
				height={1920}
				from={823}
				durationInFrames={141}
				style={{
					position: 'absolute',
					scale: interpolate(frame, [823, 829, 885, 893], [0, 1, 1, 1.608], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
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
					}),
					translate: interpolate(
						frame,
						[885, 893, 949, 962],
						[
							'0px 0px',
							'-328.3px 195.8px',
							'-328.3px 195.8px',
							'-1456.7px 195.8px',
						],
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
				}}
				premountFor={30}
			>
				<Separate />
			</Sequence>
			<Sequence
				name="Fork"
				width={1080}
				height={1920}
				durationInFrames={140}
				style={{
					position: 'absolute',
					translate: '39.2px -299.4px',
					scale: interpolate(
						frame,
						[966, 976, 1048],
						[0, 1, 0.9999999999999999],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
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
							],
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
				premountFor={30}
			>
				<Fork />
			</Sequence>
			<Sequence
				name="ForkDrop"
				width={1080}
				height={1920}
				from={1052}
				durationInFrames={65}
				style={{
					position: 'absolute',
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
			>
				<ForkDrop />
			</Sequence>
			<Sequence
				name="OneShot"
				width={1080}
				height={1080}
				durationInFrames={61}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[1145, 1152],
						['-37.5px -66.9px', '-1080px -66.9px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
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
					scale: interpolate(frame, [1093, 1104], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
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
				}}
				from={1093}
				premountFor={30}
			>
				<OneShot />
			</Sequence>
			<Sequence
				name="VibeCoded"
				width={1080}
				height={1080}
				durationInFrames={108}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[1145, 1152, 1226, 1232],
						[
							'1226.1px 178.9px',
							'-19.5px 178.9px',
							'-19.5px 178.9px',
							'-1346.7px 178.9px',
						],
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
				from={1125}
				premountFor={30}
				trimBefore={35}
			>
				<VibeCoded />
			</Sequence>
			<Sequence
				name="Mediabunny"
				width={1080}
				height={1920}
				from={1231}
				durationInFrames={30}
				style={{
					position: 'absolute',
				}}
				premountFor={30}
			>
				<Mediabunny />
			</Sequence>
			<Sequence
				name="DragInDemo"
				width={1080}
				height={1920}
				durationInFrames={102}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[1245, 1251, 1338, 1346],
						[
							'1548.4px -173.2px',
							'0px -173.2px',
							'0px -173.2px',
							'-1458.6px -173.2px',
						],
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
			>
				<DragInDemo />
			</Sequence>
			<Sequence
				name="TextBehindVideoStack"
				width={1080}
				height={1920}
				durationInFrames={154}
				style={{
					position: 'absolute',
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
				premountFor={30}
			>
				<TextBehindVideoStackComposition />
			</Sequence>
			<Img
				src={asset('Screenshot 2026-07-19 at 18.28.52.png')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[1455, 1469, 1502, 1511],
						[
							'1078px 185.5px',
							'117.1px 177.6px',
							'117.1px 177.6px',
							'-1160.8px 177.6px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.1,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.linear,
							],
						},
					),
					width: 1188,
					height: 1260,
					padding: 36,
					backgroundColor: '#292c32',
					borderRadius: 40,
					scale: 0.712,
					rotate: interpolate(
						frame,
						[1455, 1469, 1502, 1511],
						['-18deg', '0deg', '0deg', '-26.7deg'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.1,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.linear,
							],
						},
					),
					transformOrigin: interpolate(frame, [1455], ['0% 0%'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
				from={1455}
				trimBefore={1310}
				name={'Code snippet'}
				durationInFrames={205}
			/>
			<Audio
				src={asset('fahhhh.mp3')}
				from={1036}
				premountFor={30}
				volume={0.1}
				durationInFrames={772}
			/>
			<Video
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
				premountFor={30}
				playbackRate={0.8}
			/>
			<Sequence
				name="TextBehindVideoSeriesFirst20s"
				from={1648}
				premountFor={30}
				durationInFrames={TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
			>
				<TextBehindVideoSeriesFirst20sComposition />
			</Sequence>
			<Sequence
				name="Countdown"
				from={1556}
				durationInFrames={COUNTDOWN_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
			>
				<Countdown />
			</Sequence>
		</>
	);
};
