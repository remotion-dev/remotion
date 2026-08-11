import type {ParserState} from '../../state/parser-state';
import {canProcessAudio, processAudio} from './process-audio';
import {makeTransportStreamPacketBuffer} from './process-stream-buffers';
import {canProcessVideo, processVideo} from './process-video';
import {findProgramMapOrNull} from './traversal';

export const processSampleIfPossible = async (state: ParserState) => {
	const programMap = findProgramMapOrNull(state.structure.getTsStructure());
	if (!programMap) {
		return;
	}

	let processed = false;

	for (const stream of programMap.streams) {
		const streamBuffer = state.transportStream.streamBuffers.get(stream.pid);
		if (!streamBuffer) {
			continue;
		}

		if (stream.streamType === 27) {
			if (canProcessVideo({streamBuffer})) {
				const rest = await processVideo({
					programId: stream.pid,
					structure: state.structure.getTsStructure(),
					streamBuffer,
					sampleCallbacks: state.callbacks,
					logLevel: state.logLevel,
					onAudioTrack: state.onAudioTrack,
					onVideoTrack: state.onVideoTrack,
					transportStream: state.transportStream,
					makeSamplesStartAtZero: state.makeSamplesStartAtZero,
					avcState: state.avc,
				});
				state.transportStream.streamBuffers.delete(stream.pid);

				state.transportStream.streamBuffers.set(
					stream.pid,
					makeTransportStreamPacketBuffer({
						pesHeader:
							state.transportStream.nextPesHeaderStore.getNextPesHeader(),
						buffers: rest,
						offset: state.iterator.counter.getOffset(),
					}),
				);
				processed = true;
				break;
			}
		}

		if (stream.streamType === 15) {
			if (canProcessAudio({streamBuffer})) {
				await processAudio({
					structure: state.structure.getTsStructure(),
					offset: state.iterator.counter.getOffset(),
					sampleCallbacks: state.callbacks,
					logLevel: state.logLevel,
					onAudioTrack: state.onAudioTrack,
					onVideoTrack: state.onVideoTrack,
					transportStream: state.transportStream,
					makeSamplesStartAtZero: state.makeSamplesStartAtZero,
					transportStreamEntry: stream,
					avcState: state.avc,
				});
				processed = true;
				break;
			}
		}
	}

	return processed;
};
