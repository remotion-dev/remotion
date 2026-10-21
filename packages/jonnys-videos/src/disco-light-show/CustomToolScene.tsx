import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {Fork} from './Fork';
import {ForkDrop} from './ForkDrop';
import {ForkSound} from './ForkSound';
import {VibeCoded} from './VibeCoded';

const CustomToolSceneInner = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Fork
				playbackRate={140 / 122}
				name="Fork"
				width={1080}
				height={1920}
				durationInFrames={140}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[10, 18],
						['1080px -299.4px', '0px -299.4px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					rotate: interpolate(frame, [84, 97], ['0deg', '60deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [Easing.inOut(Easing.cubic)],
					}),
					transformOrigin: interpolate(
						frame,
						[72, 82],
						['50% 50%', '50% 150%'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
				from={0}
			/>
			<ForkDrop
				playbackRate={65 / 54}
				name="ForkDrop"
				width={1080}
				height={1920}
				from={87}
				durationInFrames={65}
				style={{
					position: 'absolute',
					overflow: 'hidden',
					translate: interpolate(
						frame,
						[87, 94],
						['1540px -60px', '-40px -60px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.inOut(Easing.cubic)],
						},
					),
					scale: 1.6,
					transformOrigin: '0% 50%',
				}}
			/>
			<VibeCoded
				playbackRate={159 / 133}
				name="VibeCoded"
				width={1080}
				height={1920}
				durationInFrames={159}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[122, 130, 250, 255],
						['0px -1920px', '0px 0px', '0px 0px', '-1080px 0px'],
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
					scale: 1,
				}}
				from={122}
				trimBefore={3}
			/>
			<ForkSound
				name="Fork sound effect"
				from={73}
				durationInFrames={182}
				style={{pointerEvents: 'none'}}
			/>
		</>
	);
};

export const CustomToolScene = Interactive.create({
	Component: CustomToolSceneInner,
	layout: 'absolute-fill',
});
