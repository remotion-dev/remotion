import {useEffect, useState} from 'react';
import {Audio, continueRender, delayRender} from 'remotion';

// Can we use this? :thinking:
import { getRemotionEnvironment } from '../../../core/dist/get-environment';

import toWav from 'audiobuffer-to-wav';

function uint8ToBase64(buffer: ArrayBuffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

export const OfflineAudioBufferExample: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const [audioDataURL, setAudioDataURL] = useState('');
	const remotionEnv = getRemotionEnvironment();
	const C4_FREQUENCY = 261.63;
	const sampleRate = 44100;
	const lengthInSeconds = 2;

	const renderAudio = async () => {
		const offlineContext = new OfflineAudioContext({
			numberOfChannels: 2,
			length: sampleRate * lengthInSeconds,
			sampleRate,
		});
		const oscillatorNode = offlineContext.createOscillator();
		const gainNode = offlineContext.createGain();
		oscillatorNode.connect(gainNode);
		gainNode.connect(offlineContext.destination);

		oscillatorNode.type = "sine";
		oscillatorNode.frequency.value = C4_FREQUENCY;

		const {currentTime} = offlineContext;
		oscillatorNode.start(currentTime);
		oscillatorNode.stop(currentTime + 1);

		const buffer = await offlineContext.startRendering();

		if (remotionEnv !== 'rendering') {
			const audioContext = new AudioContext();
			const bufferSource = audioContext.createBufferSource();
			bufferSource.buffer = buffer;
			bufferSource.connect(audioContext.destination);
			bufferSource.start();

			return;
		}

		const wavAsArrayBuffer = toWav(buffer);
		const arrayBufferAsBase64 = uint8ToBase64(wavAsArrayBuffer);
		setAudioDataURL('data:audio/wav;base64,' + arrayBufferAsBase64);

		continueRender(handle);
	};

	useEffect(() => {
		renderAudio();
	}, []);

	return (
		<div
			style={{
				fontFamily: 'Helvetica, Arial',
				fontSize: 50,
				background: '#908800',
				color: 'white',
				textAlign: 'center',
				position: 'absolute',
				bottom: 50,
				zIndex: 99999,
				padding: '20px',
				width: '100%'
			}}
		>
			{audioDataURL !== '' && <Audio fromAudioBuffer src={audioDataURL} /> }
			Render sound from offline audio buffer
		</div>
	);
};
