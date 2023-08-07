import {preloadAudio, preloadVideo} from '@remotion/preload';
import {Gif} from '@remotion/gif';
import {AbsoluteFill, Audio, Sequence, Series, staticFile} from 'remotion';

preloadVideo(
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
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
				<Audio src={staticFile('sample.mp3')} volume={0.2} />
			</Sequence>
			<Series>
				<Series.Sequence durationInFrames={10}>
					<AbsoluteFill />
				</Series.Sequence>
			</Series>
			<AbsoluteFill>
				<Gif
					src="https://media.giphy.com/media/xT0GqH01ZyKwd3aT3G/giphy.gif"
					fit="cover"
					height={200}
					width={200}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
