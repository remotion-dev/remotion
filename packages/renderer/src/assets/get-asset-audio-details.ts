import pLimit from 'p-limit';
import {getActualConcurrency} from '../get-concurrency';
import {getAudioChannels} from './get-audio-channels';
import {AssetAudioDetails} from './types';

export async function getAssetAudioDetails(options: {
	assetPaths: string[];
	parallelism?: number | null;
}): Promise<Map<string, AssetAudioDetails>> {
	const uniqueAssets = [...new Set(options.assetPaths)];
	const actualParallelism = getActualConcurrency(options.parallelism ?? null);
	const parallelLimit = pLimit(actualParallelism);
	const audioChannelTasks = uniqueAssets.map((path) =>
		parallelLimit(() => getAudioChannels(path))
	);
	const result = await Promise.all(audioChannelTasks);

	const mappedResults: [string, AssetAudioDetails][] = result.map(
		(channels, index) => {
			return [uniqueAssets[index], {channels}];
		}
	);

	return new Map<string, AssetAudioDetails>(mappedResults);
}
