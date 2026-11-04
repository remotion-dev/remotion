import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {ClientSideChad} from './ClientSideChad';
import {EffectShow} from './EffectShow';
import {HuggingFace} from './HuggingFace';
import {Separate} from './Separate';

const BackgroundRemovalSceneInner = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<EffectShow
				playbackRate={200 / 188}
				name="EffectShow"
				width={1080}
				height={1920}
				durationInFrames={200}
				cropBottom={interpolate(frame, [13, 28], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.inOut(Easing.cubic),
				})}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[13, 28, 174, 186],
						['0px 0px', '0px 0px', '0px 0px', '0px -1134px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
				from={0}
			/>
			<HuggingFace
				playbackRate={166 / 123}
				name="HuggingFace"
				width={1080}
				height={1920}
				durationInFrames={166}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[174, 186, 286, 292],
						['0px 1134px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
				from={170}
			/>
			<ClientSideChad
				playbackRate={7 / 6}
				name="ClientSideChad"
				width={1080}
				height={1920}
				durationInFrames={140}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[286, 292, 399, 408],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
				from={287}
			/>
			<Separate
				playbackRate={154 / 127}
				name="Separate"
				width={1080}
				height={1920}
				from={399}
				durationInFrames={154}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[399, 408, 517, 525],
						['1080px 0px', '0px 0px', '0px 0px', '-1080px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
			/>
		</>
	);
};

export const BackgroundRemovalScene = Interactive.create({
	Component: BackgroundRemovalSceneInner,
	layout: 'absolute-fill',
});
