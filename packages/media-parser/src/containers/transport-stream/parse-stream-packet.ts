import {combineUint8Arrays} from '../../combine-uint8-arrays';
import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {LogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {readAdtsHeader} from './adts-header';
import {getRestOfPacket} from './discard-rest-of-packet';
import {findNthSubarrayIndex} from './find-separator';
import type {TransportStreamEntry} from './parse-pmt';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';
import {processStreamBuffer} from './process-stream-buffers';

const parseAdtsStream = async ({
	transportStreamEntry,
	structure,
	offset,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
}: {
	transportStreamEntry: TransportStreamEntry;
	structure: TransportStreamStructure;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	sampleCallbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	transportStream: TransportStreamState;
	offset: number;
}) => {
	const {streamBuffers, nextPesHeaderStore: nextPesHeader} = transportStream;

	while (true) {
		const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
		if (!streamBuffer) {
			throw new Error('Stream buffer not found');
		}

		const expectedLength =
			readAdtsHeader(streamBuffer.buffer)?.frameLength ?? null;

		if (expectedLength === null) {
			break;
		}

		if (expectedLength > streamBuffer.buffer.length) {
			break;
		}

		await processStreamBuffer({
			streamBuffer: {
				buffer: streamBuffer.buffer.slice(0, expectedLength),
				offset,
				pesHeader: streamBuffer.pesHeader,
			},
			programId: transportStreamEntry.pid,
			structure,
			workOnSeekRequestOptions,
			sampleCallbacks,
			logLevel,
			onAudioTrack,
			onVideoTrack,
		});

		const rest = streamBuffer.buffer.slice(expectedLength);
		streamBuffers.set(transportStreamEntry.pid, {
			buffer: rest,
			pesHeader: nextPesHeader.getNextPesHeader(),
			offset,
		});
	}
};

const parseAvcStream = async ({
	programId,
	structure,
	streamBuffer,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
}: {
	programId: number;
	structure: TransportStreamStructure;
	streamBuffer: TransportStreamPacketBuffer;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	sampleCallbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
}): Promise<Uint8Array | null> => {
	const indexOfSeparator = findNthSubarrayIndex(
		streamBuffer.buffer,
		new Uint8Array([0, 0, 1, 9]),
		2,
	);
	if (indexOfSeparator === -1 || indexOfSeparator === 0) {
		return null;
	}

	const packet = streamBuffer.buffer.slice(0, indexOfSeparator);
	const rest = streamBuffer.buffer.slice(indexOfSeparator);

	await processStreamBuffer({
		streamBuffer: {
			offset: streamBuffer.offset,
			pesHeader: streamBuffer.pesHeader,
			// Replace the regular 0x00000001 with 0x00000002 to avoid confusion with other 0x00000001 (?)
			buffer: packet,
		},
		programId,
		structure,
		workOnSeekRequestOptions,
		sampleCallbacks,
		logLevel,
		onAudioTrack,
		onVideoTrack,
	});
	return rest;
};

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
			});

			if (rest !== null) {
				streamBuffers.delete(transportStreamEntry.pid);
				if (rest.length === 0) {
					break;
				}

				restOfPacket = rest;
			} else {
				break;
			}
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

		return parseAdtsStream({
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
	}

	throw new Error(`Unsupported stream type ${transportStreamEntry.streamType}`);
};
