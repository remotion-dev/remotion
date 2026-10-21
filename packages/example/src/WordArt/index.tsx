import {WordArt} from '@remotion/wordart';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const WordArtGallery: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const distortion = interpolate(frame, [0, fps], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{backgroundColor: '#f7f5f0', padding: 64, fontFamily: 'Arial'}}
		>
			<div style={{fontSize: 18, letterSpacing: 3, color: '#6c6b67'}}>
				@REMOTION/WORDART
			</div>
			<div style={{fontSize: 52, fontWeight: 700, marginTop: 16}}>
				Some things never go out of style.
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 28,
					marginTop: 40,
				}}
			>
				{(['rainbow', 'orange', 'blue-wave', 'chrome'] as const).map(
					(preset, index) => (
						<div
							key={preset}
							style={{
								background: 'white',
								border: '1px solid #dddcd6',
								padding: '20px 24px',
							}}
						>
							<div style={{fontSize: 16, color: '#77766f'}}>
								0{index + 1} / {preset}
							</div>
							<WordArt
								preset={preset}
								width={510}
								height={210}
								distortion={distortion}
							>
								WordArt
							</WordArt>
						</div>
					),
				)}
			</div>
		</AbsoluteFill>
	);
};
