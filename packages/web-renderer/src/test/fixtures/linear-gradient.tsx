import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#f0f0f0',
				padding: 15,
				display: 'flex',
				flexWrap: 'wrap',
				gap: 20,
			}}
		>
			{/* Simple horizontal gradient */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(to right, red, blue)',
				}}
			/>

			{/* Vertical gradient with named colors */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(to bottom, yellow, purple)',
				}}
			/>

			{/* Angle gradient (45deg) */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(45deg, green, orange)',
				}}
			/>

			{/* Multiple color stops with positions */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage:
						'linear-gradient(to right, red 0%, yellow 50%, blue 100%)',
				}}
			/>

			{/* Gradient with rgba colors */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage:
						'linear-gradient(135deg, rgba(255,0,0,0.5), rgba(0,0,255,0.8))',
				}}
			/>

			{/* Gradient with border radius */}
			<div
				style={{
					width: 100,
					height: 80,
					borderRadius: 20,
					backgroundImage: 'linear-gradient(to bottom right, #ff00ff, #00ffff)',
				}}
			/>

			{/* Gradient with hex colors */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(90deg, #ff0000, #0000ff)',
				}}
			/>

			{/* Vertical gradient (to top) */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(to top, black, white)',
				}}
			/>

			{/* Default direction (no direction specified = to bottom) */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(cyan, magenta)',
				}}
			/>

			{/* Multiple stops without explicit positions */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage:
						'linear-gradient(to right, red, yellow, green, blue)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const linearGradient = {
	component: Component,
	id: 'linear-gradient',
	width: 700,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
