import * as z from 'zod/mini';

const awaitingConfirmationResponseSchema = z.object({
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	status: z.literal('awaiting-confirmation'),
});
const studioProtocolErrorSchema = z.object({
	status: z.literal('error'),
	error: z.object({
		code: z.string(),
		message: z.string(),
	}),
});

export const isAwaitingConfirmationResponse = (value: unknown): boolean =>
	z.safeParse(awaitingConfirmationResponseSchema, value).success;

export const parseStudioProtocolError = (
	value: unknown,
): {readonly code: string; readonly message: string} | null => {
	const parsed = z.safeParse(studioProtocolErrorSchema, value);
	return parsed.success
		? {code: parsed.data.error.code, message: parsed.data.error.message}
		: null;
};
