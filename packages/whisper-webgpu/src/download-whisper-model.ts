import {
	getHostedModelId,
	getModelInfo,
	getWhisperWebGpuDtype,
	type WhisperWebGpuModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type WhisperModelDownloadProgress = {
	file: string | null;
	progress: number;
	loadedBytes: number;
	totalBytes: number;
};

export type DownloadWhisperModelOptions = {
	model: WhisperWebGpuModel;
	onProgress?: (progress: WhisperModelDownloadProgress) => void;
};

export type DownloadWhisperModelResult = {
	alreadyDownloaded: boolean;
};

export const downloadWhisperModel = ({
	model,
	onProgress,
}: DownloadWhisperModelOptions): Promise<DownloadWhisperModelResult> => {
	const totalBytes = getModelInfo(model).webGpuDownloadSize;
	const hostedModelId = getHostedModelId(model);
	return withRemotionModelHost(async ({env, ModelRegistry}) => {
		const cache = env.useCustomCache
			? env.customCache
			: env.useBrowserCache && typeof caches !== 'undefined'
				? await caches.open(env.cacheKey)
				: null;
		const useFileCache = cache === null && env.useFSCache;
		if (cache === null && !useFileCache) {
			throw new Error(
				'A Transformers.js model cache is required to download a Whisper model.',
			);
		}

		const registryOptions = {
			device: 'webgpu' as const,
			dtype: getWhisperWebGpuDtype(model),
		};
		const cacheStatus = await ModelRegistry.is_pipeline_cached_files(
			'automatic-speech-recognition',
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
				const fsName: string = 'node:fs/promises';
				const pathName: string = 'node:path';
				const cryptoName: string = 'node:crypto';
				const [{mkdir, open, rename, unlink}, {join, dirname}, {randomUUID}] =
					await Promise.all([
						import(/* @vite-ignore */ fsName),
						import(/* @vite-ignore */ pathName),
						import(/* @vite-ignore */ cryptoName),
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
				} catch (error) {
					await handle.close();
					await unlink(temporary);
					throw error;
				}

				await handle.close();
				await rename(temporary, destination);
			}
		}

		if (
			!(await ModelRegistry.is_pipeline_cached(
				'automatic-speech-recognition',
				hostedModelId,
				registryOptions,
			))
		) {
			throw new Error(`The Whisper model "${model}" was not fully cached.`);
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
