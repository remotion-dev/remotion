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
			{/* children content */}
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
			{/* children content with 3d transform and box shadow */}
			<div
				style={{
					width: 100,
					height: 80,
					backgroundColor: 'magenta',
					boxShadow: '0 10px 10px rgba(0, 0, 0, 0.5)',
					position: 'relative',
					// Mask image should be ignored!
					maskImage: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,1))',
					transform: 'rotateX(20deg) rotateY(20deg)',
				}}
			>
				<AbsoluteFill
					style={{
						backgroundColor: 'blue',
					}}
				/>
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

const TransformedVisibility = () => (
	<AbsoluteFill style={{backgroundColor: 'white'}}>
		{[
			'matrix(1, 0, 0, 1, -110, 0)',
			'matrix(-1, 0, 0, 1, 150, 0)',
			'matrix(0, -1, 1, 0, 0, 150)',
		].map((transform, index) => (
			<div
				key={transform}
				style={{
					position: 'absolute',
					left: 0,
					top: index * 35,
					width: 60,
					height: 40,
					transform,
					transformOrigin: '0 0',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 120,
						top: 10,
						width: 20,
						height: 20,
						backgroundColor: 'red',
						maskImage: 'linear-gradient(black, black)',
					}}
				/>
			</div>
		))}
	</AbsoluteFill>
);

export const maskImageTransformedVisibility = {
	component: TransformedVisibility,
	id: 'mask-image-transformed-visibility',
	width: 60,
	height: 110,
	fps: 30,
	durationInFrames: 1,
} as const;

const CulledDescendants = () => (
	<AbsoluteFill style={{backgroundColor: 'white'}}>
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 5,
				width: 20,
				height: 20,
				overflow: 'hidden',
				outlineWidth: 0,
				maskImage: 'linear-gradient(black, black)',
				transform: 'translateX(100px)',
				transformOrigin: '0 0',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: -100,
					top: 0,
					width: 20,
					height: 20,
					backgroundColor: 'red',
				}}
			/>
		</div>
	</AbsoluteFill>
);

export const maskImageCulledDescendants = {
	component: CulledDescendants,
	id: 'mask-image-culled-descendants',
	width: 100,
	height: 30,
	fps: 30,
	durationInFrames: 1,
} as const;
