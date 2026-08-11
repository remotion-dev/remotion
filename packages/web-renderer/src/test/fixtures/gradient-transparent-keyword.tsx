import {AbsoluteFill} from 'remotion';

const FADE_HEIGHT = 80;

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
			{/* "transparent" keyword means rgba(0,0,0,0), but Chrome interpolates
			    it as rgba(255,255,255,0) when paired with white. The web renderer
			    must match Chrome's behavior. */}
			<div style={{width: 200, height: 200, position: 'relative'}}>
				<div
					style={{
						width: '100%',
						height: '100%',
						backgroundColor: 'blue',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: FADE_HEIGHT,
						background: 'linear-gradient(to top, white, transparent)',
						pointerEvents: 'none',
					}}
				/>
			</div>

			{/* Same but with red — transparent should interpolate toward rgba(255,0,0,0) */}
			<div style={{width: 200, height: 200, position: 'relative'}}>
				<div
					style={{
						width: '100%',
						height: '100%',
						backgroundColor: 'blue',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: FADE_HEIGHT,
						background: 'linear-gradient(to top, red, transparent)',
						pointerEvents: 'none',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const gradientTransparentKeyword = {
	component: Component,
	id: 'gradient-transparent-keyword',
	width: 500,
	height: 250,
	fps: 25,
	durationInFrames: 1,
} as const;
