import {cleanItems} from './clean-items';
import {REMOTION_BUCKET_PREFIX} from './constants';
import {lambdaDeleteFileImplementation} from './delete-file';
import {getExpectedOutName} from './expected-out-name';
import {getAccountIdImplementation} from './get-account-id';
import {getOverallProgressFromStorage} from './get-overall-progress-from-storage';
import {getImageSequenceFrameKey} from './image-sequence';
import {lambdaLsImplementation} from './list-objects';
import type {AwsRegion} from './regions';
import {rendersPrefix, type CustomCredentials} from './shared-constants';
import type {RequestHandler} from './types';

export type DeleteRenderInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	customCredentials?: CustomCredentials;
	separateAudioCredentials?: CustomCredentials;
	forcePathStyle?: boolean;
	requestHandler?: RequestHandler;
};

export const internalDeleteRender = async (
	input: DeleteRenderInput & {
		forcePathStyle: boolean;
	},
) => {
	const expectedBucketOwner = await getAccountIdImplementation({
		region: input.region,
	});
	const progress = await getOverallProgressFromStorage({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
		forcePathStyle: input.forcePathStyle,
		requestHandler: input.requestHandler,
	});

	// Render did not start yet
	if (progress.renderMetadata === null) {
		return {freedBytes: 0};
	}

	const mainOutput = getExpectedOutName({
		output: 'main',
		renderMetadata: progress.renderMetadata,
		bucketName: input.bucketName,
		customCredentials: input.customCredentials ?? null,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
	});
	const separateAudioOutput =
		(progress.renderMetadata.separateAudioTo ?? null) === null
			? null
			: getExpectedOutName({
					output: 'separate-audio',
					renderMetadata: progress.renderMetadata,
					bucketName: input.bucketName,
					customCredentials:
						input.separateAudioCredentials ?? input.customCredentials ?? null,
					bucketNamePrefix: REMOTION_BUCKET_PREFIX,
				});

	if (progress.renderMetadata.type === 'sequence') {
		const {renderBucketName, customCredentials} = mainOutput;
		const metadata = progress.renderMetadata;
		const sequence = metadata.outputSequence;
		const frames = Array.from(
			{
				length:
					Math.floor(
						(metadata.frameRange[1] - metadata.frameRange[0]) /
							metadata.everyNthFrame,
					) + 1,
			},
			(_, index) => metadata.frameRange[0] + index * metadata.everyNthFrame,
		);
		const keys = [
			...frames.map((frame) =>
				getImageSequenceFrameKey({
					frame,
					keyPrefix: sequence.keyPrefix,
					imageFormat: sequence.imageFormat,
					imageSequencePattern: metadata.imageSequencePattern,
					framePadding: metadata.framePadding,
				}),
			),
			`${sequence.keyPrefix}.remotion-render.json`,
		];
		for (let index = 0; index < keys.length; index += 25) {
			await Promise.all(
				keys.slice(index, index + 25).map((frameKey) =>
					lambdaDeleteFileImplementation({
						bucketName: renderBucketName,
						key: frameKey,
						region: input.region,
						customCredentials,
						forcePathStyle: input.forcePathStyle,
						requestHandler: input.requestHandler,
					}),
				),
			);
		}
	}

	for (const {key, renderBucketName, customCredentials} of [
		mainOutput,
		...(separateAudioOutput === null ? [] : [separateAudioOutput]),
	]) {
		await lambdaDeleteFileImplementation({
			bucketName: renderBucketName,
			customCredentials,
			key,
			region: input.region,
			forcePathStyle: input.forcePathStyle,
			requestHandler: input.requestHandler,
		});
	}

	let files = await lambdaLsImplementation({
		bucketName: input.bucketName,
		prefix: rendersPrefix(input.renderId),
		region: input.region,
		expectedBucketOwner,
		forcePathStyle: input.forcePathStyle,
		requestHandler: input.requestHandler,
	});

	let totalSize = 0;

	while (files.length > 0) {
		totalSize += files.reduce((a, b) => {
			return a + (b.Size ?? 0);
		}, 0);
		await cleanItems({
			list: files.map((f) => f.Key as string),
			bucket: input.bucketName,
			onAfterItemDeleted: () => undefined,
			onBeforeItemDeleted: () => undefined,
			region: input.region,
			forcePathStyle: input.forcePathStyle,
			requestHandler: input.requestHandler,
		});
		files = await lambdaLsImplementation({
			bucketName: input.bucketName,
			prefix: rendersPrefix(input.renderId),
			region: input.region,
			expectedBucketOwner,
			forcePathStyle: input.forcePathStyle,
			requestHandler: input.requestHandler,
		});
	}

	return {
		freedBytes: totalSize,
	};
};

/*
 * @description Deletes a rendered video, audio, still or image sequence and its associated metadata.
 * @see [Documentation](https://remotion.dev/docs/lambda/deleterender)
 */
export const deleteRender = (input: DeleteRenderInput) => {
	return internalDeleteRender({
		...input,
		forcePathStyle: input.forcePathStyle ?? false,
	});
};
