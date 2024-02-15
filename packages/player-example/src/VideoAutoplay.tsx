import {preloadAudio, preloadVideo} from '@remotion/preload';
import {Gif} from '@remotion/gif';
import {
	AbsoluteFill,
	Audio,
	Sequence,
	Series,
	staticFile,
	useCurrentScale,
	Video,
} from 'remotion';

preloadVideo(
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
);

preloadAudio(staticFile('sample.mp3'));

export const VideoautoplayDemo = () => {
	console.log(useCurrentScale());
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
			}}
		>
			<Sequence from={20}>
				<Audio src={staticFile('sample.mp3')} volume={0.2} />
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
