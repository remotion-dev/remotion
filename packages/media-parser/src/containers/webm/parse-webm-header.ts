import type {ParseResult} from '../../parse-result';
import {makeSkip} from '../../skip';
import {maySkipVideoData} from '../../state/may-skip-video-data';
import type {ParserState} from '../../state/parser-state';
import {getByteForSeek} from './get-byte-for-cues';
import {expectSegment} from './segments';
import {selectStatesForProcessing} from './state-for-processing';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = async (state: ParserState): Promise<ParseResult> => {
	const structure = state.structure.getMatroskaStructure();

	const {iterator} = state;
	const offset = iterator.counter.getOffset();

	const isInsideSegment = state.webm.isInsideSegment(iterator);
	const isInsideCluster = state.webm.isInsideCluster(offset);

	const results = await expectSegment({
		iterator,
		logLevel: state.logLevel,
		statesForProcessing: selectStatesForProcessing(state),
		isInsideSegment,
		mediaSectionState: state.mediaSection,
	});
	if (results?.type === 'SeekHead') {
		const position = getByteForSeek({seekHeadSegment: results, offset});
		if (position !== null) {
			state.webm.cues.triggerLoad(position, offset);
		}
	}

	if (results === null) {
		return null;
	}

	if (isInsideCluster) {
		if (maySkipVideoData({state})) {
			return makeSkip(
				Math.min(
					state.contentLength,
					isInsideCluster.size + isInsideCluster.start,
				),
			);
		}

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
