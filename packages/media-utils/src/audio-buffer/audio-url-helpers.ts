import {audioBufferToWav} from './audio-buffer-to-wav';

export const audioBufferToDataUrl = (buffer: AudioBuffer) => {
	const wavAsArrayBuffer = audioBufferToWav(buffer, {
		float32: false,
	});
	let binary = '';
	const bytes = new Uint8Array(wavAsArrayBuffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return window.btoa(binary);
};
