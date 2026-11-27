import {wave} from '@remotion/effects/wave';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas, useCurrentFrame} from 'remotion';

const width = 420;
const height = 112;

export const GrowBoundsButton: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#171a20',
				fontFamily: 'Inter, system-ui, sans-serif',
			}}
		>
			<div style={{position: 'relative', width, height}}>
				<HtmlInCanvas
					name="Button with wave distortion"
					width={width}
					height={height}
					effects={[
						wave({
							direction: 'horizontal',
							amplitude: 56,
							wavelength: 520,
							phase: (frame / 120) * 2 * Math.PI,
						}),
					]}
					growBounds={96}
				>
					<button
						type="button"
						style={{
							width: '100%',
							height: '100%',
							border: 0,
							borderRadius: 56,
							backgroundColor: '#c5f673',
							color: '#182018',
							font: '650 44px Inter, system-ui, sans-serif',
						}}
					>
						Continue →
					</button>
				</HtmlInCanvas>
			</div>
		</AbsoluteFill>
	);
};
