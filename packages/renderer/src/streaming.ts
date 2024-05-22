export const makeStreamer = (
	onMessage: (
		statusType: 'success' | 'error',
		nonce: string,
		data: Buffer,
	) => void,
) => {
	const separator = Buffer.from('remotion_buffer:');
	let unprocessedBuffers: Buffer[] = [];
	let outputBuffer = Buffer.from('');
	let missingData: null | {
		dataMissing: number;
	} = null;

	const processInput = () => {
		let separatorIndex = outputBuffer.indexOf(separator);
		if (separatorIndex === -1) {
			return;
		}

		separatorIndex += separator.length;

		let nonceString = '';
		let lengthString = '';
		let statusString = '';

		// Each message from Rust is prefixed with `remotion_buffer:{[nonce]}:{[length]}`
		// Let's read the buffer to extract the nonce, and if the full length is available,
		// we'll extract the data and pass it to the callback.

		// eslint-disable-next-line no-constant-condition
		while (true) {
			if (separatorIndex > outputBuffer.length - 1) {
				return;
			}

			const nextDigit = outputBuffer[separatorIndex];
			separatorIndex++;

			// 0x3a is the character ":"
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

	const onData = (data: Buffer) => {
		unprocessedBuffers.push(data);
		const separatorIndex = data.indexOf(separator);
		if (separatorIndex === -1) {
			if (missingData) {
				missingData.dataMissing -= data.length;
			}

			if (!missingData || missingData.dataMissing > 0) {
				return;
			}
		}

		unprocessedBuffers.unshift(outputBuffer);
		outputBuffer = Buffer.concat(unprocessedBuffers);

		unprocessedBuffers = [];
		processInput();
	};

	return {
		onData,
		getOutputBuffer: () => outputBuffer,
		clear: () => {
			unprocessedBuffers = [];
			outputBuffer = Buffer.from('');
		},
	};
};
