import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderStillLambdaResponsePayload} from '../still';

const framesRendered = 'frames-rendered' as const;
const errorOccurred = 'error-occurred' as const;
const renderIdDetermined = 'render-id-determined' as const;
const videoChunkRendered = 'video-chunk-rendered' as const;
const audioChunkRendered = 'audio-chunk-rendered' as const;
const stillRendered = 'still-rendered' as const;

const messageTypes = {
	'1': {type: framesRendered},
	'2': {type: errorOccurred},
	'3': {type: renderIdDetermined},
	'4': {type: videoChunkRendered},
	'5': {type: audioChunkRendered},
	'6': {type: stillRendered},
} as const;

export type MessageTypeId = keyof typeof messageTypes;
type MessageType = (typeof messageTypes)[MessageTypeId]['type'];

export const formatMap: {[key in MessageType]: 'json' | 'binary'} = {
	[framesRendered]: 'json',
	[errorOccurred]: 'json',
	[renderIdDetermined]: 'json',
	[videoChunkRendered]: 'binary',
	[audioChunkRendered]: 'binary',
	[stillRendered]: 'json',
};

export type StreamingPayload =
	| {
			type: typeof framesRendered;
			payload: {
				rendered: number;
				encoded: number;
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
			type: typeof stillRendered;
			payload: RenderStillLambdaResponsePayload;
	  };

export const messageTypeIdToMessageType = (
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

export type OnStream = (payload: StreamingPayload) => void;

export const makeStreamPayload = ({message}: {message: StreamingPayload}) => {
	const body =
		formatMap[message.type] === 'json'
			? Buffer.from(JSON.stringify(message.payload))
			: (message.payload as Buffer);

	return BrowserSafeApis.makeStreamPayloadMessage({
		body,
		nonce: messageTypeToMessageId(message.type),
		status: 0,
	});
};
