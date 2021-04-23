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
	LAMBDA_BUCKET_PREFIX,
	REGION,
	REMOTION_RENDER_FN_ZIP,
	RENDER_FN_PREFIX,
} from './constants';
import {ensureLayers} from './lambda-layers';
import {uploadDir} from './upload-dir';

const lambdaClient = new LambdaClient({
	region: REGION,
});

const s3Client = new S3Client({region: REGION});

const ENABLE_EFS = false;

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

	await lambdaClient.send(
		new CreateFunctionCommand({
			Code: {
				S3Bucket: bucketName,
				S3Key: s3KeyRender,
			},
			FunctionName: fnNameRender,
			Handler: 'index.handler',
			Role: 'arn:aws:iam::976210361945:role/lambda-admin', // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
			Runtime: 'nodejs12.x',
			Description: 'Renders a Remotion video.',
			MemorySize: 1769 * 2,
			Timeout: 60,
			Layers: [layerArn],
			VpcConfig: ENABLE_EFS
				? {
						SubnetIds: [
							'subnet-0c7d7756beb9cdc4d',
							'subnet-076ce2be687a13ee1',
							'subnet-015ae228c978f9b83',
						],
						SecurityGroupIds: ['sg-0840e6025b19e429d'],
				  }
				: undefined,
			FileSystemConfigs: ENABLE_EFS
				? [
						{
							Arn:
								'arn:aws:elasticfilesystem:eu-central-1:976210361945:access-point/fsap-04d592e24b3ae3074',
							LocalMountPath: '/mnt/remotion-efs',
						},
				  ]
				: undefined,
		})
	);
	console.log('lambdas created');

	return fnNameRender;
});
