import {CliInternals} from '@remotion/cli';
import {writeFileSync} from 'fs';
import path from 'path';
import {deployLambda} from './api/deploy-lambda';
import {deployProject} from './api/deploy-project';
import {ensureLambdaBinaries} from './api/ensure-lambda-binaries';
import {getRemotionS3Buckets} from './api/get-buckets';
import {getOrCreateBucket} from './api/get-or-create-bucket';
import {getRenderProgress} from './api/get-render-progress';
import {cleanupLambdas, getRemotionLambdas} from './cleanup/cleanup-lambdas';
import {getAwsRegion} from './cli/get-aws-region';
import {Log} from './cli/log';
import {lambdaLs, lambdaReadFile} from './functions/helpers/io';
import {AwsRegion} from './pricing/aws-regions';
import {getLambdaClient} from './shared/aws-clients';
import {callLambda} from './shared/call-lambda';
import {
	getSitesKey,
	LambdaRoutines,
	REMOTION_BUCKET_PREFIX,
	timingProfileName,
} from './shared/constants';
import {makeS3Url} from './shared/make-s3-url';
import {sleep} from './shared/sleep';
import {streamToString} from './shared/stream-to-string';

const DEPLOY = false;

const getFnName = async (options: {
	region: AwsRegion;
}): Promise<{
	functionName: string;
	bucketUrl: string;
	compositionName: string;
}> => {
	const bucketName = await getOrCreateBucket({region: getAwsRegion()});
	if (DEPLOY) {
		await cleanupLambdas({lambdaClient: getLambdaClient(options.region)});
		// await cleanUpBuckets({s3client: s3Client});
		const {layerArn} = await ensureLambdaBinaries(getAwsRegion());

		const {functionName} = await deployLambda({
			region: getAwsRegion(),
			timeoutInSeconds: 120,
			layerArn,
			memorySize: 1024,
		});

		const {url} = await deployProject({
			entryPoint: path.join(__dirname, '..', 'remotion-project', 'index.ts'),
			bucketName,
			region: getAwsRegion(),
		});

		return {functionName, bucketUrl: url, compositionName: 'my-video'};
	}

	const lambdas = await getRemotionLambdas(getLambdaClient(options.region));
	const {remotionBuckets} = await getRemotionS3Buckets(options.region);
	const websiteBuckets = remotionBuckets.filter((b) =>
		(b.Name as string).startsWith(REMOTION_BUCKET_PREFIX)
	);
	const prefix = getSitesKey('');
	const firstBucket = await lambdaLs({
		bucketName: websiteBuckets[0].Name as string,
		prefix,
		region: getAwsRegion(),
	});
	const firstSite = firstBucket.find(() => true);
	return {
		functionName: lambdas[0].FunctionName as string,
		bucketUrl: makeS3Url({
			bucketName: websiteBuckets[0].Name as string,
			subFolder: firstSite?.Key?.match(/(sites\/.*)\//)?.[1] as string,
			region: getAwsRegion(),
		}),
		compositionName: 'Main',
	};
};

CliInternals.xns(async () => {
	const {functionName, bucketUrl, compositionName} = await getFnName({
		region: getAwsRegion(),
	});
	const res = await callLambda({
		functionName,
		type: LambdaRoutines.start,
		payload: {
			chunkSize: 20,
			composition: compositionName,
			serveUrl: bucketUrl,
			inputProps: {},
			codec: 'h264-mkv',
			imageFormat: 'jpeg',
			crf: undefined,
			envVariables: {},
			pixelFormat: undefined,
			proResProfile: undefined,
			quality: undefined,
			maxRetries: 3,
		},
		region: 'eu-central-1',
	});
	Log.info(bucketUrl);
	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const status = await getRenderProgress({
			functionName,
			bucketName: res.bucketName,
			renderId: res.renderId,
			region: getAwsRegion(),
		});
		Log.info(status);
		if (status.done) {
			Log.info('Done! ' + res.bucketName);
			break;
		}
	}

	const logs = await lambdaLs({
		bucketName: res.bucketName,
		prefix: timingProfileName(res.renderId),
		region: getAwsRegion(),
	});

	for (const log of logs) {
		const content = await lambdaReadFile({
			bucketName: res.bucketName,
			key: log.Key as string,
			region: getAwsRegion(),
		});
		writeFileSync(log.Key as string, await streamToString(content));
	}
});
