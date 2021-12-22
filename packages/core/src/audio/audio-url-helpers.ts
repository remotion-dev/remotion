export const uint8ToBase64 = (buffer: ArrayBuffer) => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return window.btoa(binary);
}

export const getBlobURL = (arrayBuffer: ArrayBuffer) => {
	const blob = new Blob([arrayBuffer], { type: "audio/wav" });
	const url = URL.createObjectURL(blob);
	return url
}
