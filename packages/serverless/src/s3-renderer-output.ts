import {createReadStream} from 'node:fs';
import type {EmittedArtifact} from '@remotion/renderer';
import type {
	CloudProvider,
	OnStream,
	ProviderSpecifics,
	S3RendererArtifactMetadata,
	S3RendererStatus,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	deserializeArtifact,
	rendererTransportArtifactKey,
	rendererTransportAudioKey,
	rendererTransportStatusKey,
	rendererTransportVideoKey,
	ServerlessRoutines,
} from '@remotion/serverless-client';

export const makeS3RendererOutput = <Provider extends CloudProvider>({
	params,
	expectedBucketOwner,
	region,
	providerSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	expectedBucketOwner: string;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
}) => {
	if (params.type !== ServerlessRoutines.renderer) {
		throw new Error('Expected renderer payload');
	}

	const startedAt = Date.now();
	let lambdaInvoked = true;
	let renderedFrames = 0;
	let encodedFrames = 0;
	let writeQueue = Promise.resolve();
	const artifacts: Array<{
		key: string;
		metadata: S3RendererArtifactMetadata;
	}> = [];
	const artifactUploads: Promise<void>[] = [];

	const statusKey = rendererTransportStatusKey({
		renderId: params.renderId,
		chunk: params.chunk,
		attempt: params.attempt,
	});

	const writeStatus = (status: S3RendererStatus) => {
		writeQueue = writeQueue.then(() =>
			providerSpecifics.writeFile({
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
			}),
		);
		return writeQueue;
	};

	const runningStatus = (): S3RendererStatus => ({
		schema: 1,
		state: 'running',
		chunk: params.chunk,
		attempt: params.attempt,
		lambdaInvoked,
		renderedFrames,
		encodedFrames,
		startedAt,
	});

	const initialize = () => writeStatus(runningStatus());

	const onStream: OnStream<Provider> = async (message) => {
		if (message.type === 'lambda-invoked') {
			lambdaInvoked = true;
			await writeStatus(runningStatus());
			return;
		}

		if (message.type === 'frames-rendered') {
			renderedFrames = Math.max(renderedFrames, message.payload.rendered);
			encodedFrames = Math.max(encodedFrames, message.payload.encoded);
			await writeStatus(runningStatus());
			return;
		}

		if (message.type === 'artifact-emitted') {
			const artifact = deserializeArtifact(message.payload.artifact);
			const key = rendererTransportArtifactKey(
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
			const upload = providerSpecifics.writeFile({
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
				renderedFrames,
				encodedFrames,
				startedAt,
				failedAt: Date.now(),
				errorInfo: message.payload.errorInfo,
				shouldRetry: message.payload.shouldRetry,
			});
			return;
		}

		if (message.type === 'chunk-complete') {
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
			: rendererTransportVideoKey({
					renderId: params.renderId,
					chunk: params.chunk,
					attempt: params.attempt,
				});
		const audioKey =
			audioOutputLocation || isAudioOnly
				? rendererTransportAudioKey({
						renderId: params.renderId,
						chunk: params.chunk,
						attempt: params.attempt,
					})
				: null;

		await Promise.all([
			...artifactUploads,
			videoKey
				? providerSpecifics.writeFile({
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
				? providerSpecifics.writeFile({
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
			renderedFrames,
			encodedFrames,
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
