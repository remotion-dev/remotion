export function base64ToHex(str: string): string {
	// Decode the base64 string to a buffer containing the binary data
	const raw = Buffer.from(str, 'base64');

	// Convert the buffer to a hexadecimal string
	let hex = '';
	for (const byte of raw) {
		hex += byte.toString(16).padStart(2, '0'); // Ensure two digits per byte
	}

	return hex;
}
