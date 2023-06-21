import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import type {ChromiumOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {Log} from '../cli/log';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';
import type {
	CloudRunPayloadType,
	RenderStillOnCloudrunOutput,
} from './helpers/payloads';

export const renderStillSingleThread = async (
	body: CloudRunPayloadType,
	res: ff.Response
) => {
	if (body.type !== 'still') {
		throw new Error('expected type still');
	}

	Log.verbose('Rendering still frame', body);

	const composition = await getCompositionFromBody(
		body.serveUrl,
		body.composition
	);

	Log.verbose('Composition loaded', composition);

	const tempFilePath = '/tmp/still.png';
	const renderId = randomHash({randomInTests: true});

	const actualChromiumOptions: ChromiumOptions = {
		...body.chromiumOptions,
		// Override the `null` value, which might come from CLI with swANGLE
		gl: body.chromiumOptions?.gl ?? 'swangle',
	};

	await RenderInternals.internalRenderStill({
		composition: {
			...composition,
			height: body.forceHeight ?? composition.height,
			width: body.forceWidth ?? composition.width,
		},
		serveUrl: body.serveUrl,
		output: tempFilePath,
		inputProps: body.inputProps,
		jpegQuality: body.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		imageFormat: body.imageFormat,
		scale: body.scale,
		envVariables: body.envVariables,
		chromiumOptions: actualChromiumOptions,
		frame: body.frame,
		logLevel: body.logLevel,
		browserExecutable: null,
		cancelSignal: null,
		indent: false,
		timeoutInMilliseconds: body.delayRenderTimeoutInMilliseconds,
		onBrowserLog: null,
		onDownload: null,
		overwrite: true,
		port: null,
		puppeteerInstance: null,
		server: undefined,
	});
	Log.info('Still rendered');

	const storage = new Storage();

	const publicUpload = body.privacy === 'public' || !body.privacy;

	const uploadedResponse = await storage
		.bucket(body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${body.outName ?? 'out.png'}`,
			predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
		});

	Log.info('Still uploaded');

	const uploadedFile = uploadedResponse[0];
	const renderMetadata = await uploadedFile.getMetadata();
	const responseData: RenderStillOnCloudrunOutput = {
		publicUrl: uploadedFile.publicUrl(),
		cloudStorageUri: uploadedFile.cloudStorageURI.href,
		size: renderMetadata[0].size,
		bucketName: body.outputBucket,
		renderId,
		status: 'success',
		privacy: publicUpload ? 'public-read' : 'project-private',
	};

	RenderInternals.Log.info('Render Completed:', responseData);

	const jsonContent = JSON.stringify(responseData);

	res.end(jsonContent);
};
