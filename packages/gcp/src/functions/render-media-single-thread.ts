import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import type {RenderMediaOnProgress} from '@remotion/renderer';
import {renderMedia} from '@remotion/renderer';
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
		composition,
		serveUrl: req.body.serveUrl,
		codec: req.body.codec,
		outputLocation: tempFilePath,
		inputProps: req.body.inputProps,
		onProgress,
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
	res.end(JSON.stringify({response: responseData}));
};
