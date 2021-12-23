import {audioBufferToWav} from './audio-buffer-to-wav';

export const audioBufferToDataUrl = (buffer: AudioBuffer) => {
	const wavAsArrayBuffer = audioBufferToWav(buffer, {
		float32: true,
	});
	let binary = '';
	const bytes = new Uint8Array(wavAsArrayBuffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return 'data:audio/wav;base64,' + window.btoa(binary);
};
