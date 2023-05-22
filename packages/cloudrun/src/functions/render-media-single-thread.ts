import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import type {RenderMediaOnProgress} from '@remotion/renderer';
import {RenderInternals, renderMedia} from '@remotion/renderer';
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

	const composition = await getCompositionFromBody(
		body.serveUrl,
		body.composition
	);

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

	await renderMedia({
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
		proResProfile: body.proResProfile,
		everyNthFrame: body.everyNthFrame,
		numberOfGifLoops: body.numberOfGifLoops,
		onProgress,
		frameRange: body.frameRange,
		envVariables: body.envVariables,
		chromiumOptions: body.chromiumOptions,
		muted: body.muted,
		verbose: RenderInternals.isEqualOrBelowLogLevel(body.logLevel, 'verbose'),
	});

	const storage = new Storage();

	const publicUpload = body.privacy === 'public' || !body.privacy;

	const uploadedResponse = await storage
		.bucket(body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${body.outputFile ?? 'out.mp4'}`,
			predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
		});

	const uploadedFile = uploadedResponse[0];
	const renderMetadata = await uploadedFile.getMetadata();
	const responseData: RenderMediaOnCloudrunOutput = {
		status: 'success',
		publicUrl: uploadedFile.publicUrl(),
		cloudStorageUri: uploadedFile.cloudStorageURI.href,
		size: renderMetadata[0].size,
		bucketName: body.outputBucket,
		renderId,
		privacy: publicUpload ? 'public-read' : 'project-private',
	};

	RenderInternals.Log.info('Render Completed:', responseData);
	res.end(JSON.stringify({response: responseData}));
};
