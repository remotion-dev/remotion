import {interpolate} from 'remotion';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
	Audio,
	Sequence,
	continueRender,
	delayRender,
	useVideoConfig,
} from 'remotion';
import {audioBufferToDataUrl} from '@remotion/media-utils';

const C4_FREQUENCY = 261.63;
const sampleRate = 44100;
const audioDurationInFrames = 300;

export const OfflineAudioBufferExample: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
	const {fps} = useVideoConfig();
	const lengthInSeconds = audioDurationInFrames / fps;

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
		setAudioBuffer(buffer);

		continueRender(handle);
	}, [handle, lengthInSeconds]);

	const audioBufferSrc = useMemo(() => {
		if (audioBuffer) {
			const arrayBufferAsBase64 = audioBufferToDataUrl(audioBuffer);
			return arrayBufferAsBase64;
		}
		return null;
	}, [audioBuffer]);

	useEffect(() => {
		renderAudio();
	}, [renderAudio]);

	return (
		<div
			style={{
				fontFamily: 'Helvetica, Arial',
				fontSize: 50,
				background: '#DC136C',
				color: 'white',
				textAlign: 'center',
				position: 'absolute',
				bottom: 50,
				zIndex: 99999,
				padding: '20px',
				width: '100%',
			}}
		>
			{audioBufferSrc && (
				<Sequence from={100} durationInFrames={100}>
					<Audio
						src={audioBufferSrc}
						startFrom={0}
						endAt={100}
						volume={(f) =>
							interpolate(f, [0, 50, 100], [0, 1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})
						}
					/>
				</Sequence>
			)}
			Render sound from offline audio buffer
		</div>
	);
};

export default OfflineAudioBufferExample;
