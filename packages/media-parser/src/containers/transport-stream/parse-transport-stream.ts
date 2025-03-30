import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {getWorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {parsePacket} from './parse-packet';
import {processFinalStreamBuffers} from './process-stream-buffers';

export const parseTransportStream = async (
	state: ParserState,
): Promise<ParseResult> => {
	const structure = state.structure.getTsStructure();

	const {iterator} = state;

	if (iterator.bytesRemaining() < 188) {
		return Promise.resolve(null);
	}

	const packet = await parsePacket({
		iterator,
		structure,
		transportStream: state.transportStream,
		callbacks: state.callbacks,
		logLevel: state.logLevel,
		onAudioTrack: state.onAudioTrack,
		onVideoTrack: state.onVideoTrack,
		workOnSeekRequestOptions: getWorkOnSeekRequestOptions(state),
		makeSamplesStartAtZero: state.makeSamplesStartAtZero,
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
