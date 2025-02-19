import type {DownloadMap} from './assets/download-map';
import {createFfmpegMergeFilter} from './create-ffmpeg-merge-filter';
import {makeFfmpegFilterFileStr} from './ffmpeg-filter-file';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';

export const createFfmpegComplexFilter = async ({
	filters,
	downloadMap,
}: {
	filters: PreprocessedAudioTrack[];
	downloadMap: DownloadMap;
}): Promise<{
	complexFilterFlag: [string, string] | null;
	cleanup: () => void;
	complexFilter: string | null;
}> => {
	if (filters.length === 0) {
		return {
			complexFilterFlag: null,
			cleanup: () => undefined,
			complexFilter: null,
		};
	}

	const complexFilter = createFfmpegMergeFilter({
		inputs: filters,
	});

	const {file, cleanup} = await makeFfmpegFilterFileStr(
		complexFilter,
		downloadMap,
	);

	return {
		complexFilterFlag: ['-filter_complex_script', file],
		cleanup,
		complexFilter,
	};
};
