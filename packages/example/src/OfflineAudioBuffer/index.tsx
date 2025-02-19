import {audioBufferToDataUrl} from '@remotion/media-utils';
import {useCallback, useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	interpolate,
	useVideoConfig,
} from 'remotion';

const C4_FREQUENCY = 261.63;
const sampleRate = 44100;

export const OfflineAudioBufferExample: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const [audioBuffer, setAudioBuffer] = useState<string | null>(null);
	const {fps, durationInFrames} = useVideoConfig();
	const lengthInSeconds = durationInFrames / fps;

	const renderAudio = useCallback(async () => {
		const offlineContext = new OfflineAudioContext({
			numberOfChannels: 2,
			length: sampleRate * lengthInSeconds,
			sampleRate,
		});
		const oscillatorNode = offlineContext.createOscillator();
		const gainNode = offlineContext.createGain();
		oscillatorNode.connect(gainNode);
		gainNode.connect(offlineContext.destination);
		gainNode.gain.setValueAtTime(0.5, offlineContext.currentTime);

		oscillatorNode.type = 'sine';
		oscillatorNode.frequency.value = C4_FREQUENCY;

		const {currentTime} = offlineContext;
		oscillatorNode.start(currentTime);
		oscillatorNode.stop(currentTime + lengthInSeconds);

		const buffer = await offlineContext.startRendering();
		setAudioBuffer(audioBufferToDataUrl(buffer));

		continueRender(handle);
	}, [handle, lengthInSeconds]);

	useEffect(() => {
		renderAudio();
	}, [renderAudio]);

	return (
		<AbsoluteFill>
			{audioBuffer && (
				<Audio
					src={audioBuffer}
					startFrom={0}
					endAt={100}
					volume={(f) =>
						interpolate(f, [0, 50, 100], [0, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			)}
			<AbsoluteFill
				style={{
					fontFamily: 'Helvetica, Arial',
					fontSize: 50,
					color: 'white',
					justifyContent: 'center',
					textAlign: 'center',
				}}
			>
				Render sound from offline audio buffer
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default OfflineAudioBufferExample;
