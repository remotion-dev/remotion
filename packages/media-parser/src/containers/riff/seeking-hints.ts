import type {ParserState} from '../../state/parser-state';
import type {RiffState} from '../../state/riff';
import type {StructureState} from '../../state/structure';
import type {MediaSectionState} from '../../state/video-section';
import type {Idx1Entry, ListBox} from './riff-box';
import {getStrhBox, getStrlBoxes} from './traversal';

export type RiffSeekingHints = {
	type: 'riff-seeking-hints';
	hasIndex: boolean;
	idx1Entries: Idx1Entry[] | null;
	samplesPerSecond: number | null;
	moviOffset: number | null;
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
		hasIndex:
			(
				structure.boxes.find(
					(b) => b.type === 'list-box' && b.listType === 'hdrl',
				) as ListBox | undefined
			)?.children.find((box) => box.type === 'avih-box')?.hasIndex ?? false,
		idx1Entries: riffState.lazyIdx1.getIfAlreadyLoaded(),
		samplesPerSecond,
		moviOffset: mediaSectionState.getMediaSections()[0]?.start ?? null,
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
};
