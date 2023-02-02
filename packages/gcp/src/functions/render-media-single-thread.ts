import * as ff from '@google-cloud/functions-framework';
import { getCompositionFromBody } from '../helpers/get-composition-from-body';
import { renderMedia } from '@remotion/renderer';
import { Storage } from '@google-cloud/storage';

{/*
	example JSON body: {
    "composition": "HelloWorld",
    "serveUrl": "https://remotionlambda-11kow3vq6f.s3.us-east-1.amazonaws.com/sites/xmycbufjs3/index.html",
    "codec": "h264",
    "inputProps": {
      "titleText": "Welcome to Remotion",
      "titleColor": "black"
    },
    "outputBucket": "remotionlambda-test",
    "outputFile": "outFolder/mediaOutput.mp4"
  }
*/}

export const renderMediaSingleThread = async (req: ff.Request, res: ff.Response) => {
  const composition = await getCompositionFromBody(req.body.serveUrl, req.body.composition);

  const tempFilePath = '/tmp/output.mp4'

	await renderMedia({
    composition: composition,
    serveUrl: req.body.serveUrl,
    codec: req.body.codec,
    outputLocation: tempFilePath,
		inputProps: req.body.inputProps,
  });

	const storage = new Storage();

	await storage.bucket(req.body.outputBucket).upload(tempFilePath, { destination: req.body.outputFile });

	console.log('output uploaded to ', req.body.outputBucket);
	res.send('OK');
};