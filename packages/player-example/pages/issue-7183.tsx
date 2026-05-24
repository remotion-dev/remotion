import {Player} from '@remotion/player';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const MyComp: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background:
					'linear-gradient(180deg, #f43f5e 0 18%, #111827 18% 82%, #22c55e 82% 100%)',
				color: 'white',
				fontFamily: 'sans-serif',
				fontSize: 64,
				fontWeight: 700,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			Issue #7183
		</AbsoluteFill>
	);
};

const Issue7183 = () => {
	return (
		<main
			style={{
				fontFamily: 'sans-serif',
				margin: 40,
				maxWidth: 900,
			}}
		>
			<h1>Player issue #7183 repro</h1>
			<p>
				The 16:9 composition should fill the 320 x 180 plate. The current Player
				measurement bug can vertically offset the composition inside this
				3D-transformed parent.
			</p>
			<div
				style={{
					background: '#e5e7eb',
					border: '1px solid #d1d5db',
					borderRadius: 8,
					marginTop: 32,
					padding: 80,
				}}
			>
				<div
					style={{
						width: 320,
						height: 180,
						transform: 'rotateY(45deg) rotateX(-15deg)',
						transformStyle: 'preserve-3d',
						background:
							'repeating-conic-gradient(#f8fafc 0 25%, #cbd5e1 0 50%)',
						backgroundSize: '40px 40px',
						outline: '4px solid #2563eb',
					}}
				>
					<Player
						component={MyComp}
						compositionWidth={1920}
						compositionHeight={1080}
						durationInFrames={300}
						fps={30}
						acknowledgeRemotionLicense
						style={{width: '100%', height: '100%'}}
					/>
				</div>
			</div>
			<p>
				Route for{' '}
				<a href="https://github.com/remotion-dev/remotion/issues/7183">
					github.com/remotion-dev/remotion/issues/7183
				</a>
				.
			</p>
		</main>
	);
};

export default Issue7183;
