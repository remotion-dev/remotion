import {
	LambdaClientInternals,
	type ChunkRetry,
	type FunctionErrorInfo,
	type OverallRenderProgress,
	type PostRenderData,
	type ReceivedArtifact,
	type RenderMetadata,
	type SeparateAudioOutput,
	type AwsRegion,
} from '@remotion/lambda-client';
import {RenderInternals, type LogLevel} from '@remotion/renderer';

const progressUploadAttempts = 3;

const wait = (duration: number) => {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, duration);
	});
};

export type OverallProgressHelper = {
	subscribe: (listener: () => void) => () => void;
	upload: (reason: string) => Promise<void>;
	flush: (reason: string) => Promise<void>;
	setFrames: ({
		encoded,
		rendered,
		index,
	}: {
		rendered: number;
		encoded: number;
		index: number;
	}) => void;
	setUploadedFrames: (options: {
		index: number;
		uploaded: number;
		sizeInBytes: number;
	}) => void;
	setLambdaInvoked: (chunk: number, memorySizeInMb: number) => void;
	addChunkCompleted: (
		chunkIndex: number,
		start: number,
		rendered: number,
	) => void;
	setCombinedFrames: (framesEncoded: number) => void;
	setTimeToCombine: (timeToCombine: number) => void;
	addRetry: (retry: ChunkRetry) => void;
	setPostRenderData: (postRenderData: PostRenderData) => Promise<void>;
	setRenderMetadata: (renderMetadata: RenderMetadata) => void;
	setSeparateAudio: (separateAudio: SeparateAudioOutput) => Promise<void>;
	addErrorWithoutUpload: (errorInfo: FunctionErrorInfo) => void;
	setExpectedChunks: (expectedChunks: number) => void;
	get: () => OverallRenderProgress;
	setServeUrlOpened: (timestamp: number) => void;
	setCompositionValidated: (timestamp: number) => void;
	addReceivedArtifact: (asset: ReceivedArtifact) => void;
	getReceivedArtifacts: () => ReceivedArtifact[];
};

export const makeInitialOverallRenderProgress = (
	timeoutTimestamp: number,
	cancellationEnabled: boolean,
): OverallRenderProgress => {
	return {
		cancellationEnabled,
		chunks: [],
		framesRendered: 0,
		framesEncoded: 0,
		framesUploaded: 0,
		uploadedSizeInBytes: 0,
		combinedFrames: 0,
		timeToCombine: null,
		timeToEncode: null,
		lambdasInvoked: 0,
		rendererMemorySizeInMb: null,
		retries: [],
		postRenderData: null,
		separateAudio: null,
		timings: [],
		renderMetadata: null,
		errors: [],
		fatalErrorTimestamp: null,
		timeToRenderFrames: null,
		timeoutTimestamp,
		functionLaunched: Date.now(),
		serveUrlOpened: null,
		compositionValidated: null,
		receivedArtifact: [],
	};
};

