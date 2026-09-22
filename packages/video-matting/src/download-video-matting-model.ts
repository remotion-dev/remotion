import {
	getHostedVideoMattingModelId,
	getVideoMattingModelInfo,
	type VideoMattingModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type VideoMattingModelDownloadProgress = {
	file: string | null;
	progress: number;
	loadedBytes: number;
	totalBytes: number;
};

export type DownloadVideoMattingModelOptions = {
	model: VideoMattingModel;
	onProgress?: (progress: VideoMattingModelDownloadProgress) => void;
};

export type DownloadVideoMattingModelResult = {
	alreadyDownloaded: boolean;
};

export const downloadVideoMattingModel = ({
	model,
	onProgress,
}: DownloadVideoMattingModelOptions): Promise<DownloadVideoMattingModelResult> => {
	const modelInfo = getVideoMattingModelInfo(model);
	const totalBytes = modelInfo.webGpuDownloadSize;
	const hostedModelId = getHostedVideoMattingModelId(model);
	return withRemotionModelHost(async ({env, ModelRegistry}) => {
		const cache = env.useCustomCache
			? env.customCache
			: env.useBrowserCache && typeof caches !== 'undefined'
				? await caches.open(env.cacheKey)
				: null;
		if (cache === null) {
			throw new Error(
				'A Transformers.js browser or custom cache is required to download a video matting model.',
			);
		}

		const registryOptions = {
			device: 'webgpu' as const,
			dtype: modelInfo.dtype,
		};
		const cacheStatus = await ModelRegistry.is_pipeline_cached_files(
			'background-removal',
			hostedModelId,
			registryOptions,
		);
		if (cacheStatus.allCached) {
			onProgress?.({
				file: null,
				progress: 1,
				loadedBytes: totalBytes,
				totalBytes,
			});
			return {alreadyDownloaded: true};
		}

		let loadedBytes = 0;
		const emitProgress = (file: string | null) => {
			onProgress?.({
				file,
				progress: Math.min(loadedBytes / totalBytes, 0.99),
				loadedBytes,
				totalBytes,
			});
		};

		emitProgress(null);

		for (const {file, cached} of cacheStatus.files) {
			if (cached) {
				continue;
			}

			const url = `${env.remoteHost}${env.remotePathTemplate.replace('{model}', hostedModelId)}${file}`;
			// Transformers.js 4.2.0 uses the remote URL as the browser cache key.
			const response = await env.fetch(url);
			if (!response.ok || response.body === null) {
				throw new Error(`Could not download ${url}: HTTP ${response.status}.`);
			}

			const reader = response.body.getReader();
			const stream = new ReadableStream<Uint8Array>({
				async pull(controller) {
					try {
						const {done, value} = await reader.read();
						if (done) {
							controller.close();
							return;
						}

						loadedBytes += value.byteLength;
						emitProgress(file);
						controller.enqueue(value);
					} catch (error) {
						controller.error(error);
					}
				},
				cancel: () => reader.cancel(),
			});
			await cache.put(url, new Response(stream, {headers: response.headers}));
		}

		if (
			!(await ModelRegistry.is_pipeline_cached(
				'background-removal',
				hostedModelId,
				registryOptions,
			))
		) {
			throw new Error(
				`The video matting model "${model}" was not fully cached.`,
			);
		}

		onProgress?.({
			file: null,
			progress: 1,
			loadedBytes: totalBytes,
			totalBytes,
		});
		return {alreadyDownloaded: false};
	});
};
