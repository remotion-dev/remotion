import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {
	TranslateX,
	TranslateY,
	TranslateZ,
} from '../3DContext/transformation-context';
import {DepthContext} from './JumpThenDisappear-context';
import {remapSpeed, takeOffSpeedFucntion} from './JumpThenDisappear-utils';

export const JumpThenDisappear: React.FC<{
	children: React.ReactNode;
	delay: number;
}> = ({children, delay}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const acceleratedFrame = remapSpeed(
		frame - 130 - delay,
		takeOffSpeedFucntion,
	);

	const translateZ = interpolate(acceleratedFrame, [0, 30], [0, -1400]);

	const depth = Math.max(
		0.01,
		spring({
			fps,
			frame,
			delay: 87 + delay,
			durationInFrames: 20,
		}) * 40,
	);

	return (
		<TranslateX px={-40}>
			<TranslateY px={70}>
				<TranslateZ px={translateZ}>
					<DepthContext.Provider value={depth}>
						{children}
					</DepthContext.Provider>
				</TranslateZ>
			</TranslateY>
		</TranslateX>
	);
};
