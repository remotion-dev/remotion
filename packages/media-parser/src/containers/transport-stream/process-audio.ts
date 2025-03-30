import type {LogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {OnAudioTrack, OnVideoTrack} from '../../webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {readAdtsHeader} from './adts-header';
import type {TransportStreamEntry} from './parse-pmt';
import {processStreamBuffer} from './process-stream-buffers';

export const processAudio = async ({
	transportStreamEntry,
	structure,
	offset,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
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
	makeSamplesStartAtZero: boolean;
}): Promise<{done: boolean}> => {
	const {streamBuffers, nextPesHeaderStore: nextPesHeader} = transportStream;
	const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
	if (!streamBuffer) {
		throw new Error('Stream buffer not found');
	}

	const expectedLength =
		readAdtsHeader(streamBuffer.buffer)?.frameLength ?? null;

	if (expectedLength === null) {
		return {done: true};
	}

	if (expectedLength > streamBuffer.buffer.length) {
		return {done: true};
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
		transportStream,
		makeSamplesStartAtZero,
	});

	const rest = streamBuffer.buffer.slice(expectedLength);
	streamBuffers.set(transportStreamEntry.pid, {
		buffer: rest,
		pesHeader: nextPesHeader.getNextPesHeader(),
		offset,
	});

	return {done: false};
};
