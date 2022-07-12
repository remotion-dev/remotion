import {
	Series,
	Video,
	AbsoluteFill,
	Audio,
	Sequence,
	Composition,
} from 'remotion';
import {preloadAudio, preloadVideo} from '@remotion/preload';

preloadVideo(
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
);

preloadAudio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

export const VideoautoplayDemo = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
			}}
		>
			<Sequence from={20}>
				<Audio
					src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
					volume={0.2}
				/>
			</Sequence>
			<Series>
				<Series.Sequence durationInFrames={10}>
					<AbsoluteFill />
				</Series.Sequence>
				<Series.Sequence key="video-1" name="Video 1" durationInFrames={450}>
					<Video
						src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
						volume={0.8}
						startFrom={0}
						endAt={450}
						style={{
							height: '100%',
							width: '100%',
							backgroundColor: '#000',
						}}
					/>
				</Series.Sequence>
				<Series.Sequence key="video-2" name="Video 2" durationInFrames={1800}>
					<Video
						src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
						volume={1}
						startFrom={0}
						endAt={1800}
						style={{
							height: '100%',
							width: '100%',
							backgroundColor: '#000',
						}}
					/>
				</Series.Sequence>
				<Series.Sequence key="video-3" name="Video 3" durationInFrames={450}>
					<Video
						src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
						volume={0.8}
						startFrom={0}
						endAt={450}
						style={{
							height: '100%',
							width: '100%',
							backgroundColor: '#000',
						}}
					/>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
