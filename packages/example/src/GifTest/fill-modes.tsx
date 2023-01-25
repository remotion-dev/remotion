import {Gif} from '@remotion/gif';
import {AbsoluteFill, Sequence} from 'remotion';

const GifTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				flex: 1,
				flexDirection: 'row',
				display: 'flex',
			}}
		>
			<Sequence durationInFrames={30}>
				<Gif
					fit="contain"
					style={{
						width: 1920,
						height: 1080,
					}}
					src="https://c.tenor.com/pCcL8OOdEBUAAAAC/gifs-away-gif.gif"
				/>
			</Sequence>
			<Sequence from={30} durationInFrames={30}>
				<Gif
					fit="cover"
					style={{
						width: 1920,
						height: 1080,
					}}
					src="https://c.tenor.com/pCcL8OOdEBUAAAAC/gifs-away-gif.gif"
				/>
			</Sequence>
			<Sequence from={60} durationInFrames={30}>
				<Gif
					fit="fill"
					style={{
						width: 1920,
						height: 1080,
					}}
					src="https://c.tenor.com/pCcL8OOdEBUAAAAC/gifs-away-gif.gif"
				/>
			</Sequence>
		</AbsoluteFill>
	);
};

export default GifTest;
