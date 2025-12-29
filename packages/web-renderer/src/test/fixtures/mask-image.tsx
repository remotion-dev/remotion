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
			{/* Horizontal fade from transparent to visible */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'red',
					maskImage: 'linear-gradient(to right, transparent, black)',
				}}
			/>
			{/* Vertical fade from visible to transparent */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'blue',
					maskImage: 'linear-gradient(to bottom, black, transparent)',
				}}
			/>
			{/* Diagonal fade */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'green',
					maskImage: 'linear-gradient(45deg, transparent, black)',
				}}
			/>
			{/* Center fade (visible in middle) */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'purple',
					maskImage:
						'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)',
				}}
			/>
			{/* Mask with gradient background */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundImage: 'linear-gradient(to right, red, blue)',
					maskImage: 'linear-gradient(to bottom, black, transparent)',
				}}
			/>
			{/* Mask with border-radius */}
			<div
				style={{
					width: 100,
					height: 80,
					borderRadius: 20,
					backgroundColor: 'orange',
					maskImage: 'linear-gradient(to right, transparent, black)',
				}}
			/>
			{/* Webkit prefix version */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'cyan',
					WebkitMaskImage: 'linear-gradient(to left, transparent, black)',
				}}
			/>
			{/* Using rgba in mask */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'magenta',
					maskImage: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,1))',
				}}
			/>
			{/* Using rgba in mask */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'magenta',
					maskImage: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,1))',
				}}
			>
				<AbsoluteFill style={{backgroundColor: 'blue'}} />
			</div>
		</AbsoluteFill>
	);
};

export const maskImage = {
	component: Component,
	id: 'mask-image',
	width: 700,
	height: 300,
	fps: 25,
	durationInFrames: 1,
} as const;
