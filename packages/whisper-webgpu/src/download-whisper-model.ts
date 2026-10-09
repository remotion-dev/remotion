import type * as NodeCrypto from 'node:crypto';
import type * as NodeFsPromises from 'node:fs/promises';
import type * as NodePath from 'node:path';
import {importNodeModule} from './import-node-module';
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
	signal?: AbortSignal;
};

export type DownloadWhisperModelResult = {
	alreadyDownloaded: boolean;
};

export const downloadWhisperModel = async ({
	model,
	onProgress,
	signal,
}: DownloadWhisperModelOptions): Promise<DownloadWhisperModelResult> => {
	signal?.throwIfAborted();
	const totalBytes = getModelInfo(model).webGpuDownloadSize;
	const hostedModelId = getHostedModelId(model);
	const result = await withRemotionModelHost(async ({env, ModelRegistry}) => {
		signal?.throwIfAborted();
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
		signal?.throwIfAborted();
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
			signal?.throwIfAborted();
			if (cached) {
				continue;
			}

			const url = `${env.remoteHost}${env.remotePathTemplate.replace('{model}', hostedModelId)}${file}`;
			// Transformers.js 4.2.0 keys browser caches by URL and its FileCache by model/file.
			const cacheKey = cache === null ? `${hostedModelId}/${file}` : url;
			const response = await env.fetch(url, {signal});
			if (!response.ok || response.body === null) {
				throw new Error(`Could not download ${url}: HTTP ${response.status}.`);
			}

			const reader = response.body.getReader();
			try {
				if (cache !== null) {
					const stream = new ReadableStream<Uint8Array>({
						async pull(controller) {
							try {
								signal?.throwIfAborted();
								const {done, value} = await reader.read();
								signal?.throwIfAborted();
								if (done) {
									controller.close();
									return;
								}

								loadedBytes += value.byteLength;
								emitProgress(file);
								signal?.throwIfAborted();
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
							signal?.throwIfAborted();
							const {done, value} = await reader.read();
							signal?.throwIfAborted();
							if (done) {
								break;
							}

							await handle.writeFile(value);
							loadedBytes += value.byteLength;
							emitProgress(file);
						}

						await handle.close();
						signal?.throwIfAborted();
						await rename(temporary, destination);
					} catch (error) {
						await handle.close();
						await unlink(temporary);
						throw error;
					}
				}
			} finally {
				await reader.cancel().catch(() => {});
				reader.releaseLock();
			}
		}

		signal?.throwIfAborted();
		if (
			!(await ModelRegistry.is_pipeline_cached(
				'automatic-speech-recognition',
				hostedModelId,
				registryOptions,
			))
		) {
			throw new Error(`The Whisper model "${model}" was not fully cached.`);
		}

		signal?.throwIfAborted();
		onProgress?.({
			file: null,
			progress: 1,
			loadedBytes: totalBytes,
			totalBytes,
		});
		return {alreadyDownloaded: false};
	}).catch((error) => {
		signal?.throwIfAborted();
		throw error;
	});
	signal?.throwIfAborted();
	return result;
};
