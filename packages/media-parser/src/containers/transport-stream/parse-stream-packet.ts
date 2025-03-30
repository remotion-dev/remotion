import {combineUint8Arrays} from '../../combine-uint8-arrays';
import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {LogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {getRestOfPacket} from './discard-rest-of-packet';
import type {TransportStreamEntry} from './parse-pmt';
import {processAudio} from './process-audio';
import {parseAvcStream} from './process-video';

export const parseStream = async ({
	transportStreamEntry,
	programId,
	structure,
	iterator,
	transportStream,
	callbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	workOnSeekRequestOptions,
}: {
	transportStreamEntry: TransportStreamEntry;
	programId: number;
	structure: TransportStreamStructure;
	iterator: BufferIterator;
	transportStream: TransportStreamState;
	callbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
}): Promise<void> => {
	let restOfPacket = getRestOfPacket(iterator);
	const offset = iterator.counter.getOffset();

	if (transportStreamEntry.streamType === 27) {
		const {streamBuffers, nextPesHeaderStore: nextPesHeader} = transportStream;

		while (true) {
			if (!streamBuffers.has(transportStreamEntry.pid)) {
				streamBuffers.set(programId, {
					pesHeader: nextPesHeader.getNextPesHeader(),
					buffer: new Uint8Array([]),
					offset,
				});
			}

			const streamBuffer = streamBuffers.get(transportStreamEntry.pid)!;
			streamBuffer.buffer = combineUint8Arrays([
				streamBuffer.buffer,
				restOfPacket,
			]);

			const rest = await parseAvcStream({
				programId,
				structure,
				streamBuffer: streamBuffers.get(transportStreamEntry.pid)!,
				workOnSeekRequestOptions,
				sampleCallbacks: callbacks,
				logLevel,
				onAudioTrack,
				onVideoTrack,
				transportStream,
			});
			if (rest === null) {
				break;
			}

			streamBuffers.delete(transportStreamEntry.pid);
			if (rest.length === 0) {
				break;
			}

			restOfPacket = rest;
		}

		return;
	}

	if (transportStreamEntry.streamType === 15) {
		const {streamBuffers, nextPesHeaderStore: nextPesHeader} = transportStream;
		const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
		if (!streamBuffer) {
			streamBuffers.set(transportStreamEntry.pid, {
				buffer: restOfPacket,
				pesHeader: nextPesHeader.getNextPesHeader(),
				offset,
			});
		} else {
			streamBuffer.buffer = combineUint8Arrays([
				streamBuffer.buffer,
				restOfPacket,
			]);
		}

		while (true) {
			const {done} = await processAudio({
				transportStreamEntry,
				structure,
				offset,
				workOnSeekRequestOptions,
				sampleCallbacks: callbacks,
				logLevel,
				onAudioTrack,
				onVideoTrack,
				transportStream,
			});
			if (done) {
				break;
			}
		}

		return;
	}

	throw new Error(`Unsupported stream type ${transportStreamEntry.streamType}`);
};
