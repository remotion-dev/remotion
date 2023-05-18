import {RenderInternals} from '@remotion/renderer';
import {z} from 'zod';

const codec = z.enum(RenderInternals.validCodecs);
const audioCodec = z.enum(RenderInternals.validAudioCodecs);
const pixelFormat = z.enum(RenderInternals.validPixelFormats);
const videoImageFormat = z.enum(RenderInternals.validVideoImageFormats);
const stillImageFormat = z.enum(RenderInternals.validStillImageFormats);
const proResProfile = z.enum(RenderInternals.proResProfileOptions);
const chromiumOptions = z.object({
	ignoreCertificateErrors: z.boolean().optional(),
	disableWebSecurity: z.boolean().optional(),
	gl: z.enum(RenderInternals.validOpenGlRenderers).optional(),
	headless: z.boolean().optional(),
	userAgent: z.string().optional(),
});

export const CloudRunPayload = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('media'),
		serveUrl: z.string(),
		composition: z.string(),
		forceHeight: z.number().optional(),
		forceWidth: z.number().optional(),
		codec,
		inputProps: z.unknown(),
		jpegQuality: z.number().optional(),
		audioCodec: audioCodec.optional().nullable(),
		audioBitrate: z.string().optional().nullable(),
		videoBitrate: z.string().optional().nullable(),
		crf: z.number().optional().nullable(),
		pixelFormat: pixelFormat.optional(),
		imageFormat: videoImageFormat.optional(),
		scale: z.number().optional(),
		proResProfile: proResProfile.optional(),
		everyNthFrame: z.number().optional(),
		numberOfGifLoops: z.number().optional(),
		frameRange: z.tuple([z.number(), z.number()]).or(z.number()).optional(),
		envVariables: z.record(z.string()).optional(),
		chromiumOptions: chromiumOptions.optional(),
		muted: z.boolean().optional(),
		outputBucket: z.string(),
		outputFile: z.string().optional(),
		privacy: z.enum(['public', 'private']).optional(),
	}),
	z.object({
		type: z.literal('still'),
		serveUrl: z.string(),
		composition: z.string(),
		forceHeight: z.number().optional(),
		forceWidth: z.number().optional(),
		inputProps: z.unknown(),
		jpegQuality: z.number().optional(),
		imageFormat: stillImageFormat.optional(),
		scale: z.number().optional(),
		privacy: z.enum(['public', 'private']).optional(),
		envVariables: z.record(z.string()).optional(),
		chromiumOptions: chromiumOptions.optional(),
		outputBucket: z.string(),
		outputFile: z.string().optional(),
		frame: z.number(),
	}),
]);

const renderStillOnLambdaResponsePayload = z.object({
	publicUrl: z.string(),
	cloudStorageUri: z.string(),
	size: z.number(),
	bucketName: z.string(),
	renderId: z.string(),
	status: z.literal('success'),
	privacy: z.enum(['publicRead', 'projectPrivate']),
});

const renderMediaOnLambdaResponsePayload = z.object({
	publicUrl: z.string(),
	cloudStorageUri: z.string(),
	size: z.number(),
	bucketName: z.string(),
	renderId: z.string(),
	status: z.literal('success'),
	privacy: z.enum(['publicRead', 'projectPrivate']),
});

export type CloudRunPayloadType = z.infer<typeof CloudRunPayload>;
export type RenderStillOnLambdaResponsePayloadType = z.infer<
	typeof renderStillOnLambdaResponsePayload
>;
export type RenderMediaOnLambdaResponsePayloadType = z.infer<
	typeof renderMediaOnLambdaResponsePayload
>;
