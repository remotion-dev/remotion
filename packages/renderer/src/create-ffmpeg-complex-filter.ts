import type {DownloadMap} from './assets/download-map';
import {createFfmpegMergeFilter} from './create-ffmpeg-merge-filter';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {makeFfmpegFilterFileStr} from './ffmpeg-filter-file';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';

export const createFfmpegComplexFilter = async ({
	filters,
	downloadMap,
	ffmpegExecutable,
	remotionRoot,
}: {
	filters: PreprocessedAudioTrack[];
	downloadMap: DownloadMap;
	ffmpegExecutable: FfmpegExecutable;
	remotionRoot: string;
}): Promise<{
	complexFilterFlag: [string, string] | null;
	cleanup: () => void;
}> => {
	if (filters.length === 0) {
		return {complexFilterFlag: null, cleanup: () => undefined};
	}

	const complexFilter = await createFfmpegMergeFilter({
		inputs: filters,
		ffmpegExecutable,
		remotionRoot,
	});

	const {file, cleanup} = await makeFfmpegFilterFileStr(
		complexFilter,
		downloadMap
	);

	return {
		complexFilterFlag: ['-filter_complex_script', file],
		cleanup,
	};
};
