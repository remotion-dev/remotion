import {Audio, Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const HOUR_LONG_TIMELINE_FPS = 30;
export const HOUR_LONG_TIMELINE_DURATION_IN_FRAMES =
	60 * 60 * HOUR_LONG_TIMELINE_FPS;

const minutesToFrames = (minutes: number) => {
	return minutes * 60 * HOUR_LONG_TIMELINE_FPS;
};

const OVERLAY_CLIPS: Array<{
	readonly name: string;
	readonly from: number;
	readonly durationInFrames: number;
	readonly src: string;
}> = [
	{
		name: 'Start',
		from: 0,
		durationInFrames: 10 * HOUR_LONG_TIMELINE_FPS,
		src: 'https://remotion.media/video-10s.mp4',
	},
	{
		name: 'Five minutes',
		from: minutesToFrames(5),
		durationInFrames: 10 * HOUR_LONG_TIMELINE_FPS,
		src: 'https://remotion.media/video.mp4',
	},
	{
		name: 'Fifteen minutes',
		from: minutesToFrames(15),
		durationInFrames: 30 * HOUR_LONG_TIMELINE_FPS,
		src: 'https://remotion.media/video-30s.mp4',
	},
	{
		name: 'Halfway',
		from: minutesToFrames(30),
		durationInFrames: 60 * HOUR_LONG_TIMELINE_FPS,
		src: 'https://remotion.media/video-1m.mp4',
	},
	{
		name: 'Forty-five minutes',
		from: minutesToFrames(45),
		durationInFrames: 10 * HOUR_LONG_TIMELINE_FPS,
		src: 'https://remotion.media/video-10s.mp4',
	},
	{
		name: 'Near the end',
		from: HOUR_LONG_TIMELINE_DURATION_IN_FRAMES - 20 * HOUR_LONG_TIMELINE_FPS,
		durationInFrames: 10 * HOUR_LONG_TIMELINE_FPS,
		src: 'https://remotion.media/video.mp4',
	},
];

export const HourLongTimelineTestbed: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#111'}}>
			<Video
				name="Looped minute"
				src="https://remotion.media/video-1m.mp4"
				loop
			/>
			{OVERLAY_CLIPS.map((clip) => (
				<Sequence
					key={clip.name}
					from={clip.from}
					durationInFrames={clip.durationInFrames}
					name={clip.name}
				>
					<Video src={clip.src} />
				</Sequence>
			))}
			<Audio name="Music" src="https://remotion.media/music.mp3" loop />
			<Sequence
				from={minutesToFrames(10)}
				durationInFrames={minutesToFrames(5)}
				name="Dialogue"
			>
				<Audio src="https://remotion.media/dialogue.wav" />
			</Sequence>
		</AbsoluteFill>
	);
};
