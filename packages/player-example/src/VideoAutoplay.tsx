import {preloadAudio, preloadVideo} from '@remotion/preload';
import {
	AbsoluteFill,
	Html5Audio,
	Sequence,
	Series,
	Video,
	staticFile,
} from 'remotion';

preloadVideo(
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
);

preloadAudio(staticFile('sample.mp3'));

export const VideoautoplayDemo = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
			}}
		>
			<Sequence from={20}>
				<Html5Audio src={staticFile('sample.mp3')} volume={0.2} />
			</Sequence>
			<Series>
				<Series.Sequence durationInFrames={10}>
					<AbsoluteFill />
				</Series.Sequence>
			</Series>
			<AbsoluteFill>
				<Video
					pauseWhenBuffering
					src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
