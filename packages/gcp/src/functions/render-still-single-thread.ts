import type * as ff from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import {renderStill} from '@remotion/renderer';
import {getCompositionFromBody} from './helpers/get-composition-from-body';

/*
	example JSON body: {
    "composition": "StillRender",
    "serveUrl": "https://remotionlambda-11kow3vq6f.s3.us-east-1.amazonaws.com/sites/xmycbufjs3/index.html",
    "inputProps": {
      "text": "Created on Cloud Run™️"
    },
    "outputBucket": "remotionlambda-test",
    "outputFile": "outFolder/stillOutput.png"
  }
*/

export const renderStillSingleThread = async (
	req: ff.Request,
	res: ff.Response
) => {
	const composition = await getCompositionFromBody(
		req.body.serveUrl,
		req.body.composition
	);

	const tempFilePath = '/tmp/still.png';

	await renderStill({
		composition,
		serveUrl: req.body.serveUrl,
		output: tempFilePath,
		inputProps: req.body.inputProps,
	});

	const storage = new Storage();

	await storage
		.bucket(req.body.outputBucket)
		.upload(tempFilePath, {destination: req.body.outputFile});

	console.log('output uploaded to ', req.body.outputBucket);

	res.send('OK');
};
