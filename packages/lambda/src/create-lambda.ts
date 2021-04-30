import {CreateFunctionCommand, LambdaClient} from '@aws-sdk/client-lambda';
import {
	CreateBucketCommand,
	PutBucketWebsiteCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {createReadStream} from 'fs';
import xns from 'xns';
import {bundleLambda} from './bundle-lambda';
import {bundleRemotion} from './bundle-remotion';
import {
	EFS_MOUNT_PATH,
	ENABLE_EFS,
	LAMBDA_BUCKET_PREFIX,
	REGION,
	REMOTION_RENDER_FN_ZIP,
	RENDER_FN_PREFIX,
} from './constants';
import {ensureLayers} from './lambda-layers';
import {uploadDir} from './upload-dir';
import {waitForLambdaReady} from './wait-for-lambda-ready';

const lambdaClient = new LambdaClient({
	region: REGION,
});

const s3Client = new S3Client({region: REGION});

type Developer = 'jonny' | 'shankhadeep';
const developer: Developer = 'jonny' as Developer;

xns(async () => {
	const {layerArn} = await ensureLayers(lambdaClient);
	console.log('Done creating layers');
	const bucketName = LAMBDA_BUCKET_PREFIX + Math.random();
	const id = String(Math.random());
	const s3KeyRender = `${REMOTION_RENDER_FN_ZIP}${id}.zip`;
	const fnNameRender =
		RENDER_FN_PREFIX + String(Math.random()).replace('0.', '');
	const [remBundle, renderOut] = await Promise.all([
		bundleRemotion(),
		bundleLambda('render'),
	]);
	console.log('done Bundling');

	await s3Client.send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
	console.log('created bucket', bucketName);

	await s3Client.send(
		new PutBucketWebsiteCommand({
			Bucket: bucketName,
			WebsiteConfiguration: {
				IndexDocument: {
					Suffix: 'index.html',
				},
			},
		})
	);
	console.log('enabled web hosting for bucket', bucketName);

	// Upload bundle
	await uploadDir({
		bucket: bucketName,
		client: s3Client,
		dir: remBundle,
	});
	// TODO: Potentially big, should show progress bar
	console.log('bundle uploaded');

	// Upload lambda
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Body: createReadStream(renderOut),
			Key: s3KeyRender,
			ACL: 'public-read',
		})
	);
	console.log('lambdas uploaded');

	// TODO: Do it with HTTPS, but wait for certificate
	const url = `http://${bucketName}.s3.${REGION}.amazonaws.com`;
	console.log(url);

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
	return fnNameRender;
});
