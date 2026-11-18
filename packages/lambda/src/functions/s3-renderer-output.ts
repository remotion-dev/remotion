import {createReadStream} from 'node:fs';
import {
	LambdaClientInternals,
	ServerlessRoutines,
	type OnStream,
	type S3RendererArtifactMetadata,
	type S3RendererStatus,
	type ServerlessPayload,
	type AwsRegion,
} from '@remotion/lambda-client';
import type {EmittedArtifact} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {getCurrentMemorySizeInMb} from './helpers/get-current-memory-size';

type S3StatusWriterState =
	| {type: 'running'}
	| {type: 'terminal'; state: 'completed' | 'failed'};

export const makeS3RendererOutput = ({
	params,
	expectedBucketOwner,
	region,
}: {
	params: ServerlessPayload;
	expectedBucketOwner: string | null;
	region: AwsRegion;
}) => {
	if (params.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer payload');
	}

	const startedAt = Date.now();
	const memorySizeInMb = getCurrentMemorySizeInMb();
	let lambdaInvoked = true;
	let renderedFrames = 0;
	let encodedFrames = 0;
	let uploadedFrames = 0;
	let uploadedSizeInBytes = 0;
	let writeQueue: Promise<void> = Promise.resolve();
	let writerState: S3StatusWriterState = {type: 'running'};
	const artifacts: Array<{
		key: string;
		metadata: S3RendererArtifactMetadata;
	}> = [];
	const artifactUploads: Promise<void>[] = [];

	const statusKey = LambdaClientInternals.rendererTransportStatusKey({
		renderId: params.renderId,
		chunk: params.chunk,
		attempt: params.attempt,
	});

	const writeStatus = (status: S3RendererStatus): Promise<void> => {
		const write = writeQueue
			.catch(() => undefined)
			.then(async () => {
				if (writerState.type === 'terminal') {
					RenderInternals.Log.verbose(
						{indent: false, logLevel: params.logLevel},
						`Ignoring ${status.state} status after ${writerState.state} status`,
					);
					return;
				}

				await LambdaClientInternals.lambdaWriteFileImplementation({
					bucketName: params.bucketName,
					key: statusKey,
					body: JSON.stringify(status),
					region,
					privacy: 'private',
					expectedBucketOwner,
					downloadBehavior: null,
					customCredentials: null,
					forcePathStyle: params.forcePathStyle,
					storageClass: null,
					requestHandler: null,
				});
				if (status.state !== 'running') {
					writerState = {type: 'terminal', state: status.state};
				}
			});
		writeQueue = write;
		return write;
	};

	const runningStatus = (): S3RendererStatus => ({
		schema: 1,
		state: 'running',
		chunk: params.chunk,
		attempt: params.attempt,
		lambdaInvoked,
		memorySizeInMb,
		renderedFrames,
		encodedFrames,
		uploadedFrames,
		uploadedSizeInBytes,
		startedAt,
	});

	const writeProgressStatus = async () => {
		try {
			await writeStatus(runningStatus());
		} catch (err) {
			RenderInternals.Log.warn(
				{indent: false, logLevel: params.logLevel},
				'Could not write renderer progress status',
				err,
			);
		}
	};

	const initialize = () => writeStatus(runningStatus());

	const onStream: OnStream = async (message) => {
		if (message.type === 'lambda-invoked') {
			lambdaInvoked = true;
			await writeProgressStatus();
			return;
		}

		if (message.type === 'frames-rendered') {
			renderedFrames = Math.max(renderedFrames, message.payload.rendered);
			encodedFrames = Math.max(encodedFrames, message.payload.encoded);
			await writeProgressStatus();
			return;
		}

		if (message.type === 'frames-uploaded') {
			uploadedFrames = Math.max(uploadedFrames, message.payload.uploaded);
			uploadedSizeInBytes = Math.max(
				uploadedSizeInBytes,
				message.payload.sizeInBytes,
			);
			await writeProgressStatus();
			return;
		}

		if (message.type === 'artifact-emitted') {
			const artifact = LambdaClientInternals.deserializeArtifact(
				message.payload.artifact,
			);
			const key = LambdaClientInternals.rendererTransportArtifactKey(
				{
					renderId: params.renderId,
					chunk: params.chunk,
					attempt: params.attempt,
				},
				artifacts.length,
			);
			const metadata: S3RendererArtifactMetadata = {
				filename: artifact.filename,
				frame: artifact.frame,
				binary: artifact.content instanceof Uint8Array,
				downloadBehavior: artifact.downloadBehavior,
			};
			artifacts.push({key, metadata});
			const upload = LambdaClientInternals.lambdaWriteFileImplementation({
				bucketName: params.bucketName,
				key,
				body: artifact.content,
				region,
				privacy: 'private',
				expectedBucketOwner,
				downloadBehavior: null,
				customCredentials: null,
				forcePathStyle: params.forcePathStyle,
				storageClass: null,
				requestHandler: null,
			});
			artifactUploads.push(upload);
			await upload;
			return;
		}

		if (message.type === 'error-occurred') {
			await writeStatus({
				schema: 1,
				state: 'failed',
				chunk: params.chunk,
				attempt: params.attempt,
				lambdaInvoked,
				memorySizeInMb,
				renderedFrames,
				encodedFrames,
				uploadedFrames,
				uploadedSizeInBytes,
				startedAt,
				failedAt: Date.now(),
				errorInfo: message.payload.errorInfo,
				shouldRetry: message.payload.shouldRetry,
			});
			return;
		}

		if (message.type === 'chunk-complete') {
			if (params.output.type === 'sequence') {
				await Promise.all(artifactUploads);
				await writeStatus({
					...runningStatus(),
					state: 'completed',
					lambdaInvoked: true,
					completedAt: message.payload.rendered,
					videoKey: null,
					audioKey: null,
					artifacts,
				});
			}

			return;
		}

		throw new Error(
			`Unexpected ${message.type} event in S3 renderer transport`,
		);
	};

	const uploadMediaAndComplete = async ({
		videoOutputLocation,
		audioOutputLocation,
		isAudioOnly,
		completedAt,
	}: {
		videoOutputLocation: string;
		audioOutputLocation: string | null;
		isAudioOnly: boolean;
		completedAt: number;
	}) => {
		const videoKey = isAudioOnly
			? null
			: LambdaClientInternals.rendererTransportVideoKey({
					renderId: params.renderId,
					chunk: params.chunk,
					attempt: params.attempt,
				});
		const audioKey =
			audioOutputLocation || isAudioOnly
				? LambdaClientInternals.rendererTransportAudioKey({
						renderId: params.renderId,
						chunk: params.chunk,
						attempt: params.attempt,
					})
				: null;

		await Promise.all([
			...artifactUploads,
			videoKey
				? LambdaClientInternals.lambdaWriteFileImplementation({
						bucketName: params.bucketName,
						key: videoKey,
						body: createReadStream(videoOutputLocation),
						region,
						privacy: 'private',
						expectedBucketOwner,
						downloadBehavior: null,
						customCredentials: null,
						forcePathStyle: params.forcePathStyle,
						storageClass: null,
						requestHandler: null,
					})
				: null,
			audioKey
				? LambdaClientInternals.lambdaWriteFileImplementation({
						bucketName: params.bucketName,
						key: audioKey,
						body: createReadStream(audioOutputLocation ?? videoOutputLocation),
						region,
						privacy: 'private',
						expectedBucketOwner,
						downloadBehavior: null,
						customCredentials: null,
						forcePathStyle: params.forcePathStyle,
						storageClass: null,
						requestHandler: null,
					})
				: null,
		]);

		lambdaInvoked = true;
		await writeStatus({
			schema: 1,
			state: 'completed',
			chunk: params.chunk,
			attempt: params.attempt,
			lambdaInvoked: true,
			memorySizeInMb,
			renderedFrames,
			encodedFrames,
			uploadedFrames,
			uploadedSizeInBytes,
			startedAt,
			completedAt,
			videoKey,
			audioKey,
			artifacts,
		});
	};

	return {initialize, onStream, uploadMediaAndComplete};
};

export const artifactFromS3 = ({
	metadata,
	content,
}: {
	metadata: S3RendererArtifactMetadata;
	content: Uint8Array;
}): EmittedArtifact => ({
	filename: metadata.filename,
	frame: metadata.frame,
	downloadBehavior: metadata.downloadBehavior,
	content: metadata.binary ? content : new TextDecoder().decode(content),
});
