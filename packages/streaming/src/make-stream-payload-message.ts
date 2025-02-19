export const magicWordStr = 'remotion_buffer:';

export const makeStreamPayloadMessage = ({
	status,
	body,
	nonce,
}: {
	nonce: string;
	status: 0 | 1;
	body: Uint8Array;
}): Uint8Array => {
	const nonceArr = new TextEncoder().encode(nonce);
	const magicWordArr = new TextEncoder().encode(magicWordStr);
	const separatorArr = new TextEncoder().encode(':');
	const bodyLengthArr = new TextEncoder().encode(body.length.toString());
	const statusArr = new TextEncoder().encode(String(status));

	// Calculate total length of new Uint8Array
	const totalLength =
		nonceArr.length +
		magicWordArr.length +
		separatorArr.length * 3 +
		bodyLengthArr.length +
		statusArr.length +
		body.length;

	// Create a new Uint8Array to hold all combined parts
	const concat = new Uint8Array(totalLength);

	let offset = 0;

	// Function to append data to concat
	const appendToConcat = (data: Uint8Array) => {
		concat.set(data, offset);
		offset += data.length;
	};

	// Building the final Uint8Array
	appendToConcat(magicWordArr);
	appendToConcat(nonceArr);
	appendToConcat(separatorArr);
	appendToConcat(bodyLengthArr);
	appendToConcat(separatorArr);
	appendToConcat(statusArr);
	appendToConcat(separatorArr);
	appendToConcat(body);

	return concat;
};
