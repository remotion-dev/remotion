import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import {renderStill} from '@remotion/renderer';
import {Log} from '../cli/log';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';
import type {
	CloudRunPayloadType,
	RenderStillOnLambdaResponsePayloadType,
} from './helpers/payloads';

export const renderStillSingleThread = async (
	body: CloudRunPayloadType,
	res: ff.Response
) => {
	if (body.type !== 'still') {
		throw new Error('expected type still');
	}

	const composition = await getCompositionFromBody(
		body.serveUrl,
		body.composition
	);

	const tempFilePath = '/tmp/still.png';
	const renderId = randomHash({randomInTests: true});

	await renderStill({
		composition: {
			...composition,
			height: body.forceHeight ?? composition.height,
			width: body.forceWidth ?? composition.width,
		},
		serveUrl: body.serveUrl,
		output: tempFilePath,
		inputProps: body.inputProps,
		jpegQuality: body.jpegQuality,
		imageFormat: body.imageFormat,
		scale: body.scale,
		envVariables: body.envVariables,
		chromiumOptions: body.chromiumOptions,
		frame: body.frame,
	});

	const storage = new Storage();

	const publicUpload = body.privacy === 'public' || !body.privacy;

	const uploadedResponse = await storage
		.bucket(body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${body.outputFile ?? 'out.png'}`,
			predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
		});

	const uploadedFile = uploadedResponse[0];
	const renderMetadata = await uploadedFile.getMetadata();
	const responseData: RenderStillOnLambdaResponsePayloadType = {
		publicUrl: uploadedFile.publicUrl(),
		cloudStorageUri: uploadedFile.cloudStorageURI.href,
		size: renderMetadata[0].size,
		bucketName: body.outputBucket,
		renderId,
		status: 'success',
		privacy: publicUpload ? 'publicRead' : 'projectPrivate',
	};

	Log.info('Render Completed:', responseData);

	const jsonContent = JSON.stringify(responseData);

	res.end(jsonContent);
};
