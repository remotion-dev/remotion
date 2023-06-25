import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import type {ChromiumOptions, RenderMediaOnProgress} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';
import type {
	CloudRunPayloadType,
	RenderMediaOnCloudrunOutput,
} from './helpers/payloads';

export const renderMediaSingleThread = async (
	body: CloudRunPayloadType,
	res: ff.Response
) => {
	if (body.type !== 'media') {
		throw new Error('expected type media');
	}

	const composition = await getCompositionFromBody(body);

	const tempFilePath = '/tmp/output.mp4';
	const renderId = randomHash({randomInTests: true});
	let previousProgress = 2;
	const onProgress: RenderMediaOnProgress = ({progress}) => {
		if (previousProgress !== progress) {
			res.write(JSON.stringify({onProgress: progress}));
			previousProgress = progress;
		}
	};

	res.writeHead(200, {'Content-Type': 'text/html'});

	const actualChromiumOptions: ChromiumOptions = {
		...body.chromiumOptions,
		// Override the `null` value, which might come from CLI with swANGLE
		gl: body.chromiumOptions?.gl ?? 'swangle',
	};

	await RenderInternals.internalRenderMedia({
		composition: {
			...composition,
			height: body.forceHeight ?? composition.height,
			width: body.forceWidth ?? composition.width,
		},
		serveUrl: body.serveUrl,
		codec: body.codec,
		outputLocation: tempFilePath,
		inputProps: body.inputProps,
		jpegQuality: body.jpegQuality,
		audioCodec: body.audioCodec,
		audioBitrate: body.audioBitrate,
		videoBitrate: body.videoBitrate,
		crf: body.crf,
		pixelFormat: body.pixelFormat,
		imageFormat: body.imageFormat,
		scale: body.scale,
		proResProfile: body.proResProfile ?? undefined,
		everyNthFrame: body.everyNthFrame,
		numberOfGifLoops: body.numberOfGifLoops,
		onProgress,
		frameRange: body.frameRange,
		envVariables: body.envVariables,
		chromiumOptions: actualChromiumOptions,
		muted: body.muted,
		logLevel: body.logLevel,
		browserExecutable: null,
		timeoutInMilliseconds: body.delayRenderTimeoutInMilliseconds,
		cancelSignal: undefined,
		concurrency: body.concurrency,
		disallowParallelEncoding: false,
		enforceAudioTrack: body.enforceAudioTrack,
		ffmpegOverride: undefined,
		indent: false,
		onBrowserLog: null,
		onCtrlCExit: () => undefined,
		onDownload: () => undefined,
		onStart: () => undefined,
		overwrite: true,
		port: null,
		preferLossless: body.preferLossless,
		puppeteerInstance: undefined,
		server: undefined,
	});

	const storage = new Storage();

	const publicUpload = body.privacy === 'public' || !body.privacy;

	const uploadedResponse = await storage
		.bucket(body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${body.outName ?? 'out.mp4'}`,
			predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
		});

	const uploadedFile = uploadedResponse[0];
	const renderMetadata = await uploadedFile.getMetadata();
	const responseData: RenderMediaOnCloudrunOutput = {
		status: 'success',
		publicUrl: publicUpload ? uploadedFile.publicUrl() : null,
		cloudStorageUri: uploadedFile.cloudStorageURI.href,
		size: renderMetadata[0].size,
		bucketName: body.outputBucket,
		renderId,
		privacy: publicUpload ? 'public-read' : 'project-private',
	};

	RenderInternals.Log.info('Render Completed:', responseData);
	res.end(JSON.stringify({response: responseData}));
};
