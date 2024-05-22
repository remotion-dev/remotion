export const makeStreamer = (
	onMessage: (
		statusType: 'success' | 'error',
		nonce: string,
		data: Uint8Array,
	) => void,
) => {
	const separatorStr = 'remotion_buffer:';
	const separator = new Uint8Array(separatorStr.length);
	for (let i = 0; i < separatorStr.length; i++) {
		separator[i] = separatorStr.charCodeAt(i);
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
