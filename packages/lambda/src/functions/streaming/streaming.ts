type OnMessage = (
	type: 'error' | 'success',
	nonce: string,
	data: Buffer,
) => void;

export const makeStreaming = (onMessage: OnMessage) => {
	let outputBuffer = Buffer.from('');

	const separator = Buffer.from('remotion_buffer:');
	let unprocessedBuffers: Buffer[] = [];

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

		// Each message from Rust is prefixed with `remotion_buffer;{[nonce]}:{[length]}`
		// Let's read the buffer to extract the nonce, and if the full length is available,
		// we'll extract the data and pass it to the callback.

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			// 0x3a is the character ":"
			if (nextDigit === 0x3a) {
				separatorIndex++;
				break;
			}

			separatorIndex++;

			nonceString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			if (nextDigit === 0x3a) {
				separatorIndex++;
				break;
			}

			separatorIndex++;

			lengthString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
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

	return {
		addData: (data: Buffer) => {
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
			console.log(
				'the unprocessed input is now',
				new TextDecoder('utf-8').decode(outputBuffer),
			);
			processInput();
		},
	};
};

export const makePayloadMessage = (
	nonce: number,
	data: Buffer,
	status: 0 | 1,
): Buffer => {
	const concat = Buffer.concat([
		Buffer.from('remotion_buffer:'),
		Buffer.from(nonce.toString()),
		Buffer.from(':'),
		Buffer.from(data.length.toString()),
		Buffer.from(':'),
		Buffer.from(String(status)),
		Buffer.from(':'),
		data,
	]);

	return concat;
};

export type StreamingPayload = {
	type: 'frames-rendered';
	frames: number;
};

export type OnStream = (payload: StreamingPayload) => void;
