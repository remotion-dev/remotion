import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {pLimit} from './p-limit';

const durationOfAssetCache: Record<string, number> = {};

type Options = {
	ffprobeExecutable: FfmpegExecutable;
	src: string;
};

const limit = pLimit(1);

const getDurationOfAssetUnlimited = async ({
	ffprobeExecutable,
	src,
}: Options): Promise<number> => {
	if (durationOfAssetCache[src]) {
		return durationOfAssetCache[src];
	}

	const durationCmd = await execa(ffprobeExecutable ?? 'ffprobe', [
		'-v',
		'error',
		'-select_streams',
		'v:0',
		'-show_entries',
		'stream=duration',
		'-of',
		'default=noprint_wrappers=1:nokey=1',
		src,
	]);

	const duration = parseFloat(durationCmd.stdout);

	if (Number.isNaN(duration)) {
		throw new TypeError(
			`Could not get duration of ${src}: ${durationCmd.stdout}`
		);
	}

	durationOfAssetCache[src] = duration;

	return duration;
};

export const getDurationOfAsset = (options: Options) => {
	return limit(getDurationOfAssetUnlimited, options);
};
