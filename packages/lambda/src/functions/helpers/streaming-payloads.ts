import {z} from 'zod';
import type {ResponseStream} from './streamify-response';

const streamingPayloadSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('render-id-determined'),
		renderId: z.string(),
	}),
]);

export type StreamingPayloads = z.infer<typeof streamingPayloadSchema>;

export const isStreamingPayload = (str: string) => {
	try {
		const parsed = JSON.parse(str) as unknown;
		return streamingPayloadSchema.parse(parsed);
	} catch {
		return false;
	}
};

export const sendProgressEvent = (
	responseStream: ResponseStream,
	payload: StreamingPayloads,
) => {
	const stringified = JSON.stringify(payload);
	responseStream.write(stringified);
};
