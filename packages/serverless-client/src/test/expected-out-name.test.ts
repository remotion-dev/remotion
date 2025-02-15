import {expect, test} from 'bun:test';
import {getExpectedOutName} from '../expected-out-name';
import type {RenderMetadata} from '../render-metadata';

const bucketName = 'remotionlambda-98fsduf';

type MockProvider = {
	type: 'aws';
	region: 'eu-central';
	receivedArtifactType: {
		s3Key: string;
		s3Url: string;
	};
	creationFunctionOptions: {};
};

const testRenderMetadata: RenderMetadata<MockProvider> = {
	compositionId: 'react-svg',
	estimatedRenderLambdaInvokations: 100,
	estimatedTotalLambdaInvokations: 100,
	framesPerLambda: 20,
	imageFormat: 'png',
	type: 'video',
	inputProps: {
		type: 'payload',
		payload: '{}',
	},
	lambdaVersion: '2022-02-14',
	memorySizeInMb: 2048,
	functionName: 'remotion-render-4-0-187-mem3000mb-disk10000mb-120sec',
	rendererFunctionName: 'remotion-render-4-0-187-mem3000mb-disk10000mb-120sec',
	outName: undefined,
	region: 'eu-central',
	renderId: '9n8dsfafs',
	siteId: 'my-site',
	startedDate: Date.now(),
	totalChunks: 20,
	privacy: 'public',
	everyNthFrame: 1,
	frameRange: [0, 199],
	audioCodec: null,
	deleteAfter: null,
	numberOfGifLoops: null,
	downloadBehavior: {type: 'play-in-browser'},
	audioBitrate: null,
	muted: false,
	metadata: null,
	codec: 'h264',
	dimensions: {
		width: 1920,
		height: 1080,
	},
};

test('Should get a custom outname', () => {
	expect(
		getExpectedOutName({
			renderMetadata: testRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		}),
	).toEqual({
		customCredentials: null,
		renderBucketName: 'remotionlambda-98fsduf',
		key: 'renders/9n8dsfafs/out.mp4',
	});
});

test('Should save to a different outname', () => {
	const newRenderMetadata: RenderMetadata<MockProvider> = {
		...testRenderMetadata,
		outName: {
			bucketName: 'my-bucket',
			key: 'my-key',
		},
	};
	expect(
		getExpectedOutName({
			renderMetadata: newRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		}),
	).toEqual({
		customCredentials: null,
		renderBucketName: 'my-bucket',
		key: 'my-key',
	});
});

test('For stills', () => {
	const newRenderMetadata: RenderMetadata<MockProvider> = {
		...testRenderMetadata,
		codec: null,
		type: 'still',
		imageFormat: 'png',
	};
	expect(
		getExpectedOutName({
			renderMetadata: newRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		}),
	).toEqual({
		customCredentials: null,
		renderBucketName: 'remotionlambda-98fsduf',
		key: 'renders/9n8dsfafs/out.png',
	});
});

test('Just a custom name', () => {
	const newRenderMetadata: RenderMetadata<MockProvider> = {
		...testRenderMetadata,
		type: 'still',
		imageFormat: 'jpeg',
		codec: null,
		outName: 'justaname.jpeg',
	};
	expect(
		getExpectedOutName({
			renderMetadata: newRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		}),
	).toEqual({
		customCredentials: null,
		renderBucketName: 'remotionlambda-98fsduf',
		key: 'renders/9n8dsfafs/justaname.jpeg',
	});
});

test('Should throw on invalid names', () => {
	const newRenderMetadata: RenderMetadata<MockProvider> = {
		...testRenderMetadata,
		type: 'still',
		imageFormat: 'png',
		codec: null,
		outName: '👺.jpeg',
	};
	expect(() => {
		getExpectedOutName({
			renderMetadata: newRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		});
	}).toThrow(/The S3 Key must match the RegExp/);
});

test('Should allow outName an outname with a slash', () => {
	const newRenderMetadata: RenderMetadata<MockProvider> = {
		...testRenderMetadata,
		codec: null,
		audioCodec: null,
		type: 'still',
		imageFormat: 'jpeg',
		outName: 'justa/name.jpeg',
	};
	expect(
		getExpectedOutName({
			renderMetadata: newRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		}),
	).toEqual({
		customCredentials: null,
		key: 'renders/9n8dsfafs/justa/name.jpeg',
		renderBucketName: 'remotionlambda-98fsduf',
	});
});

test('Should allow outName an outname with colon', () => {
	const newRenderMetadata: RenderMetadata<MockProvider> = {
		...testRenderMetadata,
		codec: null,
		audioCodec: null,
		type: 'still' as const,
		imageFormat: 'jpeg',
		outName: 'ap-east-1:xxxxxx/video/XXXXX-0b9ba84XXXX.mp4',
	};
	expect(
		getExpectedOutName({
			renderMetadata: newRenderMetadata,
			bucketName,
			customCredentials: null,
			bucketNamePrefix: 'remotionlambda-',
		}),
	).toEqual({
		customCredentials: null,
		key: 'renders/9n8dsfafs/ap-east-1:xxxxxx/video/XXXXX-0b9ba84XXXX.mp4',
		renderBucketName: 'remotionlambda-98fsduf',
	});
});
