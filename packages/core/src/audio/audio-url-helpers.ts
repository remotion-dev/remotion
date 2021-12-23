import toWav from 'audiobuffer-to-wav';

export const uint8ToBase64 = (buffer: AudioBuffer) => {
	const wavAsArrayBuffer = toWav(buffer);
	let binary = '';
	const bytes = new Uint8Array(wavAsArrayBuffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return window.btoa(binary);
}

export const getBlobURL = (buffer: AudioBuffer) => {
	const wavAsArrayBuffer = toWav(buffer);
	const blob = new Blob([wavAsArrayBuffer], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);
	return url
}
