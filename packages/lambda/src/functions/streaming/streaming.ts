const framesRendered = 'frames-rendered' as const;
const errorOccurred = 'error-occurred' as const;
const renderIdDetermined = 'render-id-determined' as const;
const videoChunkRendered = 'video-chunk-rendered' as const;
const audioChunkRendered = 'audio-chunk-rendered' as const;
const responseJson = 'response-json' as const;

const messageTypes = {
	'1': {type: framesRendered},
	'2': {type: errorOccurred},
	'3': {type: renderIdDetermined},
	'4': {type: videoChunkRendered},
	'5': {type: audioChunkRendered},
	'6': {type: responseJson},
} as const;

type MessageTypeId = keyof typeof messageTypes;
type MessageType = (typeof messageTypes)[MessageTypeId]['type'];

export const formatMap: {[key in MessageType]: 'json' | 'binary'} = {
	[framesRendered]: 'json',
	[errorOccurred]: 'json',
	[renderIdDetermined]: 'json',
	[responseJson]: 'json',
	[videoChunkRendered]: 'binary',
	[audioChunkRendered]: 'binary',
};

export type StreamingPayload =
	| {
			type: typeof framesRendered;
			payload: {
				frames: number;
			};
	  }
	| {
			type: typeof videoChunkRendered;
			payload: Buffer;
	  }
	| {
			type: typeof audioChunkRendered;
			payload: Buffer;
	  }
	| {
			type: typeof errorOccurred;
			payload: {
				error: string;
			};
	  }
	| {
			type: typeof renderIdDetermined;
			payload: {
				renderId: string;
			};
	  }
	| {
			type: typeof responseJson;
			payload: Record<string, unknown>;
	  };

export const messageTypeIdToMessage = (
	messageTypeId: MessageTypeId,
): MessageType => {
	const types = messageTypes[messageTypeId];
	if (!types) {
		throw new Error(`Unknown message type id ${messageTypeId}`);
	}

	return types.type;
};

export const messageTypeToMessageId = (
	messageType: MessageType,
): MessageTypeId => {
	const id = (Object.keys(messageTypes) as unknown as MessageTypeId[]).find(
		(key) => messageTypes[key].type === messageType,
	) as MessageTypeId;

	if (!id) {
		throw new Error(`Unknown message type ${messageType}`);
	}

	return id;
};

type StreamingMessage = {
	successType: 'error' | 'success';
	message: StreamingPayload;
};

export type OnMessage = (options: StreamingMessage) => void;

const magicSeparator = Buffer.from('remotion_buffer:');

const parseJsonOrThrowSource = (data: Buffer, type: string) => {
	const asString = data.toString('utf-8');
	try {
		return JSON.parse(asString);
	} catch (err) {
		throw new Error(`Invalid JSON (${type}): ${asString}`);
	}
};

export const makeStreaming = (options: {onMessage: OnMessage}) => {
	let outputBuffer = Buffer.from('');

	let unprocessedBuffers: Buffer[] = [];

	let missingData: null | {
		dataMissing: number;
	} = null;

	const processInput = () => {
		let separatorIndex = outputBuffer.indexOf(magicSeparator);
		if (separatorIndex === -1) {
			return;
		}

		separatorIndex += magicSeparator.length;

		let messageTypeString = '';
		let lengthString = '';
		let statusString = '';

		// Each message has the structure with `remotion_buffer:{[message_type_id]}:{[length]}`
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

			messageTypeString += String.fromCharCode(nextDigit);
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
		const messageType = messageTypeIdToMessage(
			messageTypeString as MessageTypeId,
		);

		const innerPayload =
			formatMap[messageType] === 'json'
				? parseJsonOrThrowSource(data, messageType)
				: data;

		const payload: StreamingPayload = {
			type: messageType,
			payload: innerPayload,
		};

		options.onMessage({
			successType: status === 1 ? 'error' : 'success',
			message: payload,
		});
		missingData = null;

		outputBuffer = outputBuffer.subarray(
			separatorIndex + Number(lengthString) + 1,
		);
		processInput();
	};

	return {
		addData: (data: Buffer) => {
			unprocessedBuffers.push(data);
			const separatorIndex = data.indexOf(magicSeparator);
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
		},
	};
};

export const makePayloadMessage = ({
	message,
	status,
}: {
	message: StreamingPayload;
	status: 0 | 1;
}): Buffer => {
	const body =
		formatMap[message.type] === 'json'
			? Buffer.from(JSON.stringify(message.payload))
			: (message.payload as Buffer);

	const concat = Buffer.concat([
		magicSeparator,
		Buffer.from(messageTypeToMessageId(message.type).toString()),
		Buffer.from(':'),
		Buffer.from(body.length.toString()),
		Buffer.from(':'),
		Buffer.from(String(status)),
		Buffer.from(':'),
		body,
	]);

	return concat;
};

export type OnStream = (payload: StreamingPayload) => Promise<void>;
