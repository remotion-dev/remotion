import type {BufferIterator} from '../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../options';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {expectSegment} from './segments';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async ({
	iterator,
	state,
	fields,
}: {
	iterator: BufferIterator;
	state: ParserState;
	fields: Options<ParseMediaFields>;
}): Promise<ParseResult> => {
	const structure = state.structure.getStructure();
	if (structure.type !== 'matroska') {
		throw new Error('Invalid structure type');
	}

	const continueParsing = () => {
		return parseWebm({
			iterator,
			fields,
			state,
		});
	};

	const isInsideSegment = state.webm.isInsideSegment(iterator);
	const isInsideCluster = state.webm.isInsideCluster(iterator);

	const results = await expectSegment({
		iterator,
		state,
		isInsideSegment,
	});
	if (results === null) {
		return {
			status: 'incomplete',
			continueParsing,
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
		status: 'incomplete',
		continueParsing,
		skipTo: null,
	};
};
