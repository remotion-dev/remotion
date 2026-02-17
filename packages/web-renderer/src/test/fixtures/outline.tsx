import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				gap: 20,
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lightblue',
					outline: '5px solid blue',
				}}
			/>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lightgreen',
					outline: '3px dashed green',
					borderRadius: 10,
				}}
			/>
			<div
				style={{
					width: 100,
					height: 100,
					transform: 'rotateX(30deg) rotateY(30deg)',
					backgroundColor: 'lightyellow',
					outline: '2px dotted orange',
					outlineOffset: 5,
					overflow: 'hidden',
				}}
			/>
		</AbsoluteFill>
	);
};

export const outline = {
	component: Component,
	id: 'outline',
	width: 200,
	height: 450,
	fps: 25,
	durationInFrames: 1,
} as const;
