import React from 'react';
import {AbsoluteFillElement} from './AbsoluteFillElement.js';
import {useCurrentScale} from './use-current-scale.js';

const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};
const ICON_SIZE = 40;
const LABEL_SIZE = 14;

const label: React.CSSProperties = {
	color: 'rgba(255, 255, 255, 0.8)',
	fontFamily: 'sans-serif',
};

const container: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: '#1f2428',
};

const content: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	animation: 'anim 2s',
	animationFillMode: 'forwards',
};

export const Loading: React.FC = () => {
	const scale = useCurrentScale({dontThrowIfOutsideOfRemotion: true});

	return (
		<AbsoluteFillElement style={container} id="remotion-comp-loading">
			<style type="text/css">{`
				@keyframes anim {
					from {
						opacity: 0
					}
					to {
						opacity: 1
					}
				}
			`}</style>
			<div id="remotion-comp-loading-content" style={content}>
				<svg
					width={ICON_SIZE / scale}
					height={ICON_SIZE / scale}
					viewBox="-100 -100 400 400"
					style={rotate}
				>
					<path
						fill="#555"
						stroke="#555"
						strokeWidth="100"
						strokeLinejoin="round"
						d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
					/>
				</svg>
				<p style={{...label, fontSize: LABEL_SIZE / scale}}>
					Resolving {'<Suspense>'}...
				</p>
			</div>
		</AbsoluteFillElement>
	);
};
