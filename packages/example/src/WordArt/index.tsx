import {
	RainbowWordArt,
	OrangeWordArt,
	BlueWaveWordArt,
	ChromeWordArt,
} from '@remotion/wordart';
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
				<div
					style={{
						background: 'white',
						border: '1px solid #dddcd6',
						padding: '20px 24px',
					}}
				>
					<div style={{fontSize: 16, color: '#77766f'}}>
						01 / RainbowWordArt
					</div>
					<RainbowWordArt width={510} height={210} distortion={distortion}>
						WordArt
					</RainbowWordArt>
				</div>
				<div
					style={{
						background: 'white',
						border: '1px solid #dddcd6',
						padding: '20px 24px',
					}}
				>
					<div style={{fontSize: 16, color: '#77766f'}}>02 / OrangeWordArt</div>
					<OrangeWordArt width={510} height={210} distortion={distortion}>
						WordArt
					</OrangeWordArt>
				</div>
				<div
					style={{
						background: 'white',
						border: '1px solid #dddcd6',
						padding: '20px 24px',
					}}
				>
					<div style={{fontSize: 16, color: '#77766f'}}>
						03 / BlueWaveWordArt
					</div>
					<BlueWaveWordArt width={510} height={210} distortion={distortion}>
						WordArt
					</BlueWaveWordArt>
				</div>
				<div
					style={{
						background: 'white',
						border: '1px solid #dddcd6',
						padding: '20px 24px',
					}}
				>
					<div style={{fontSize: 16, color: '#77766f'}}>04 / ChromeWordArt</div>
					<ChromeWordArt width={510} height={210} distortion={distortion}>
						WordArt
					</ChromeWordArt>
				</div>
			</div>
		</AbsoluteFill>
	);
};
