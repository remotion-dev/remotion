import {CreateFunctionCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {createReadStream} from 'fs';
import path from 'path';
import xns from 'xns';
import {bundleLambda} from './bundle-lambda';
import {
	EFS_MOUNT_PATH,
	ENABLE_EFS,
	REGION,
	REMOTION_RENDER_FN_ZIP,
	RENDER_FN_PREFIX,
} from './constants';
import {deploySite} from './deploy-site';
import {ensureLayers} from './lambda-layers';
import {waitForLambdaReady} from './wait-for-lambda-ready';

const lambdaClient = new LambdaClient({
	region: REGION,
});

const s3Client = new S3Client({region: REGION});

type Developer = 'jonny' | 'shankhadeep';
const developer: Developer = 'jonny' as Developer;

export const createLambda = xns(async () => {
	const {layerArn} = await ensureLayers(lambdaClient);
	console.log('Done creating layers');
	const id = String(Math.random());
	const s3KeyRender = `${REMOTION_RENDER_FN_ZIP}${id}.zip`;
	const fnNameRender =
		RENDER_FN_PREFIX + String(Math.random()).replace('0.', '');
	const [renderOut] = await Promise.all([bundleLambda('render')]);
	console.log('done Bundling');

	const {url, bucketName} = await deploySite(
		path.join(__dirname, '..', 'remotion-project', 'index.ts'),
		{
			// TODO: Start uploading lambda now
			onBucketCreated: async () => {},
		}
	);
	console.log(url);
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Body: createReadStream(renderOut),
			Key: s3KeyRender,
			ACL: 'public-read',
		})
	);
	// TODO: Potentially big, should show progress bar

	console.log('lambdas uploaded');

	const created = await lambdaClient.send(
		new CreateFunctionCommand({
			Code: {
				S3Bucket: bucketName,
				S3Key: s3KeyRender,
			},
			FunctionName: fnNameRender,
			Handler: 'index.handler',
			Role:
				developer === 'shankhadeep'
					? 'arn:aws:iam::363307378317:role/awesomeLambda'
					: 'arn:aws:iam::976210361945:role/lambda-admin', // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
			Runtime: 'nodejs12.x',
			Description: 'Renders a Remotion video.',
			MemorySize: 1769 * 2,
			Timeout: 120,
			Layers: [layerArn],

			VpcConfig: ENABLE_EFS
				? {
						SubnetIds: [
							developer === 'shankhadeep'
								? 'subnet-be85fcd4'
								: 'subnet-00e3aa99745996ff7',
						],
						SecurityGroupIds: [
							developer === 'shankhadeep'
								? 'sg-8f2391fc'
								: 'sg-0251b3f6fa6af4577',
						],
				  }
				: undefined,
			FileSystemConfigs: ENABLE_EFS
				? [
						{
							Arn:
								developer === 'shankhadeep'
									? 'arn:aws:elasticfilesystem:eu-central-1:363307378317:access-point/fsap-05a31f7aad4e47581'
									: 'arn:aws:elasticfilesystem:eu-central-1:976210361945:access-point/fsap-0e697d03f5bf221a7',
							LocalMountPath: EFS_MOUNT_PATH,
						},
				  ]
				: undefined,
		})
	);
	console.log('lambdas created');

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	await waitForLambdaReady(created.FunctionName);
	return {
		functionName: created.FunctionName,
		bucketName,
		bucketUrl: url,
	};
});
