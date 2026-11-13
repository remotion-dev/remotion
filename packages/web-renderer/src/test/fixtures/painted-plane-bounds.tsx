import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const paintedPlaneBounds = (preserving: boolean) => {
	const Component = () => {
		const frame = useCurrentFrame();
		return (
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					transformStyle: preserving ? 'preserve-3d' : 'flat',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 200 + frame,
						top: 100,
						width: 100,
						height: 100,
						backgroundColor: 'blue',
						backfaceVisibility: 'visible',
						transform: 'perspective(200px) translateX(-100px) rotateY(100deg)',
						transformOrigin: '0px 0px',
					}}
				/>
			</AbsoluteFill>
		);
	};
	return {
		component: Component,
		id: `painted-plane-bounds-${preserving ? 'preserving' : 'flat'}`,
		width: 300,
		height: 300,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
