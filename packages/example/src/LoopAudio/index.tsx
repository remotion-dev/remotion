import {getAudioDurationInSeconds} from '@remotion/media-utils';
import React, {useEffect, useState} from 'react';
import {
	Audio,
	continueRender,
	delayRender,
	Loop,
	staticFile,
	useVideoConfig,
} from 'remotion';

const LoopedAudio: React.FC = () => {
	const [duration, setDuration] = useState<null | number>(null);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	useEffect(() => {
		getAudioDurationInSeconds(staticFile('22khz.wav'))
			.then((d) => {
				setDuration(d);
				continueRender(handle);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [handle]);

	if (duration === null) {
		return null;
	}

	return (
		<Loop durationInFrames={Math.floor(fps * duration)}>
			<Audio src={staticFile('22khz.wav')} />
		</Loop>
	);
};

export default LoopedAudio;
