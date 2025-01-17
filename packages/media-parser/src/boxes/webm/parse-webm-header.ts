import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectSegment} from './segments';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<ParseResult> => {
	const structure = state.structure.getStructure();
	if (structure.type !== 'matroska') {
		throw new Error('Invalid structure type');
	}

	const isInsideSegment = state.webm.isInsideSegment(iterator);
	const isInsideCluster = state.webm.isInsideCluster(iterator);

	const results = await expectSegment({
		iterator,
		state,
		isInsideSegment,
	});
	if (results === null) {
		return {
			skipTo: null,
		};
	}

	if (isInsideCluster) {
		const segments = structure.boxes.filter((box) => box.type === 'Segment');
		const segment = segments[isInsideCluster.segment];
		if (!segment) {
			throw new Error('Expected segment');
		}

		const clusters = segment.value.find((box) => box.type === 'Cluster');
		if (!clusters) {
			throw new Error('Expected cluster');
		}

		// let's not add it to the cluster
		if (results.type !== 'Block' && results.type !== 'SimpleBlock') {
			clusters.value.push(results);
		}
	} else if (isInsideSegment) {
		const segments = structure.boxes.filter((box) => box.type === 'Segment');
		const segment = segments[isInsideSegment.index];
		if (!segment) {
			throw new Error('Expected segment');
		}

		segment.value.push(results);
	} else {
		structure.boxes.push(results);
	}

	return {
		skipTo: null,
	};
};
