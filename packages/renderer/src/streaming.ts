export const streamingKey = 'remotion_buffer:';

const magicWordStr = 'remotion_buffer:';

export const makeStreamer = (
	onMessage: (
		statusType: 'success' | 'error',
		nonce: string,
		data: Uint8Array,
	) => void,
) => {
	const separator = new Uint8Array(magicWordStr.length);
	for (let i = 0; i < magicWordStr.length; i++) {
		separator[i] = magicWordStr.charCodeAt(i);
	}

	let unprocessedBuffers: Uint8Array[] = [];
	let outputBuffer = new Uint8Array(0);
	let missingData: null | {
		dataMissing: number;
	} = null;

	const processInput = () => {
		let separatorIndex = outputBuffer.indexOf(separator[0]); // Start checking for the first byte of the separator
		if (
			separatorIndex === -1 ||
			outputBuffer
				.subarray(separatorIndex, separatorIndex + separator.length)
				.toString() !== separator.toString()
		) {
			return;
		}

		separatorIndex += separator.length;

		let nonceString = '';
		let lengthString = '';
		let statusString = '';

		// eslint-disable-next-line no-constant-condition
		while (true) {
			if (separatorIndex > outputBuffer.length - 1) {
				return;
			}

			const nextDigit = outputBuffer[separatorIndex];
			separatorIndex++;

			if (nextDigit === 0x3a) {
				break;
			}

			nonceString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
			if (separatorIndex > outputBuffer.length - 1) {
				return;
			}

			const nextDigit = outputBuffer[separatorIndex];
			separatorIndex++;

			if (nextDigit === 0x3a) {
				break;
			}

			lengthString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
			if (separatorIndex > outputBuffer.length - 1) {
				return;
			}

			const nextDigit = outputBuffer[separatorIndex];
			if (nextDigit === 0x3a) {
				break;
			}

			separatorIndex++;

			statusString += String.fromCharCode(nextDigit);
		}

		const length = Number(lengthString);
		const status = Number(statusString);

		const dataLength = outputBuffer.length - separatorIndex - 1;
		if (dataLength < length) {
			missingData = {
				dataMissing: length - dataLength,
			};

			return;
		}

		const data = outputBuffer.subarray(
			separatorIndex + 1,
			separatorIndex + 1 + Number(lengthString),
		);
		onMessage(status === 1 ? 'error' : 'success', nonceString, data);
		missingData = null;

		outputBuffer = outputBuffer.subarray(
			separatorIndex + Number(lengthString) + 1,
		);

		processInput();
	};

	const onData = (data: Uint8Array) => {
		unprocessedBuffers.push(data);
		const separatorIndex = data.indexOf(separator[0]);
		if (separatorIndex === -1) {
			if (missingData) {
				missingData.dataMissing -= data.length;
			}

			if (!missingData || missingData.dataMissing > 0) {
				return;
			}
		}

		unprocessedBuffers.unshift(outputBuffer);
		outputBuffer = new Uint8Array(
			unprocessedBuffers.reduce((acc, val) => acc + val.length, 0),
		);
		let offset = 0;
		for (const buf of unprocessedBuffers) {
			outputBuffer.set(buf, offset);
			offset += buf.length;
		}

		unprocessedBuffers = [];
		processInput();
	};

	return {
		onData,
		getOutputBuffer: () => outputBuffer,
		clear: () => {
			unprocessedBuffers = [];
			outputBuffer = new Uint8Array(0);
		},
	};
};

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
