// Addressing the issue of audio that is stored in big-endian format!
// If a "twos" atom is present, that is the case.
// The samples are stored internally in small chunks, like 4 bytes
// but WebCodecs does not accept such small chunks.

// When entering this function, they are already concatenated, but in litte endian order.
// This function reverses the bytes in each chunk, so that they are in big-endian order.

export const postprocessBytes = ({
	bytes,
	bigEndian,
	chunkSize,
}: {
	bytes: Uint8Array;
	bigEndian: boolean;
	chunkSize: number | null;
}) => {
	if (!bigEndian) {
		return bytes;
	}

	if (chunkSize === null) {
		return bytes;
	}

	const newBuffer = new Uint8Array(bytes);
	for (let i = 0; i < newBuffer.length; i += chunkSize) {
		const slice = newBuffer.slice(i, i + chunkSize);
		slice.reverse();
		newBuffer.set(slice, i);
	}

	return newBuffer;
};
