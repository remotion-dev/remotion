import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(15, 23, 42)'}}>
			<AbsoluteFill
				style={{
					width: 3132,
					height: 2582,
					translate: '-486.3px 18.4px',
					rotate: '0.977622 -0.072309 -0.197554 36.030401deg',
					scale: 1.177,
					backgroundColor: 'rgb(226, 232, 240)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 600,
						height: 600,
						backgroundColor: 'rgb(239, 68, 68)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						right: 0,
						top: 0,
						width: 600,
						height: 600,
						backgroundColor: 'rgb(59, 130, 246)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: 0,
						bottom: 0,
						width: 600,
						height: 600,
						backgroundColor: 'rgb(34, 197, 94)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						right: 0,
						bottom: 0,
						width: 600,
						height: 600,
						backgroundColor: 'rgb(234, 179, 8)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: 1316,
						top: 1041,
						width: 500,
						height: 500,
						backgroundColor: 'rgb(168, 85, 247)',
						borderRadius: '50%',
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const issue10441TransformShorthands = {
	component: Component,
	id: 'issue-10441-transform-shorthands',
	width: 2160,
	height: 2160,
	fps: 30,
	durationInFrames: 1,
} as const;
