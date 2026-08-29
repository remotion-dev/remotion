import {Video} from '@remotion/media';
import type {CSSProperties} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

const src = staticFile('drums-drumsticks.mp4');

const MEDIA_DURATION_IN_FRAMES = 51;

const videoStyle = (left: number, top: number): CSSProperties => ({
	left,
	top,
	width: 640,
	height: 360,
});

export const MediaTimelineTestbed = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Video name="No durationInFrames" src={src} style={videoStyle(0, 0)} />
			<Video
				name="durationInFrames set to media duration"
				src={src}
				durationInFrames={MEDIA_DURATION_IN_FRAMES}
				style={videoStyle(640, 0)}
			/>
			<Video
				name="No durationInFrames, trimBefore 30"
				src={src}
				trimBefore={30}
				style={videoStyle(1280, 0)}
			/>
			<Video
				name="No durationInFrames, playbackRate 2"
				src={src}
				playbackRate={2}
				style={videoStyle(0, 360)}
			/>
			<Video
				name="Media duration, playbackRate 2"
				src={src}
				durationInFrames={MEDIA_DURATION_IN_FRAMES}
				playbackRate={2}
				style={videoStyle(640, 360)}
			/>
			<Video
				name="No durationInFrames, trimBefore 30, playbackRate 2"
				src={src}
				trimBefore={30}
				playbackRate={2}
				style={videoStyle(1280, 360)}
			/>
		</AbsoluteFill>
	);
};
