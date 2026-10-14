import * as z from 'zod/mini';
import {makeElementFileNameFromSlug} from './element-drag-data';
import {isAllowedStudioProtocolPageOrigin} from './install-in-studio';

const captionStyleSelectionSchema = z.nullable(
	z.object({
		slug: z
			.string()
			.check(z.refine((slug) => makeElementFileNameFromSlug(slug) !== null)),
		origin: z
			.string()
			.check(
				z.refine(
					(origin) =>
						isAllowedStudioProtocolPageOrigin(origin) &&
						new URL(origin).origin === origin,
				),
			),
	}),
);

export type StudioCaptionStyleSelection = z.infer<
	typeof captionStyleSelectionSchema
>;

const captionStyleSubscriptionSchema = z.object({
	operation: z.literal('subscribe-to-caption-style-selection'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
});

const captionStyleSelectionMessageSchema = z.object({
	operation: z.literal('caption-style-selection'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	selection: captionStyleSelectionSchema,
});

export const isStudioProtocolCaptionStyleSubscription = (
	value: unknown,
): boolean => {
	return z.safeParse(captionStyleSubscriptionSchema, value).success;
};

export const parseStudioProtocolCaptionStyleSelection = (value: unknown) => {
	const parsed = z.safeParse(captionStyleSelectionMessageSchema, value);
	return parsed.success ? parsed.data : null;
};
