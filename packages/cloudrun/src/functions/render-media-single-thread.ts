import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import type {RenderMediaOnProgress} from '@remotion/renderer';
import {renderMedia} from '@remotion/renderer';
import {Log} from '../cli/log';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';

export const renderMediaSingleThread = async (
	req: ff.Request,
	res: ff.Response
) => {
	const composition = await getCompositionFromBody(
		req.body.serveUrl,
		req.body.composition
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
			height: req.body.forceHeight ?? composition.height,
			width: req.body.forceWidth ?? composition.width,
		},
		serveUrl: req.body.serveUrl,
		codec: req.body.codec,
		outputLocation: tempFilePath,
		inputProps: req.body.inputProps,
		jpegQuality: req.body.jpegQuality,
		audioCodec: req.body.audioCodec,
		audioBitrate: req.body.audioBitrate,
		videoBitrate: req.body.videoBitrate,
		crf: req.body.crf,
		pixelFormat: req.body.pixelFormat,
		imageFormat: req.body.imageFormat,
		scale: req.body.scale,
		proResProfile: req.body.proResProfile,
		everyNthFrame: req.body.everyNthFrame,
		numberOfGifLoops: req.body.numberOfGifLoops,
		onProgress,
		frameRange: req.body.frameRange,
		envVariables: req.body.envVariables,
		chromiumOptions: req.body.chromiumOptions,
		muted: req.body.muted,
	});

	const storage = new Storage();

	const publicUpload = req.body.privacy === 'public' || !req.body.privacy;

	const uploadedResponse = await storage
		.bucket(req.body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${req.body.outputFile ?? 'out.mp4'}`,
			predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
		});

	const uploadedFile = uploadedResponse[0];
	const renderMetadata = await uploadedFile.getMetadata();
	const responseData = {
		publicUrl: uploadedFile.publicUrl(),
		cloudStorageUri: uploadedFile.cloudStorageURI.href,
		size: renderMetadata[0].size,
		bucketName: req.body.outputBucket,
		renderId,
		status: 'success',
		privacy: publicUpload ? 'publicRead' : 'projectPrivate',
	};

	Log.info('Render Completed:', responseData);
	res.end(JSON.stringify({response: responseData}));
};
