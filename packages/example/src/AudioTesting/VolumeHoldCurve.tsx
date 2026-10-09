import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const VolumeHoldCurve: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#111827',
				color: 'white',
				fontFamily: 'sans-serif',
				padding: 48,
			}}
		>
			<h1 style={{fontSize: 48, margin: 0}}>Volume hold curves</h1>
			<p style={{fontSize: 26, lineHeight: 1.5}}>
				Zoom into the timeline waveform. Holds should have vertical edges at
				frames 60, 120, and 188. The fade changes from frames 180 to 240.
			</p>
			<p style={{fontSize: 24}}>Frame {frame} / 299</p>
			<Video
				name="Video: hold drops at 188"
				src={staticFile('demo_smpte_h264_aac.mp4')}
				loop
				loopVolumeCurveBehavior="extend"
				durationInFrames={300}
				style={{
					width: 480,
					height: 270,
					position: 'absolute',
					right: 48,
					bottom: 48,
				}}
				volume={(f) =>
					interpolate(f, [187, 188], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [Easing.step1],
					})
				}
			/>
			<Audio
				name="Audio: holds at 60 and 120, then smooth fade"
				src={staticFile('audio-48000hz.wav')}
				loop
				loopVolumeCurveBehavior="extend"
				durationInFrames={300}
				volume={(f) =>
					interpolate(f, [0, 60, 120, 180, 240], [1, 0.25, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.step1,
							Easing.step1,
							Easing.linear,
							Easing.bezier(0.42, 0, 0.58, 1),
						],
					})
				}
			/>
		</AbsoluteFill>
	);
};

export const VolumeHoldCurveComposition: React.FC = () => {
	return (
		<Composition
			id="volume-hold-curve"
			component={VolumeHoldCurve}
			durationInFrames={300}
			fps={30}
			width={1280}
			height={720}
		/>
	);
};
