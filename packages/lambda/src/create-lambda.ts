import {CreateFunctionCommand, LambdaClient} from '@aws-sdk/client-lambda';
import xns from 'xns';
import {bundleLambda} from './bundle-lambda';
import {bundleRemotion} from './bundle-remotion';

const client = new LambdaClient({
	region: 'eu-central-1',
});

// https://jonnytv.s3.eu-central-1.amazonaws.com/test-lambda-91cf079b-ae80-4994-8a3a-1d2edd33ae5b.zip
// Set the parameters.
const params = {
	Code: {
		S3Bucket: 'jonnytv', // BUCKET_NAME
		S3Key: 'test-lambda-91cf079b-ae80-4994-8a3a-1d2edd33ae5b.zip', // ZIP_FILE_NAME
	},
	FunctionName: 'remotion-test',
	Handler: 'index.handler',
	Role: 'arn:aws:iam::976210361945:role/lambda-admin', // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
	Runtime: 'nodejs12.x',
	Description: 'Renders a Remotion video.',
};

xns(async () => {
	await bundleRemotion();
	await bundleLambda();
	try {
		const data = await client.send(new CreateFunctionCommand(params));
		console.log('Success', data); // successful response
	} catch (err) {
		console.log('Error', err); // an error occurred
	}
});
