import {useEffect, useState} from 'react';
import {Audio, continueRender, delayRender} from 'remotion';

import * as Tone from 'tone';
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

export const ToneJSExample: React.FC = () => {
	const [handle] = useState(() => delayRender());
	const [audioDataURL, setAudioDataURL] = useState('');

	const renderAudio = async () => {
		const buffer = await Tone.Offline(() => {
			const synth = new Tone.Synth().toDestination();
			const now = Tone.now()
			synth.triggerAttackRelease("C4", "8n", now + .5)
			synth.triggerAttackRelease("E4", "8n", now + 1)
			synth.triggerAttackRelease("G4", "8n", now + 1.5)
		}, 5);

		// This should probably be moved to the Audio component.
		const nativeAudioBuffer = buffer.get() as AudioBuffer;
		if (nativeAudioBuffer) {
			const wavAsArrayBuffer = toWav(nativeAudioBuffer);
			const arrayBufferAsBase64 = uint8ToBase64(wavAsArrayBuffer);
			setAudioDataURL('data:audio/wav;base64,' + arrayBufferAsBase64);
		}

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
			{audioDataURL !== '' && (
				<>
					<Audio fromAudioBuffer src={audioDataURL} />
				</>
			)}
			Rendering sound with ToneJS.Offline
		</div>
	);
};
