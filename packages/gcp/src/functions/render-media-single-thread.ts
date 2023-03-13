import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import {renderMedia} from '@remotion/renderer';
import {randomHash} from '../shared/random-hash';
import {getCompositionFromBody} from './helpers/get-composition-from-body';

/*
	example JSON body: {
    "composition": "HelloWorld",
    "serveUrl": "https://remotionlambda-11kow3vq6f.s3.us-east-1.amazonaws.com/sites/xmycbufjs3/index.html",
    "codec": "h264",
    "inputProps": {
      "titleText": "Welcome to Remotion",
      "titleColor": "black"
    },
    "outputBucket": "remotionlambda-test",
    "outputFile": "mediaOutput.mp4"
  }
*/

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

	await renderMedia({
		composition,
		serveUrl: req.body.serveUrl,
		codec: req.body.codec,
		outputLocation: tempFilePath,
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
