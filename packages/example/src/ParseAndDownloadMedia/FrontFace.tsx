import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const FrontFace: React.FC<{
	readonly prog: number;
	readonly delay: number;
}> = ({prog, delay}) => {
	return (
		<div
			className="h-full w-full overflow-hidden border-black border-solid border-4"
			style={{backgroundColor: 'white', borderRadius: 40}}
		>
			<div
				style={{
					width: `${interpolate(prog, [0, 1], [0, 100])}%`,
				}}
				className="bg-[#0B84F3] h-full"
			/>
			<ProgressLine delay={35 + delay} lineHeight={300} left={40}>
				onContainer("mp4")
			</ProgressLine>
			<ProgressLine delay={87 + delay} lineHeight={240} left={200}>
				onDurationInSeconds(30.0)
			</ProgressLine>
		</div>
	);
};

const ProgressLine: React.FC<{
	readonly left: number;
	readonly lineHeight: number;
	readonly children: React.ReactNode;
	readonly delay: number;
}> = ({left, lineHeight, children, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const prog = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 20,
		delay,
	});
	const opacity = interpolate(frame, [20 + delay, 30 + delay], [0, 1]);

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				marginLeft: left,
				fontFamily: 'GT Planar',
				fontSize: 30,
			}}
		>
			<div
				className="bg-black"
				style={{
					width: 3,
					height: lineHeight * prog,
				}}
			/>
			<div
				style={{
					marginLeft: -20,
					opacity,
				}}
			>
				{children}
			</div>
		</div>
	);
};
