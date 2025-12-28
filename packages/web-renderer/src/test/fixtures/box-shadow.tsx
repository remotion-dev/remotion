import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#f0f0f0',
				padding: 20,
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
			}}
		>
			{/* Plain box shadow */}
			<div
				style={{
					backgroundColor: 'white',
					width: 100,
					height: 80,
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
				}}
			/>

			{/* Box shadow with border radius */}
			<div
				style={{
					backgroundColor: 'white',
					width: 100,
					height: 80,
					borderRadius: 20,
					boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
				}}
			/>

			{/* Box shadow with spread radius */}
			<div
				style={{
					backgroundColor: 'white',
					width: 100,
					height: 80,
					boxShadow: '0 4px 10px 8px rgba(0, 0, 0, 0.3)',
				}}
			/>

			{/* Box shadow with overflow: hidden */}
			<div
				style={{
					backgroundColor: 'white',
					width: 100,
					height: 80,
					overflow: 'hidden',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
				}}
			>
				<div
					style={{
						backgroundColor: 'blue',
						width: 150,
						height: 100,
					}}
				/>
			</div>

			{/* Box shadow with outline */}
			<div
				style={{
					backgroundColor: 'white',
					width: 100,
					height: 80,
					boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
					outline: '3px solid red',
					outlineOffset: 2,
				}}
			/>

			{/* Box shadow on element with 3D rotation */}
			<div
				style={{
					perspective: 500,
					width: 100,
					height: 80,
				}}
			>
				<div
					style={{
						backgroundColor: 'white',
						width: '100%',
						height: '100%',
						boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
						transform: 'rotateX(30deg) rotateY(20deg)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const boxShadow = {
	component: Component,
	id: 'box-shadow',
	width: 400,
	height: 600,
	fps: 25,
	durationInFrames: 1,
} as const;
