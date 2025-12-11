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
					border: '5px solid blue',
					borderRadius: 20,
				}}
			/>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lightgreen',
					border: '3px dashed green',
					borderRadius: 10,
				}}
			/>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: 'lightyellow',
					border: '2px dotted orange',
				}}
			/>
		</AbsoluteFill>
	);
};

export const border = {
	component: Component,
	id: 'border',
	width: 200,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
