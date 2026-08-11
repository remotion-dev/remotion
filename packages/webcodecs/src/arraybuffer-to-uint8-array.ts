export const arrayBufferToUint8Array = (
	buffer: ArrayBuffer | null,
): Uint8Array | null => {
	return buffer ? new Uint8Array(buffer) : null;
};
