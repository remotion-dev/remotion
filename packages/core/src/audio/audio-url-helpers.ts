export const uint8ToBase64 = (buffer: AudioBuffer) => {
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

export const getBlobURL = (buffer: AudioBuffer) => {
	const wavAsArrayBuffer = audioBufferToWav(buffer, {float32: false});
	const blob = new Blob([wavAsArrayBuffer], {type: 'audio/wav'});
	const url = URL.createObjectURL(blob);
	return url;
};
