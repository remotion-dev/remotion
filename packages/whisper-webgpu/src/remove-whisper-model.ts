import type * as NodeFsPromises from 'node:fs/promises';
import type * as NodePath from 'node:path';
import {importNodeModule} from './import-node-module';
import {disposeWhisperModel} from './load-whisper-model';
import {
	getHostedModelId,
	getWhisperWebGpuDtype,
	type WhisperWebGpuModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type RemoveWhisperModelOptions = {
	model: WhisperWebGpuModel;
};

export const removeWhisperModel = async ({
	model,
}: RemoveWhisperModelOptions): Promise<void> => {
	await disposeWhisperModel({model});
	await withRemotionModelHost(async ({env, ModelRegistry}) => {
		const modelId = getHostedModelId(model);
		const {cacheDir} = env;
		if (
			env.useFSCache &&
			cacheDir &&
			!env.useCustomCache &&
			!(env.useBrowserCache && typeof caches !== 'undefined')
		) {
			const [{rm}, {join}] = await Promise.all([
				importNodeModule<typeof NodeFsPromises>('node:fs/promises'),
				importNodeModule<typeof NodePath>('node:path'),
			]);
			await rm(join(cacheDir, modelId), {recursive: true, force: true});
			return;
		}

		await ModelRegistry.clear_pipeline_cache(
			'automatic-speech-recognition',
			modelId,
			{
				device: 'webgpu',
				dtype: getWhisperWebGpuDtype(model),
			},
		);
	});
};
