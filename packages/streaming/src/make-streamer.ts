export const streamingKey = 'remotion_buffer:';

export type PayloadSink = {
	write: (data: Uint8Array) => void | Promise<void>;
	end: () => void | Promise<void>;
};

export type GetPayloadSink = (
	statusType: 'success' | 'error',
	nonce: string,
	length: number,
) => PayloadSink | null;

export const makeStreamer = (
	onMessage: (
		statusType: 'success' | 'error',
		nonce: string,
		data: Uint8Array,
	) => void,
	// If a sink is returned for a message, its payload is streamed into the
	// sink piece by piece instead of being accumulated in memory. `onMessage`
	// is then called with an empty payload after the sink has ended.
	getPayloadSink: GetPayloadSink | null = null,
) => {
	const separator = new Uint8Array(streamingKey.length);
	for (let i = 0; i < streamingKey.length; i++) {
		separator[i] = streamingKey.charCodeAt(i);
	}

	let unprocessedBuffers: Uint8Array[] = [];
	let outputBuffer = new Uint8Array(0);
	let missingData: null | {
		dataMissing: number;
	} = null;
	let activeSink: null | {
		sink: PayloadSink;
		remaining: number;
		nonce: string;
		statusType: 'success' | 'error';
	} = null;

	const findSeparatorIndex = () => {
		let searchIndex = 0;

		while (true) {
			const separatorIndex = outputBuffer.indexOf(separator[0], searchIndex); // Start checking for the first byte of the separator
			if (separatorIndex === -1) {
				return -1;
			}

			if (
				outputBuffer
					.subarray(separatorIndex, separatorIndex + separator.length)
					.toString() !== separator.toString()
			) {
				searchIndex = separatorIndex + 1;
				continue;
			}

			return separatorIndex;
		}
	};

	const processInput = (): void | Promise<void> => {
		let separatorIndex = findSeparatorIndex(); // Start checking for the first byte of the separator
		if (separatorIndex === -1) {
			return;
		}

		separatorIndex += separator.length;

		let nonceString = '';
		let lengthString = '';
		let statusString = '';

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
		const statusType = status === 1 ? 'error' : 'success';

		const sink = getPayloadSink
			? getPayloadSink(statusType, nonceString, length)
			: null;
		if (sink) {
			const payloadStart = separatorIndex + 1;
			const available = Math.min(outputBuffer.length - payloadStart, length);
			const payloadPiece = outputBuffer.subarray(
				payloadStart,
				payloadStart + available,
			);
			// Copy the remainder so the current backing buffer can be released
			const rest = new Uint8Array(
				outputBuffer.subarray(payloadStart + available),
			);
			outputBuffer = new Uint8Array(0);
			missingData = null;

			return (async () => {
				if (available > 0) {
					await sink.write(payloadPiece);
				}

				if (available < length) {
					activeSink = {
						sink,
						remaining: length - available,
						nonce: nonceString,
						statusType,
					};
					return;
				}

				await sink.end();
				onMessage(statusType, nonceString, new Uint8Array(0));
				if (rest.length > 0) {
					outputBuffer = rest;
					return processInput();
				}
			})();
		}

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

		return processInput();
	};

	// Returns the bytes that belong to the next message, if any
	const feedSink = async (data: Uint8Array): Promise<Uint8Array | null> => {
		if (!activeSink) {
			throw new Error('No active sink');
		}

		const take = Math.min(activeSink.remaining, data.length);
		// Awaiting each write applies backpressure to the caller
		await activeSink.sink.write(data.subarray(0, take));
		activeSink.remaining -= take;

		if (activeSink.remaining > 0) {
			return null;
		}

		const {sink, nonce, statusType} = activeSink;
		activeSink = null;
		await sink.end();
		onMessage(statusType, nonce, new Uint8Array(0));

		const leftover = data.subarray(take);
		return leftover.length > 0 ? leftover : null;
	};

	const onDataInner = (data: Uint8Array): void | Promise<void> => {
		if (activeSink) {
			return feedSink(data).then((leftover) => {
				if (leftover) {
					return onDataInner(leftover);
				}
			});
		}

		unprocessedBuffers.push(data);

		if (missingData) {
			missingData.dataMissing -= data.length;
		}

		if (missingData && missingData.dataMissing > 0) {
			return;
		}

		const newBuffer = new Uint8Array(
			outputBuffer.length +
				unprocessedBuffers.reduce((acc, val) => acc + val.length, 0),
		);
		newBuffer.set(outputBuffer, 0);

		let offset = outputBuffer.length;
		for (const buf of unprocessedBuffers) {
			newBuffer.set(buf, offset);
			offset += buf.length;
		}

		outputBuffer = newBuffer;

		unprocessedBuffers = [];

		return processInput();
	};

	// When payload sinks are in use, processing may be asynchronous. Serialize
	// the handling of incoming data so callers that do not await `onData` still
	// get correct behavior. Without sinks, processing is fully synchronous and
	// behaves exactly as before.
	let chain: Promise<void> = Promise.resolve();

	const onData = (data: Uint8Array): void | Promise<void> => {
		if (!getPayloadSink) {
			return onDataInner(data);
		}

		chain = chain.then(() => onDataInner(data));
		return chain;
	};

	return {
		onData,
		getOutputBuffer: () => outputBuffer,
		clear: () => {
			unprocessedBuffers = [];
			outputBuffer = new Uint8Array(0);
			if (activeSink) {
				// Best-effort: close the sink so no file descriptor is leaked
				// if the stream aborted mid-payload
				const {sink} = activeSink;
				activeSink = null;
				try {
					Promise.resolve(sink.end()).catch(() => undefined);
				} catch {}
			}
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
	const magicWordArr = new TextEncoder().encode(streamingKey);
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
