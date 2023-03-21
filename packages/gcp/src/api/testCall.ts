import {CliInternals} from '@remotion/cli';
import fs from 'fs';
import {GoogleAuth} from 'google-auth-library';

export type TestInput = {
	cloudRunUrl: string;
};

export const testAuth = async ({cloudRunUrl}: TestInput): Promise<any> => {
	const composition = 'still-zoom';
	const outputBucket = 'remotioncloudrun-n8x4pc7dz3';
	const outName = 'out.png';
	const serveUrl =
		'https://storage.googleapis.com/remotioncloudrun-n8x4pc7dz3/sites/axp52acnh2/index.html';
	const inputProps = {};
	const outputFile = outName;

	CliInternals.Log.info(
		CliInternals.chalk.gray(
			`
Sending request to Cloud Run:

    Cloud Run Service URL = ${cloudRunUrl}
    Type = still
    Composition = ${composition}
    Output Bucket = ${outputBucket}
    Output File = ${outName}
			`.trim()
		)
	);

	const data = {
		type: 'still',
		composition,
		serveUrl,
		inputProps,
		outputBucket,
		outputFile,
	};
	const sa_data = fs.readFileSync('./sa-key.json', 'utf8');
	const credentials = JSON.parse(sa_data);

	const auth = new GoogleAuth({credentials});
	const client = await auth.getIdTokenClient(cloudRunUrl);
	const res = await client.request({
		url: cloudRunUrl,
		method: 'POST',
		data,
	});
	console.info(res.data);
};
