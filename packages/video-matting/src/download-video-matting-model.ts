import type * as NodeCrypto from 'node:crypto';
import type * as NodeFsPromises from 'node:fs/promises';
import type * as NodePath from 'node:path';
import {importNodeModule} from './import-node-module';
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
		const useFileCache = cache === null && env.useFSCache;
		if (cache === null && !useFileCache) {
			throw new Error(
				'A Transformers.js model cache is required to download a video matting model.',
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
			// Transformers.js 4.2.0 keys browser caches by URL and its FileCache by model/file.
			const cacheKey = cache === null ? `${hostedModelId}/${file}` : url;
			const response = await env.fetch(url);
			if (!response.ok || response.body === null) {
				throw new Error(`Could not download ${url}: HTTP ${response.status}.`);
			}

			const reader = response.body.getReader();
			if (cache !== null) {
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
				await cache.put(
					cacheKey,
					new Response(stream, {headers: response.headers}),
				);
			} else {
				// Match Transformers.js FileCache's model/file layout without loading ONNX.
				const [{mkdir, open, rename, unlink}, {join, dirname}, {randomUUID}] =
					await Promise.all([
						importNodeModule<typeof NodeFsPromises>('node:fs/promises'),
						importNodeModule<typeof NodePath>('node:path'),
						importNodeModule<typeof NodeCrypto>('node:crypto'),
					]);
				if (env.cacheDir === null) {
					throw new Error('Transformers.js env.cacheDir must be set.');
				}

				const destination = join(env.cacheDir, cacheKey);
				const temporary = `${destination}.tmp.${randomUUID()}`;
				await mkdir(dirname(destination), {recursive: true});
				const handle = await open(temporary, 'wx');
				try {
					while (true) {
						const {done, value} = await reader.read();
						if (done) {
							break;
						}

						await handle.writeFile(value);
						loadedBytes += value.byteLength;
						emitProgress(file);
					}

					await handle.close();
					await rename(temporary, destination);
				} catch (error) {
					await Promise.allSettled([handle.close(), reader.cancel(error)]);
					await unlink(temporary).catch(() => undefined);
					throw error;
				} finally {
					reader.releaseLock();
				}
			}
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
