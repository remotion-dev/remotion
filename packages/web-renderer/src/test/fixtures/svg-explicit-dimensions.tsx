import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Reproduces issue #6186: SVG with explicit width/height properties
 * and viewBox renders incorrectly - the SVG appears smaller than intended,
 * constrained to parent container size instead of respecting its own dimensions.
 *
 * The SVG has width={1080} height={1080} as props (not just styles),
 * but is inside a smaller container (256×284px). The SVG should render
 * at its specified dimensions and overflow the container.
 */
const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{}}>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#f0f0f0',
					width: 1080,
					height: 1080,
					scale: 1 / 4,
					transformOrigin: '0 0',
				}}
			>
				<div
					style={{
						width: 256,
						height: 284,
						backgroundColor: '#e0e0e0',
						display: 'flex',
					}}
				>
					<svg viewBox="0 0 1080 1080" width={1080} height={1080} fill="none">
						<rect x="0" y="0" width="1080" height="1080" fill="#3498db" />
						<circle cx="540" cy="540" r="400" fill="#e74c3c" />
						<rect x="340" y="340" width="400" height="400" fill="#2ecc71" />
					</svg>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const svgExplicitDimensions = {
	component: Component,
	id: 'svg-explicit-dimensions',
	width: 1080 / 4,
	height: 1080 / 4,
	fps: 30,
	durationInFrames: 1,
} as const;
