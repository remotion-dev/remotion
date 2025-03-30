import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {getWorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {parsePacket} from './parse-packet';
import {processSampleIfPossible} from './process-sample-if-possible';
import {processFinalStreamBuffers} from './process-stream-buffers';

export const parseTransportStream = async (
	state: ParserState,
): Promise<ParseResult> => {
	const structure = state.structure.getTsStructure();

	const processed = await processSampleIfPossible(state);
	if (processed) {
		return Promise.resolve(null);
	}

	const {iterator} = state;

	if (iterator.bytesRemaining() < 188) {
		return Promise.resolve(null);
	}

	const packet = parsePacket({
		iterator,
		structure,
		transportStream: state.transportStream,
	});

	if (packet) {
		structure.boxes.push(packet);
	}

	if (iterator.bytesRemaining() === 0) {
		await processFinalStreamBuffers({
			transportStream: state.transportStream,
			structure,
			workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
			sampleCallbacks: state.callbacks,
			logLevel: state.logLevel,
			onAudioTrack: state.onAudioTrack,
			onVideoTrack: state.onVideoTrack,
			makeSamplesStartAtZero: state.makeSamplesStartAtZero,
		});
	}

	return Promise.resolve(null);
};
