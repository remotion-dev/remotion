import type {ParserState} from '../../state/parser-state';
import type {RiffState} from '../../state/riff';
import type {RiffKeyframe} from '../../state/riff/riff-keyframes';
import type {StructureState} from '../../state/structure';
import type {MediaSectionState} from '../../state/video-section';
import {riffHasIndex} from './has-index';
import type {FetchIdx1Result} from './seek/fetch-idx1';
import {getStrhBox, getStrlBoxes} from './traversal';

export type RiffSeekingHints = {
	type: 'riff-seeking-hints';
	hasIndex: boolean;
	idx1Entries: FetchIdx1Result | null;
	samplesPerSecond: number | null;
	moviOffset: number | null;
	observedKeyframes: RiffKeyframe[];
};

export const getSeekingHintsForRiff = ({
	structureState,
	riffState,
	mediaSectionState,
}: {
	structureState: StructureState;
	riffState: RiffState;
	mediaSectionState: MediaSectionState;
}): RiffSeekingHints => {
	const structure = structureState.getRiffStructure();
	const strl = getStrlBoxes(structure);

	let samplesPerSecond: number | null = null;

	for (const s of strl) {
		const strh = getStrhBox(s.children);
		if (!strh) {
			throw new Error('No strh box');
		}

		if (strh.strf.type !== 'strf-box-video') {
			continue;
		}

		samplesPerSecond = strh.rate / strh.scale;

		break;
	}

	return {
		type: 'riff-seeking-hints',
		hasIndex: riffHasIndex(structure),
		idx1Entries: riffState.lazyIdx1.getIfAlreadyLoaded(),
		samplesPerSecond,
		moviOffset: mediaSectionState.getMediaSections()[0]?.start ?? null,
		observedKeyframes: riffState.sampleCounter.riffKeys.getKeyframes(),
	};
};

export const setSeekingHintsForRiff = ({
	hints,
	state,
}: {
	hints: RiffSeekingHints;
	state: ParserState;
}) => {
	state.riff.lazyIdx1.setFromSeekingHints(hints);
	state.riff.sampleCounter.riffKeys.setFromSeekingHints(
		hints.observedKeyframes,
	);
};
