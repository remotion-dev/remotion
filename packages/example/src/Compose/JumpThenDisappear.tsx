import {createContext} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {
	TranslateX,
	TranslateY,
	TranslateZ,
} from '../3DContext/transformation-context';

export const takeOffSpeedFucntion = (f: number) =>
	10 ** interpolate(f, [0, 120], [-1, 4]);

export const remapSpeed = (frame: number, speed: (fr: number) => number) => {
	let framesPassed = 0;
	for (let i = 0; i <= frame; i++) {
		framesPassed += speed(i);
	}

	return framesPassed;
};

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
					<DepthContext value={depth}>{children}</DepthContext>
				</TranslateZ>
			</TranslateY>
		</TranslateX>
	);
};

export const DepthContext = createContext<number>(0);
