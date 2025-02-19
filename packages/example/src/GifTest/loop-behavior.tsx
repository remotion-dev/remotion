import {Gif} from '@remotion/gif';
import {Series} from 'remotion';

const GifLoopBehavior: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={180}>
				<Gif
					loopBehavior="pause-after-finish"
					style={{
						width: 1920,
						height: 1080,
					}}
					src="https://c.tenor.com/pCcL8OOdEBUAAAAC/gifs-away-gif.gif"
				/>
			</Series.Sequence>
			<Series.Sequence durationInFrames={180}>
				<Gif
					loopBehavior="loop"
					style={{
						width: 1920,
						height: 1080,
					}}
					src="https://c.tenor.com/pCcL8OOdEBUAAAAC/gifs-away-gif.gif"
				/>
			</Series.Sequence>
			<Series.Sequence durationInFrames={180}>
				<Gif
					loopBehavior="unmount-after-finish"
					fit="fill"
					style={{
						width: 1920,
						height: 1080,
					}}
					src="https://c.tenor.com/pCcL8OOdEBUAAAAC/gifs-away-gif.gif"
				/>
			</Series.Sequence>
		</Series>
	);
};

export default GifLoopBehavior;
