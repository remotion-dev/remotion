import type {RenderMetadata} from '../../defaults';
import {getExpectedOutName} from '../../functions/helpers/expected-out-name';
import {expectToThrow} from '../helpers/expect-to-throw';

const bucketName = 'remotionlambda-98fsduf';

const testRenderMetadata: RenderMetadata = {
	codec: 'h264',
	compositionId: 'react-svg',
	estimatedRenderLambdaInvokations: 100,
	estimatedTotalLambdaInvokations: 100,
	framesPerLambda: 20,
	imageFormat: 'png',
	type: 'video',
	inputProps: {},
	lambdaVersion: '2022-02-14',
	memorySizeInMb: 2048,
	outName: undefined,
	region: 'eu-central-1',
	renderId: '9n8dsfafs',
	siteId: 'my-site',
	startedDate: Date.now(),
	totalChunks: 20,
	usesOptimizationProfile: false,
	videoConfig: {
		defaultProps: {},
		durationInFrames: 200,
		fps: 30,
		height: 1080,
		id: 'react-svg',
		width: 1080,
	},
};

test('Should get a custom outname', () => {
	expect(getExpectedOutName(testRenderMetadata, bucketName)).toEqual({
		renderBucketName: 'remotionlambda-98fsduf',
		key: 'renders/9n8dsfafs/out.mp4',
	});
});

test('Should save to a different outname', () => {
	const newRenderMetadata: RenderMetadata = {
		...testRenderMetadata,
		outName: {
			bucketName: 'my-bucket',
			key: 'my-key',
		},
	};
	expect(getExpectedOutName(newRenderMetadata, bucketName)).toEqual({
		renderBucketName: 'my-bucket',
		key: 'my-key',
	});
});

test('For stills', () => {
	const newRenderMetadata: RenderMetadata = {
		...testRenderMetadata,
		type: 'still',
	};
	expect(getExpectedOutName(newRenderMetadata, bucketName)).toEqual({
		renderBucketName: 'remotionlambda-98fsduf',
		key: 'renders/9n8dsfafs/out.png',
	});
});

test('Just a custom name', () => {
	const newRenderMetadata: RenderMetadata = {
		...testRenderMetadata,
		outName: 'justaname.jpeg',
	};
	expect(getExpectedOutName(newRenderMetadata, bucketName)).toEqual({
		renderBucketName: 'remotionlambda-98fsduf',
		key: 'renders/9n8dsfafs/justaname.jpeg',
	});
});

test('Should throw on invalid names', () => {
	const newRenderMetadata: RenderMetadata = {
		...testRenderMetadata,
		outName: '👺.jpeg',
	};
	expectToThrow(() => {
		expect(getExpectedOutName(newRenderMetadata, bucketName)).toEqual({
			renderBucketName: 'remotionlambda-98fsduf',
			key: 'renders/9n8dsfafs/justaname.jpeg',
		});
	}, /The S3 Key must match the RegExp/);
});
test('Should allow outName an outname with a slash', () => {
	const newRenderMetadata: RenderMetadata = {
		...testRenderMetadata,
		outName: 'justa/name.jpeg',
	};
	expect(getExpectedOutName(newRenderMetadata, bucketName)).toEqual({
		key: 'renders/9n8dsfafs/justa/name.jpeg',
		renderBucketName: 'remotionlambda-98fsduf',
	});
});
