import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import {RenderInternals, renderStill} from '@remotion/renderer';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';

export const renderStillSingleThread = async (
	req: ff.Request,
	res: ff.Response
) => {
	const composition = await getCompositionFromBody(
		req.body.serveUrl,
		req.body.composition
	);

	const tempFilePath = '/tmp/still.png';
	const renderId = randomHash({randomInTests: true});

	await renderStill({
		composition: {
			...composition,
			height: req.body.forceHeight ?? composition.height,
			width: req.body.forceWidth ?? composition.width,
		},
		serveUrl: req.body.serveUrl,
		output: tempFilePath,
		inputProps: req.body.inputProps,
		jpegQuality: req.body.jpegQuality,
		imageFormat: req.body.imageFormat,
		scale: req.body.scale,
		envVariables: req.body.envVariables,
		chromiumOptions: req.body.chromiumOptions,
		frame: RenderInternals.convertToPositiveFrameIndex({
			frame: req.body.frame,
			durationInFrames: composition.durationInFrames,
		}),
	});

	const storage = new Storage();

	const publicUpload = req.body.privacy === 'public' || !req.body.privacy;

	const uploadedResponse = await storage
		.bucket(req.body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${req.body.outputFile ?? 'out.png'}`,
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

	console.log('Render Completed:', responseData);

	const jsonContent = JSON.stringify(responseData);

	res.end(jsonContent);
};
