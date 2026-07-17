import {loadFont} from '@remotion/fonts';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
	Easing,
} from 'remotion';
import {ApplicationRenderButton} from './Applications/RenderButton';
import {ApplicationSimpleApp} from './Applications/SimpleApp';
import {ApplicationVideoEditor} from './Applications/VideoEditor';

loadFont({
	family: 'GT Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

export function Applications() {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Sequence
				durationInFrames={180}
				name="Simple application slide"
				style={{
					translate: interpolate(
						frame,
						[0, 85, 95, 167, 179],
						['0px 0px', '0px 0px', '-1240px 0px', '-1240px 0px', '0px 0px'],
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
				<ApplicationSimpleApp />
			</Sequence>
			<Sequence
				durationInFrames={180}
				name="Video editor slide"
				style={{
					translate: interpolate(
						frame,
						[0, 85, 95, 167, 179],
						['1240px 0px', '1240px 0px', '0px 0px', '0px 0px', '1240px 0px'],
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
				<ApplicationVideoEditor />
			</Sequence>
			<Sequence>
				<ApplicationRenderButton />
			</Sequence>
		</AbsoluteFill>
	);
}

export {ApplicationRenderButton, ApplicationSimpleApp, ApplicationVideoEditor};
