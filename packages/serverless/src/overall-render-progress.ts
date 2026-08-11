import {RenderInternals, type LogLevel} from '@remotion/renderer';
import type {
	ChunkRetry,
	CloudProvider,
	FunctionErrorInfo,
	OverallRenderProgress,
	PostRenderData,
	ProviderSpecifics,
	ReceivedArtifact,
	RenderMetadata,
} from '@remotion/serverless-client';
import {overallProgressKey} from '@remotion/serverless-client';

const progressUploadAttempts = 3;

const wait = (duration: number) => {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, duration);
	});
};

export type OverallProgressHelper<Provider extends CloudProvider> = {
	upload: (reason: string) => Promise<void>;
	setFrames: ({
		encoded,
		rendered,
		index,
	}: {
		rendered: number;
		encoded: number;
		index: number;
	}) => void;
	setLambdaInvoked: (chunk: number) => void;
	addChunkCompleted: (
		chunkIndex: number,
		start: number,
		rendered: number,
	) => void;
	setCombinedFrames: (framesEncoded: number) => void;
	setTimeToCombine: (timeToCombine: number) => void;
	addRetry: (retry: ChunkRetry) => void;
	setPostRenderData: (
		postRenderData: PostRenderData<Provider>,
	) => Promise<void>;
	setRenderMetadata: (renderMetadata: RenderMetadata<Provider>) => void;
	addErrorWithoutUpload: (errorInfo: FunctionErrorInfo) => void;
	setExpectedChunks: (expectedChunks: number) => void;
	get: () => OverallRenderProgress<Provider>;
	setServeUrlOpened: (timestamp: number) => void;
	setCompositionValidated: (timestamp: number) => void;
	addReceivedArtifact: (asset: ReceivedArtifact<Provider>) => void;
	getReceivedArtifacts: () => ReceivedArtifact<Provider>[];
};

export const makeInitialOverallRenderProgress = <
	Provider extends CloudProvider,
>(
	timeoutTimestamp: number,
): OverallRenderProgress<Provider> => {
	return {
		chunks: [],
		framesRendered: 0,
		framesEncoded: 0,
		combinedFrames: 0,
		timeToCombine: null,
		timeToEncode: null,
		lambdasInvoked: 0,
		retries: [],
		postRenderData: null,
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

export const makeOverallRenderProgress = <Provider extends CloudProvider>({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	timeoutTimestamp,
	logLevel,
	providerSpecifics,
	forcePathStyle,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string;
	region: Provider['region'];
	timeoutTimestamp: number;
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
}): OverallProgressHelper<Provider> => {
	let framesRendered: number[] = [];
	let framesEncoded: number[] = [];
	let lambdasInvoked: boolean[] = [];

	const renderProgress: OverallRenderProgress<Provider> =
		makeInitialOverallRenderProgress(timeoutTimestamp);

	let dirty = false;
	let dirtyReasons: string[] = [];
	let uploadLoopPromise: Promise<void> | null = null;

	let encodeStartTime: number | null = null;
	let renderFramesStartTime: number | null = null;

	const markDirty = (reason: string) => {
		dirty = true;
		dirtyReasons.push(reason);
	};

	const uploadWithRetries = async (body: string, reasons: string) => {
		for (let attempt = 1; attempt <= progressUploadAttempts; attempt++) {
			const start = Date.now();
			try {
				await providerSpecifics.writeFile({
					body,
					bucketName,
					customCredentials: null,
					downloadBehavior: null,
					expectedBucketOwner,
					key: overallProgressKey(renderId),
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
				return;
			} catch (err) {
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

	return {
		upload,
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

			framesRendered[index] = rendered;
			framesEncoded[index] = encoded;

			const totalFramesEncoded = framesEncoded.reduce((a, b) => a + b, 0);
			const totalFramesRendered = framesRendered.reduce((a, b) => a + b, 0);
			if (renderProgress.framesEncoded === 0 && totalFramesEncoded > 0) {
				encodeStartTime = Date.now();
			}

			if (renderProgress.framesRendered === 0 && totalFramesRendered > 0) {
				renderFramesStartTime = Date.now();
			}

			if (renderProgress.timeToRenderFrames === null) {
				const frameCount =
					renderProgress.renderMetadata &&
					renderProgress.renderMetadata.type === 'video'
						? RenderInternals.getFramesToRender(
								renderProgress.renderMetadata.frameRange,
								renderProgress.renderMetadata.everyNthFrame,
							).length
						: null;
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
		addChunkCompleted: (chunkIndex, start, rendered) => {
			renderProgress.chunks.push(chunkIndex);
			if (
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
			renderProgress.combinedFrames = frames;
			upload(`setCombinedFrames(${frames})`);
		},
		setTimeToCombine: (timeToCombine: number) => {
			renderProgress.timeToCombine = timeToCombine;
			upload(`setTimeToCombine(${timeToCombine})`);
		},
		setLambdaInvoked(chunk) {
			if (lambdasInvoked.length === 0) {
				throw new Error('Expected chunks to be set before lambdas are set');
			}

			lambdasInvoked[chunk] = true;
			renderProgress.lambdasInvoked = lambdasInvoked.reduce(
				(a, b) => a + Number(b),
				0,
			);
			upload(`setLambdaInvoked(chunk=${chunk})`);
		},
		async setPostRenderData(postRenderData) {
			renderProgress.postRenderData = postRenderData;
			await upload('setPostRenderData');
		},
		setRenderMetadata: (renderMetadata) => {
			renderProgress.renderMetadata = renderMetadata;
			upload('setRenderMetadata');
		},
		addErrorWithoutUpload: (errorInfo) => {
			renderProgress.errors.push(errorInfo);
			if (errorInfo.isFatal && renderProgress.fatalErrorTimestamp === null) {
				renderProgress.fatalErrorTimestamp = Date.now();
			}
		},
		setExpectedChunks: (expectedChunks) => {
			framesRendered = new Array(expectedChunks).fill(0);
			framesEncoded = new Array(expectedChunks).fill(0);
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
