import {getGifDurationInSeconds} from '@remotion/gif';
import {useEffect, useState} from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

const GifTest: React.FC = () => {
	const giphy = staticFile('giphy.gif');
	const [durations, setDurations] = useState<null | number[]>(null);
	useEffect(() => {
		Promise.all([
			getGifDurationInSeconds(giphy),
			getGifDurationInSeconds(
				'https://media.giphy.com/media/xT0GqH01ZyKwd3aT3G/giphy.gif',
			),
			getGifDurationInSeconds(
				'https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif',
			),
		]).then((d) => {
			setDurations(d);
			console.log('GIF durations', d);
		});
	}, [giphy]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				fontSize: 100,
			}}
		>
			Durations = {JSON.stringify(durations)}
		</AbsoluteFill>
	);
};

export default GifTest;
