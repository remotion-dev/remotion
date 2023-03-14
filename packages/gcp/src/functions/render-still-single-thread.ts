import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import {renderStill} from '@remotion/renderer';
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
		composition,
		serveUrl: req.body.serveUrl,
		output: tempFilePath,
		inputProps: req.body.inputProps,
	});

	const storage = new Storage();

	const uploadedResponse = await storage
		.bucket(req.body.outputBucket)
		.upload(tempFilePath, {
			destination: `renders/${renderId}/${req.body.outputFile}`,
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
	};

	console.log('Render Completed:', responseData);

	const jsonContent = JSON.stringify(responseData);

	res.end(jsonContent);
};
