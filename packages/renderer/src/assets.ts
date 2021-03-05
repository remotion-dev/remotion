import execa from 'execa';
import {TAsset} from 'remotion';
import pLimit from 'p-limit';
import { getActualConcurrency } from './get-concurrency';

type UnsafeAsset = TAsset & {
	startInVideo: number;
	duration: number | null;
};

type MediaAsset = Omit<UnsafeAsset, 'duration'> & {
	duration: number;
};

type AssetAudioDetails = {
	channels: number;
}

export type Assets = MediaAsset[];

const areEqual = (a: TAsset, b: TAsset) => {
	return a.type === b.type && a.src === b.src;
};

const findFrom = (target: TAsset[], asset: TAsset) => {
	const index = target.findIndex((a) => areEqual(a, asset));
	if (index === -1) {
		return false;
	} else {
		target.splice(index, 1);
		return true;
	}
};

export const calculateAssetsPosition = (frames: TAsset[][]): Assets => {
	const assets: UnsafeAsset[] = [];

	for (let frame = 0; frame < frames.length; frame++) {
		const prev = (frames[frame - 1] ?? []).slice();
		const current = frames[frame];
		const next = (frames[frame + 1] ?? []).slice();

		for (const asset of current) {
			if (!findFrom(prev, asset)) {
				assets.push({
					...asset,
					duration: null,
					startInVideo: frame,
				});
			}

			if (!findFrom(next, asset)) {
				const found = assets.find(
					(a) => a.duration === null && areEqual(a, asset)
				);
				if (!found) throw new Error('something wrong');
				found.duration = frame - found.startInVideo - 1;
			}
		}
	}

	for (const asset of assets) {
		if (asset.duration === null) {
			throw new Error('duration is unexpectedly null');
		}
	}
	return assets as MediaAsset[];
};

export async function getAudioChannels(path: string, cwd: string) {
	const args = [
		['-v', 'error'],
		['-show_entries', 'stream=channels'],
		['-of', 'default=nw=1'],
		[path]
	]
	.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
	.filter(Boolean) as string[];

	try {
		const task = await execa('ffprobe', args, { cwd });
		return parseInt(task.stdout.replace('channels=', ''), 10);
	} catch (ex) {
		throw ex;
	}
}

export async function getAssetAudioDetails(options: {
	assetPaths: string[], 
	cwd: string,
	parallelism?: number | null;
}): Promise<Map<string, AssetAudioDetails>> {
	const uniqueAssets = [...new Set(options.assetPaths)];
	const actualParallelism = getActualConcurrency(options.parallelism ?? null);
	const parallelLimit = pLimit(actualParallelism);
	const audioChannelTasks = uniqueAssets.map((path) => parallelLimit(() => getAudioChannels(path, options.cwd)));
	const result = await Promise.all(audioChannelTasks);
	
	const mappedResults: [string, AssetAudioDetails][] = result.map((channels, index) => {
		return [uniqueAssets[index], { channels }];
	});

	return new Map<string, AssetAudioDetails>(mappedResults);
}