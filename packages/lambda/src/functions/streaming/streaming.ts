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
export type MessageType = (typeof messageTypes)[MessageTypeId]['type'];

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

export type StreamingMessage = {
	successType: 'error' | 'success';
	message: StreamingPayload;
};

export type OnMessage = (options: StreamingMessage) => void;

const magicSeparator = Buffer.from('remotion_buffer:');

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
