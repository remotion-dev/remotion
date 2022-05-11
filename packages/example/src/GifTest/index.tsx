import {Gif} from '@remotion/gif';
import {Sequence, staticFile, useVideoConfig} from 'remotion';

const GifTest: React.FC = () => {
	const {width, height} = useVideoConfig();
	const giphy = staticFile('giphy.gif');

	return (
		<div style={{flex: 1, backgroundColor: 'black'}}>
			<Sequence from={0} durationInFrames={50}>
				<Gif src={giphy} width={width} height={height} fit="fill" />
			</Sequence>

			<Sequence from={50} durationInFrames={50}>
				<Gif
					src="https://media.giphy.com/media/xT0GqH01ZyKwd3aT3G/giphy.gif"
					width={width}
					height={height}
					fit="cover"
				/>
			</Sequence>

			<Sequence from={100} durationInFrames={50}>
				<Gif
					src="https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif"
					width={width}
					height={height}
					fit="contain"
				/>
			</Sequence>
		</div>
	);
};

export default GifTest;
