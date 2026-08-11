import {expect, test} from 'bun:test';
import {ServerlessRoutines} from '@remotion/serverless-client';
import {getAwsRegionMetadata} from '../aws-region-metadata';
import {convertToServeUrlImplementation} from '../convert-to-serve-url';
import {
	getCloudwatchMethodUrl,
	getLambdaFunctionUrl,
	getLambdaInsightsUrl,
	getProgressJsonUrl,
	getS3BucketUrl,
	getS3RenderUrl,
} from '../get-aws-urls';
import {getOutputUrlFromMetadata} from '../get-output-url-from-metadata';
import {makeS3ServeUrl} from '../make-s3-url';
import {AWS_REGIONS, DEFAULT_AWS_REGIONS} from '../regions';

const chinaMetadata = {
	partition: 'aws-cn',
	dnsSuffix: 'amazonaws.com.cn',
	consoleDomain: 'console.amazonaws.cn',
	billingCurrency: 'CNY',
} as const;

test('AWS region metadata is exhaustive for China without changing defaults', () => {
	expect(getAwsRegionMetadata('cn-north-1')).toEqual(chinaMetadata);
	expect(getAwsRegionMetadata('cn-northwest-1')).toEqual(chinaMetadata);
	expect(getAwsRegionMetadata('us-east-1')).toEqual({
		partition: 'aws',
		dnsSuffix: 'amazonaws.com',
		consoleDomain: 'console.aws.amazon.com',
		billingCurrency: 'USD',
	});
	expect(AWS_REGIONS).toContain('cn-north-1');
	expect(AWS_REGIONS).toContain('cn-northwest-1');
	expect(DEFAULT_AWS_REGIONS).not.toContain('cn-north-1' as never);
});

test('AWS service and Console URLs use the region partition metadata', () => {
	expect(
		makeS3ServeUrl({
			bucketName: 'bucket',
			subFolder: 'sites/site',
			region: 'cn-north-1',
		}),
	).toBe('https://bucket.s3.cn-north-1.amazonaws.com.cn/sites/site/index.html');
	expect(
		convertToServeUrlImplementation({
			bucketName: 'bucket',
			urlOrId: 'site',
			region: 'cn-north-1',
		}),
	).toBe('https://bucket.s3.cn-north-1.amazonaws.com.cn/sites/site/index.html');
	expect(
		getOutputUrlFromMetadata({
			bucketName: 'bucket',
			customCredentials: null,
			currentRegion: 'cn-north-1',
			renderMetadata: {
				outName: 'out.mp4',
				privacy: 'public',
				renderId: 'render-id',
			} as never,
		}),
	).toEqual({
		key: 'renders/render-id/out.mp4',
		url: 'https://s3.cn-north-1.amazonaws.com.cn/bucket/renders/render-id/out.mp4',
	});

	const consoleUrls = [
		getCloudwatchMethodUrl({
			region: 'cn-north-1',
			functionName: 'fn',
			method: ServerlessRoutines.start,
			rendererFunctionName: null,
			renderId: 'render-id',
		}),
		getLambdaInsightsUrl({region: 'cn-north-1', functionName: 'fn'}),
		getS3RenderUrl({
			region: 'cn-north-1',
			bucketName: 'bucket',
			renderId: 'render-id',
		}),
		getProgressJsonUrl({
			region: 'cn-north-1',
			bucketName: 'bucket',
			renderId: 'render-id',
		}),
		getLambdaFunctionUrl({region: 'cn-north-1', functionName: 'fn'}),
		getS3BucketUrl({region: 'cn-north-1', bucketName: 'bucket'}),
	];
	for (const url of consoleUrls) {
		expect(url).toContain('console.amazonaws.cn');
		expect(url).toContain('cn-north-1');
	}

	expect(getLambdaFunctionUrl({region: 'us-east-1', functionName: 'fn'})).toBe(
		'https://us-east-1.console.aws.amazon.com/lambda/home#/functions/fn?tab=code',
	);
});
