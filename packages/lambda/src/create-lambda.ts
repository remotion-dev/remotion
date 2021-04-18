import {CreateFunctionCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {createReadStream} from 'fs';
import xns from 'xns';
import {bundleLambda} from './bundle-lambda';
import {bundleRemotion} from './bundle-remotion';

const region = 'eu-central-1';
const bucket = 'jonnytv';

const lambdaClient = new LambdaClient({
	region,
});

const s3Client = new S3Client({region});

xns(async () => {
	const s3Key = `remotion-function-${Math.random()}.zip`;
	const fnName = 'remotion-test-' + String(Math.random()).replace('0.', '');
	const remBundle = await bundleRemotion();
	const out = await bundleLambda(remBundle);

	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Body: createReadStream(out),
			Key: s3Key,
		})
	);

	await lambdaClient.send(
		new CreateFunctionCommand({
			Code: {
				S3Bucket: bucket,
				S3Key: s3Key,
			},
			FunctionName: fnName,
			Handler: 'index.handler',
			Role: 'arn:aws:iam::976210361945:role/lambda-admin', // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
			Runtime: 'nodejs12.x',
			Description: 'Renders a Remotion video.',
			MemorySize: 1769 * 2,
			Timeout: 60 * 10,
		})
	);

	return fnName;
});