export const makeOverallRenderProgress = ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	timeoutTimestamp,
	logLevel,
	forcePathStyle,
	cancellationEnabled,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string | null;
	region: AwsRegion;
	timeoutTimestamp: number;
	logLevel: LogLevel;
	forcePathStyle: boolean;
	cancellationEnabled: boolean;
}): OverallProgressHelper => {
	let framesRendered: number[] = [];
	let framesEncoded: number[] = [];
	let framesUploaded: number[] = [];
	let uploadedSizes: number[] = [];
	let lambdasInvoked: boolean[] = [];

	const renderProgress: OverallRenderProgress =
		makeInitialOverallRenderProgress(timeoutTimestamp, cancellationEnabled);

	let dirty = false;
	let dirtyReasons: string[] = [];
	let uploadLoopPromise: Promise<void> | null = null;
	let uploadError: unknown = null;

	let encodeStartTime: number | null = null;
	let renderFramesStartTime: number | null = null;
	let frameCount: number | null = null;
	const listeners = new Set<() => void>();

	const markDirty = (reason: string) => {
		dirty = true;
		dirtyReasons.push(reason);
		for (const listener of listeners) {
			listener();
		}
	};

	const uploadWithRetries = async (body: string, reasons: string) => {
		for (let attempt = 1; attempt <= progressUploadAttempts; attempt++) {
			const start = Date.now();
			try {
				await LambdaClientInternals.lambdaWriteFileImplementation({
					body,
					bucketName,
					customCredentials: null,
					downloadBehavior: null,
					expectedBucketOwner,
					key: LambdaClientInternals.overallProgressKey(renderId),
					privacy: 'private',
					region,
					forcePathStyle,
					storageClass: null,
					requestHandler: null,
				});
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					`Uploaded progress in ${Date.now() - start}ms`,
				);
				uploadError = null;
				return;
			} catch (err) {
				uploadError = err;
				const willRetry = attempt < progressUploadAttempts;
				RenderInternals.Log.error(
					{indent: false, logLevel},
					willRetry
						? `Error uploading progress (${reasons}), retrying (${attempt}/${progressUploadAttempts})`
						: `Error uploading progress (${reasons})`,
					err,
				);
				if (willRetry) {
					await wait(100 * 2 ** (attempt - 1));
				}
			}
		}
	};

	const runUploadLoop = async () => {
		while (dirty) {
			dirty = false;
			const reasons = dirtyReasons.join(', ');
			dirtyReasons = [];
			const toWrite = JSON.stringify(renderProgress);

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`Uploading progress - ${reasons} (${toWrite.length} bytes)`,
			);
			const start = Date.now();
			await uploadWithRetries(toWrite, reasons);
			// Space out the requests a bit
			await wait(Math.max(0, 250 - (Date.now() - start)));
		}

		uploadLoopPromise = null;
	};

	const upload = async (reason: string) => {
		markDirty(reason);
		if (!uploadLoopPromise) {
			uploadLoopPromise = runUploadLoop();
		}

		await uploadLoopPromise;
	};

	const flush = async (reason: string) => {
		await upload(reason);
		if (uploadError !== null) {
			throw new Error(
				`Could not persist render progress: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
			);
		}
	};

	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		upload,
		flush,
		setFrames: ({
			encoded,
			rendered,
			index,
		}: {
			rendered: number;
			encoded: number;
			index: number;
		}) => {
			if (framesRendered.length === 0) {
				throw new Error('Expected chunks to be set before frames are set');
			}

			if (framesEncoded.length === 0) {
				throw new Error('Expected chunks to be set before frames are set');
			}

			if (
				framesRendered[index] === rendered &&
				framesEncoded[index] === encoded
			) {
				return;
			}

			const totalFramesEncoded =
				renderProgress.framesEncoded + encoded - framesEncoded[index];
			const totalFramesRendered =
				renderProgress.framesRendered + rendered - framesRendered[index];
			framesRendered[index] = rendered;
			framesEncoded[index] = encoded;
			if (renderProgress.framesEncoded === 0 && totalFramesEncoded > 0) {
				encodeStartTime = Date.now();
			}

			if (renderProgress.framesRendered === 0 && totalFramesRendered > 0) {
				renderFramesStartTime = Date.now();
			}

			if (renderProgress.timeToRenderFrames === null) {
				if (frameCount === totalFramesRendered) {
					const timeToRenderFrames =
						Date.now() - (renderFramesStartTime ?? Date.now());
					renderProgress.timeToRenderFrames = timeToRenderFrames;
				}
			}

			renderProgress.framesRendered = totalFramesRendered;
			renderProgress.framesEncoded = totalFramesEncoded;
			upload(
				`setFrames(rendered=${totalFramesRendered}, encoded=${totalFramesEncoded})`,
			);
		},
		setUploadedFrames: ({index, uploaded, sizeInBytes}) => {
			if (
				uploaded < framesUploaded[index] ||
				(uploaded === framesUploaded[index] &&
					sizeInBytes === uploadedSizes[index])
			) {
				return;
			}

			renderProgress.framesUploaded += uploaded - framesUploaded[index];
			renderProgress.uploadedSizeInBytes += sizeInBytes - uploadedSizes[index];
			framesUploaded[index] = uploaded;
			uploadedSizes[index] = sizeInBytes;
			upload(`setUploadedFrames(chunk=${index})`);
		},
		addChunkCompleted: (chunkIndex, start, rendered) => {
			if (
				renderProgress.renderMetadata?.type === 'sequence' &&
				renderProgress.chunks.includes(chunkIndex)
			) {
				return;
			}

			renderProgress.chunks.push(chunkIndex);
			if (
				renderProgress.renderMetadata?.type !== 'sequence' &&
				renderProgress.chunks.length ===
					renderProgress.renderMetadata?.totalChunks
			) {
				const timeToEncode = Date.now() - (encodeStartTime ?? Date.now());
				renderProgress.timeToEncode = timeToEncode;
			}

			renderProgress.timings.push({
				chunk: chunkIndex,
				start,
				rendered,
			});
			upload(`addChunkCompleted(chunk=${chunkIndex})`);
		},
		setCombinedFrames: (frames: number) => {
			if (renderProgress.combinedFrames === frames) {
				return;
			}

			renderProgress.combinedFrames = frames;
			upload(`setCombinedFrames(${frames})`);
		},
		setTimeToCombine: (timeToCombine: number) => {
			renderProgress.timeToCombine = timeToCombine;
			upload(`setTimeToCombine(${timeToCombine})`);
		},
		setLambdaInvoked(chunk, memorySizeInMb) {
			if (lambdasInvoked.length === 0) {
				throw new Error('Expected chunks to be set before lambdas are set');
			}

			const alreadyInvoked = lambdasInvoked[chunk];
			if (
				alreadyInvoked &&
				renderProgress.rendererMemorySizeInMb === memorySizeInMb
			) {
				return;
			}

			lambdasInvoked[chunk] = true;
			renderProgress.rendererMemorySizeInMb = memorySizeInMb;
			if (!alreadyInvoked) {
				renderProgress.lambdasInvoked++;
			}

			upload(`setLambdaInvoked(chunk=${chunk})`);
		},
		async setPostRenderData(postRenderData) {
			renderProgress.postRenderData = postRenderData;
			try {
				await flush('setPostRenderData');
			} catch (err) {
				renderProgress.postRenderData = null;
				throw err;
			}
		},
		async setSeparateAudio(separateAudio) {
			renderProgress.separateAudio = separateAudio;
			await upload('setSeparateAudio');
		},
		setRenderMetadata: (renderMetadata) => {
			renderProgress.renderMetadata = renderMetadata;
			frameCount =
				renderMetadata.type === 'still'
					? null
					: RenderInternals.getFramesToRender(
							renderMetadata.frameRange,
							renderMetadata.everyNthFrame,
						).length;
			upload('setRenderMetadata');
		},
		addErrorWithoutUpload: (errorInfo) => {
			renderProgress.errors.push(errorInfo);
			if (errorInfo.isFatal && renderProgress.fatalErrorTimestamp === null) {
				renderProgress.fatalErrorTimestamp = Date.now();
			}

			for (const listener of listeners) {
				listener();
			}
		},
		setExpectedChunks: (expectedChunks) => {
			framesRendered = new Array(expectedChunks).fill(0);
			framesEncoded = new Array(expectedChunks).fill(0);
			framesUploaded = new Array(expectedChunks).fill(0);
			uploadedSizes = new Array(expectedChunks).fill(0);
			lambdasInvoked = new Array(expectedChunks).fill(false);
		},
		setCompositionValidated(timestamp) {
			renderProgress.compositionValidated = timestamp;
			upload('setCompositionValidated');
		},
		setServeUrlOpened(timestamp) {
			renderProgress.serveUrlOpened = timestamp;
			upload('setServeUrlOpened');
		},
		addRetry(retry) {
			renderProgress.retries.push(retry);
			upload('addRetry');
		},
		addReceivedArtifact(asset) {
			renderProgress.receivedArtifact.push(asset);
			upload('addReceivedArtifact');
		},
		getReceivedArtifacts() {
			return renderProgress.receivedArtifact;
		},
		get: () => renderProgress,
	};
};
