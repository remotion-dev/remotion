import {BrowserSafeApis} from '@remotion/renderer/client';
import {z} from 'zod';

const codec = z.enum(BrowserSafeApis.validCodecs);
const audioCodec = z.enum(BrowserSafeApis.validAudioCodecs);
const pixelFormat = z.enum(BrowserSafeApis.validPixelFormats);
const videoImageFormat = z.enum(BrowserSafeApis.validVideoImageFormats);
const stillImageFormat = z.enum(BrowserSafeApis.validStillImageFormats);
const proResProfile = z.enum(BrowserSafeApis.proResProfileOptions).nullable();
const x264Preset = z.enum(BrowserSafeApis.x264PresetOptions).nullable();
const chromiumOptions = z.object({
	ignoreCertificateErrors: z.boolean().optional(),
	disableWebSecurity: z.boolean().optional(),
	gl: z.enum(BrowserSafeApis.validOpenGlRenderers).optional().nullable(),
	headless: z.boolean().optional(),
	userAgent: z.string().optional().nullable(),
});
const logLevel = z.enum(BrowserSafeApis.logLevels);

const downloadBehavior = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('play-in-browser'),
	}),
	z.object({
		type: z.literal('download'),
		fileName: z.string().nullable(),
	}),
]);

export type DownloadBehavior = z.infer<typeof downloadBehavior>;

export const CloudRunPayload = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('media'),
		serveUrl: z.string(),
		composition: z.string(),
		forceHeight: z.number().optional().nullable(),
		forceWidth: z.number().optional().nullable(),
		codec,
		serializedInputPropsWithCustomSchema: z.string(),
		jpegQuality: z.number().nullable(),
		audioCodec: audioCodec.nullable(),
		audioBitrate: z.string().nullable(),
		videoBitrate: z.string().nullable(),
		encodingMaxRate: z.string().nullable(),
		encodingBufferSize: z.string().nullable(),
		crf: z.number().nullable(),
		pixelFormat: pixelFormat.nullable(),
		imageFormat: videoImageFormat.nullable(),
		scale: z.number(),
		proResProfile,
		x264Preset,
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
		delayRenderTimeoutInMilliseconds: z.number().nullable(),
		concurrency: z.number().or(z.string()).nullable(),
		enforceAudioTrack: z.boolean(),
		preferLossless: z.boolean(),
		offthreadVideoCacheSizeInBytes: z.number().nullable(),
		offthreadVideoThreads: z.number().nullable(),
		colorSpace: z.enum(BrowserSafeApis.validColorSpaces).nullable(),
		clientVersion: z.string(),
		downloadBehavior,
		metadata: z.record(z.string()).optional().nullable(),
		renderIdOverride: z.string().optional().nullable(),
		renderStatusWebhook: z
			.object({
				url: z.string(),
				headers: z.record(z.string()),
				data: z.any(),
				webhookProgressInterval: z.number().min(0).max(1).optional().nullable(),
			})
			.optional()
			.nullable(),
	}),
	z.object({
		type: z.literal('still'),
		serveUrl: z.string(),
		composition: z.string(),
		forceHeight: z.number().optional().nullable(),
		forceWidth: z.number().optional().nullable(),
		serializedInputPropsWithCustomSchema: z.string(),
		jpegQuality: z.number().optional(),
		imageFormat: stillImageFormat,
		scale: z.number(),
		privacy: z.enum(['public', 'private']),
		envVariables: z.record(z.string()),
		chromiumOptions: chromiumOptions.optional(),
		outputBucket: z.string(),
		outName: z.string().nullable(),
		frame: z.number(),
		delayRenderTimeoutInMilliseconds: z.number(),
		logLevel,
		offthreadVideoCacheSizeInBytes: z.number().nullable(),
		offthreadVideoThreads: z.number().nullable(),
		clientVersion: z.string(),
		downloadBehavior,
		metadata: z.record(z.string()).optional().nullable(),
		renderIdOverride: z.string().optional().nullable(),
		renderStatusWebhook: z
			.object({
				url: z.string(),
				headers: z.record(z.string()),
				data: z.any(),
				webhookProgressInterval: z.number().min(0).max(1).optional().nullable(),
			})
			.optional()
			.nullable(),
	}),
]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const renderFailResponsePayload = z.object({
	type: z.literal('error'),
	message: z.string(),
	name: z.string(),
	stack: z.string(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const renderStillOnCloudrunResponsePayload = z.object({
	type: z.literal('success'),
	publicUrl: z.string().optional().nullable(),
	cloudStorageUri: z.string(),
	size: z.number(),
	bucketName: z.string(),
	renderId: z.string(),
	privacy: z.enum(['public-read', 'project-private']),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const renderMediaOnCloudrunResponsePayload = z.object({
	type: z.literal('success'),
	publicUrl: z.string().optional().nullable(),
	cloudStorageUri: z.string(),
	size: z.number(),
	bucketName: z.string(),
	renderId: z.string(),
	privacy: z.enum(['public-read', 'project-private']),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cloudRunCrashResponse = z.object({
	type: z.literal('crash'),
	cloudRunEndpoint: z.string(),
	message: z.literal(
		'Service crashed without sending a response. Check the logs in GCP console.',
	),
	requestStartTime: z.string().datetime(),
	requestCrashTime: z.string().datetime(),
	requestElapsedTimeInSeconds: z.number(),
});

export type CloudRunPayloadType = z.infer<typeof CloudRunPayload>;

export type RenderStillOnCloudrunOutput = z.infer<
	typeof renderStillOnCloudrunResponsePayload
>;
export type RenderMediaOnCloudrunOutput = z.infer<
	typeof renderMediaOnCloudrunResponsePayload
>;

export type ErrorResponsePayload = z.infer<typeof renderFailResponsePayload>;

export type CloudRunCrashResponse = z.infer<typeof cloudRunCrashResponse>;
