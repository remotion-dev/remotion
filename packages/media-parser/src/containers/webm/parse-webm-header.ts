import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectSegment} from './segments';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async (state: ParserState): Promise<ParseResult> => {
	const structure = state.getMatroskaStructure();

	const {iterator} = state;

	const isInsideSegment = state.webm.isInsideSegment(iterator);
	const isInsideCluster = state.webm.isInsideCluster(iterator);

	const results = await expectSegment({
		state,
		isInsideSegment,
	});
	if (results === null) {
		return null;
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

	return null;
};
