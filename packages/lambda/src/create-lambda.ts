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
import {createLayer} from './create-layer';
import {uploadDir} from './upload-dir';

const region = 'eu-central-1';

const lambdaClient = new LambdaClient({
	region,
});

const s3Client = new S3Client({region});

const ENABLE_EFS = false;

xns(async () => {
	// TODO: Only create layer if doesn't exist
	const layer = await createLayer(lambdaClient);
	const bucketName = 'remotion-bucket-' + Math.random();
	const id = String(Math.random());
	const s3KeyRender = `remotion-render-function-${id}.zip`;
	const s3KeyStitcher = `remotion-stitcher-function-${id}.zip`;
	const fnNameRender =
		'remotion-render-test-' + String(Math.random()).replace('0.', '');
	const fnNameStitcher =
		'remotion-stitcher-test-' + String(Math.random()).replace('0.', '');
	const [remBundle, renderOut, stitcherOut] = await Promise.all([
		bundleRemotion(),
		bundleLambda('render'),
		bundleLambda('stitcher'),
	]);

	await s3Client.send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);

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

	// Upload bundle
	await uploadDir({
		bucket: bucketName,
		client: s3Client,
		dir: remBundle,
	});
	console.log('bundle uploaded');

	// Upload lambda
	await Promise.all([
		s3Client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Body: createReadStream(renderOut),
				Key: s3KeyRender,
				ACL: 'public-read',
			})
		),
		s3Client.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Body: createReadStream(stitcherOut),
				Key: s3KeyStitcher,
				ACL: 'public-read',
			})
		),
	]);

	// TODO: Do it with HTTPS, but wait for certificate
	const url = `http://${bucketName}.s3.${region}.amazonaws.com`;
	console.log(url);
	await lambdaClient.send(
		new CreateFunctionCommand({
			Code: {
				S3Bucket: bucketName,
				S3Key: s3KeyStitcher,
			},
			FunctionName: fnNameStitcher,
			Handler: 'index.handler',
			Role: 'arn:aws:iam::976210361945:role/lambda-admin', // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
			Runtime: 'nodejs12.x',
			Description: 'Encodes a Remotion video.',
			MemorySize: 1769 * 2,
			Timeout: 60,
			Layers: [layer.LayerVersionArn as string],
		})
	);
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

	return fnNameRender;
});
