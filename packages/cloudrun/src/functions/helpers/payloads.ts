import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {z} from 'zod';

const codec = z.enum(RenderInternals.validCodecs);
const audioCodec = z.enum(RenderInternals.validAudioCodecs);
const pixelFormat = z.enum(RenderInternals.validPixelFormats);
const videoImageFormat = z.enum(RenderInternals.validVideoImageFormats);
const stillImageFormat = z.enum(RenderInternals.validStillImageFormats);
const proResProfile = z.enum(BrowserSafeApis.proResProfileOptions).nullable();
const chromiumOptions = z.object({
	ignoreCertificateErrors: z.boolean().optional(),
	disableWebSecurity: z.boolean().optional(),
	gl: z.enum(RenderInternals.validOpenGlRenderers).optional().nullable(),
	headless: z.boolean().optional(),
	userAgent: z.string().optional().nullable(),
});
const logLevel = z.enum(RenderInternals.logLevels);

export const CloudRunPayload = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('media'),
		serveUrl: z.string(),
		composition: z.string(),
		forceHeight: z.number().optional().nullable(),
		forceWidth: z.number().optional().nullable(),
		codec,
		inputProps: z.record(z.string(), z.unknown()),
		jpegQuality: z.number(),
		audioCodec: audioCodec.nullable(),
		audioBitrate: z.string().nullable(),
		videoBitrate: z.string().nullable(),
		crf: z.number().nullable(),
		pixelFormat,
		imageFormat: videoImageFormat,
		scale: z.number(),
		proResProfile,
		everyNthFrame: z.number(),
		numberOfGifLoops: z.number().nullable(),
		frameRange: z.tuple([z.number(), z.number()]).or(z.number()).nullable(),
		envVariables: z.record(z.string()),
		chromiumOptions: chromiumOptions.optional(),
		muted: z.boolean(),
		outputBucket: z.string(),
		outName: z.string().optional(),
		privacy: z.enum(['public', 'private']).optional(),
		logLevel,
		delayRenderTimeoutInMilliseconds: z.number(),
		dumpBrowserLogs: z.boolean(),
		concurrency: z.number().or(z.string()).nullable(),
		enforceAudioTrack: z.boolean(),
		preferLossless: z.boolean(),
	}),
	z.object({
		type: z.literal('still'),
		serveUrl: z.string(),
		composition: z.string(),
		forceHeight: z.number().optional().nullable(),
		forceWidth: z.number().optional().nullable(),
		inputProps: z.record(z.string(), z.unknown()),
		jpegQuality: z.number().optional(),
		imageFormat: stillImageFormat,
		scale: z.number(),
		privacy: z.enum(['public', 'private']),
		envVariables: z.record(z.string()),
		chromiumOptions: chromiumOptions.optional(),
		outputBucket: z.string(),
		outName: z.string().optional(),
		frame: z.number(),
		delayRenderTimeoutInMilliseconds: z.number(),
		logLevel,
		dumpBrowserLogs: z.boolean(),
	}),
]);

const renderFailResponsePayload = z.object({
	status: z.literal('error'),
	error: z.string(),
	stack: z.string(),
});

const renderStillOnCloudrunResponsePayload = z.object({
	publicUrl: z.string().optional().nullable(),
	cloudStorageUri: z.string(),
	size: z.number(),
	bucketName: z.string(),
	renderId: z.string(),
	status: z.literal('success'),
	privacy: z.enum(['public-read', 'project-private']),
});

const renderMediaOnCloudrunResponsePayload = z.object({
	publicUrl: z.string().optional().nullable(),
	cloudStorageUri: z.string(),
	size: z.number(),
	bucketName: z.string(),
	renderId: z.string(),
	status: z.literal('success'),
	privacy: z.enum(['public-read', 'project-private']),
});

export type CloudRunPayloadType = z.infer<typeof CloudRunPayload>;

export type RenderStillOnCloudrunOutput = z.infer<
	typeof renderStillOnCloudrunResponsePayload
>;
export type RenderMediaOnCloudrunOutput = z.infer<
	typeof renderMediaOnCloudrunResponsePayload
>;

export type ErrorResponsePayload = z.infer<typeof renderFailResponsePayload>;
