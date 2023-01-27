import * as ff from '@google-cloud/functions-framework';
// import {getCompositions} from '@remotion/renderer';
import {getBrowserInstance} from './helpers/get-browser-instance';
import { existsSync, readdirSync } from 'node:fs';


ff.http('TypescriptFunction', async (req: ff.Request, res: ff.Response) => {
	const AWSUrl =
		'https://remotionlambda-11kow3vq6f.s3.us-east-1.amazonaws.com/sites/xmycbufjs3/index.html';
	const GCPUrl =
		'https://storage.googleapis.com/remotionlambda-test/sites/xmycbufjs3/index.html';

	// GCP isn't working, perhaps because because index.html references script files with a relative path, and it needs to be referencing these files with a full URL?
	// At least the AWS url works
	// const comps = await getCompositions(AWSUrl);
	// console.log('comps', comps);

	const browserInstance = await getBrowserInstance(true, {});
	console.log('browserInstance', browserInstance);

	console.log('inside index.ts');


	if (existsSync('/opt/bin/chromium')) {
		console.log('The path exists.');
			readdirSync('/opt/bin/chromium/bin').forEach(file => {
				console.log(file);
			});
	} else {
		console.log('The path does not exist.');
	}

	res.send('OK');
});
