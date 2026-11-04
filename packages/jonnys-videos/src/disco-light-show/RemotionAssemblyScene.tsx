import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {CodeEditor} from './CodeEditor';
import {DragInDemo} from './DragInDemo';
import {TextBehindVideoStackComposition} from './TextBehindVideoStack';

const RemotionAssemblySceneInner = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<DragInDemo
				playbackRate={102 / 100}
				name="DragInDemo"
				width={1080}
				height={1920}
				durationInFrames={102}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[0, 5, 91, 99],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.inOut(Easing.cubic),
								Easing.linear,
								Easing.inOut(Easing.cubic),
							],
						},
					),
				}}
				from={0}
			/>
			<TextBehindVideoStackComposition
				playbackRate={154 / 153}
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
						[91, 99],
						['1208px 226.6px', '0px 226.6px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
				from={90}
			/>
			<CodeEditor
				name="Code editor"
				from={209}
				durationInFrames={56}
				style={{
					position: 'absolute',
					width: 1188,
					height: 1260,
					scale: 1.04,
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[209, 222, 250, 254, 264],
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
								Easing.inOut(Easing.cubic),
								Easing.linear,
								Easing.inOut(Easing.cubic),
							],
						},
					),
				}}
				width={1188}
				height={1260}
			/>
		</>
	);
};

export const RemotionAssemblyScene = Interactive.create({
	Component: RemotionAssemblySceneInner,
	layout: 'absolute-fill',
});
