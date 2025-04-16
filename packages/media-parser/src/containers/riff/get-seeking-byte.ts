import type {RiffState} from '../../state/riff';
import type {SeekResolution} from '../../work-on-seek-request';
import type {Idx1Entry} from './riff-box';
import type {RiffSeekingHints} from './seeking-hints';

export const getSeekingByteForRiff = async ({
	info,
	time,
	riffState,
}: {
	info: RiffSeekingHints;
	time: number;
	riffState: RiffState;
}): Promise<SeekResolution> => {
	const idx1Entries = await (info.hasIndex
		? riffState.lazyIdx1.waitForLoaded()
		: Promise.resolve(null));

	if (idx1Entries === null) {
		// TODO
		return {
			type: 'valid-but-must-wait',
		};
	}

	if (info.samplesPerSecond === null) {
		throw new Error('samplesPerSecond is null');
	}

	const index = Math.floor(time * info.samplesPerSecond);

	let bestEntry: Idx1Entry | null = null;

	for (const entry of idx1Entries) {
		if (entry.index > index) {
			continue;
		}

		if (bestEntry && entry.index < bestEntry.index) {
			continue;
		}

		bestEntry = entry;
	}

	if (!bestEntry) {
		throw new Error('No best entry');
	}

	return {
		type: 'do-seek',
		byte: bestEntry.offset,
	};
};
