import {combineUint8Arrays} from '../../combine-uint8-arrays';
import type {MediaParserLogLevel} from '../../log';
import type {TransportStreamStructure} from '../../parse-result';
import type {AvcState} from '../../state/avc/avc-state';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../../webcodec-sample-types';
import type {FindNthSubarrayIndexNotFound} from './find-separator';
import {findNthSubarrayIndex} from './find-separator';
import {filterStreamsBySupportedTypes} from './get-tracks';
import {handleAacPacket} from './handle-aac-packet';
import {handleAvcPacket} from './handle-avc-packet';
import type {PacketPes} from './parse-pes';
import {findProgramMapTableOrThrow, getStreamForId} from './traversal';

export type TransportStreamPacketBuffer = {
	pesHeader: PacketPes;
	offset: number;
	getBuffer: () => Uint8Array;
	addBuffer: (buffer: Uint8Array) => void;
	get2ndSubArrayIndex: () => number;
};

export const makeTransportStreamPacketBuffer = ({
	buffers,
	pesHeader,
	offset,
}: {
	buffers: Uint8Array | null;
	pesHeader: PacketPes;
	offset: number;
}): TransportStreamPacketBuffer => {
	let currentBuf = buffers ? [buffers] : [];
	let subarrayIndex: number | null = null;

	const getBuffer = () => {
		if (currentBuf.length === 0) {
			return new Uint8Array();
		}

		if (currentBuf.length === 1) {
			return currentBuf[0];
		}

		currentBuf = [combineUint8Arrays(currentBuf)];
		return currentBuf[0];
	};

	let fastFind: FindNthSubarrayIndexNotFound | null = null;

	return {
		pesHeader,
		offset,
		getBuffer,
		addBuffer: (buffer: Uint8Array) => {
			currentBuf.push(buffer);
			subarrayIndex = null;
		},
		get2ndSubArrayIndex: () => {
			if (subarrayIndex === null) {
				const result = findNthSubarrayIndex({
					array: getBuffer(),
					subarray: new Uint8Array([0, 0, 1, 9]),
					n: 2,
					startIndex: fastFind?.index ?? 0,
					startCount: fastFind?.count ?? 0,
				});
				if (result.type === 'found') {
					subarrayIndex = result.index;
					fastFind = null;
				} else {
					fastFind = result;
					return -1;
				}
			}

			return subarrayIndex;
		},
	};
};

export type StreamBufferMap = Map<number, TransportStreamPacketBuffer>;

export const processStreamBuffer = async ({
	streamBuffer,
	programId,
	structure,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
	avcState,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	programId: number;
	structure: TransportStreamStructure;
	sampleCallbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	onVideoTrack: MediaParserOnVideoTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
	avcState: AvcState;
}) => {
	const stream = getStreamForId(structure, programId);
	if (!stream) {
		throw new Error('No stream found');
	}

	// 2 = ITU-T Rec. H.262 | ISO/IEC 13818-2 Video or ISO/IEC 11172-2 constrained parameter video stream
	if (stream.streamType === 2) {
		throw new Error('H.262 video stream not supported');
	}

	// 27 = AVC / H.264 Video
	if (stream.streamType === 27) {
		await handleAvcPacket({
			programId,
			streamBuffer,
			sampleCallbacks,
			logLevel,
			onVideoTrack,
			offset: streamBuffer.offset,
			transportStream,
			makeSamplesStartAtZero,
			avcState,
		});
	}
	// 15 = AAC / ADTS
	else if (stream.streamType === 15) {
		await handleAacPacket({
			streamBuffer,
			programId,
			offset: streamBuffer.offset,
			sampleCallbacks,
			logLevel,
			onAudioTrack,
			transportStream,
			makeSamplesStartAtZero,
		});
	}

	if (!sampleCallbacks.tracks.hasAllTracks()) {
		const tracksRegistered = sampleCallbacks.tracks.getTracks().length;
		const {streams} = findProgramMapTableOrThrow(structure);
		if (filterStreamsBySupportedTypes(streams).length === tracksRegistered) {
			sampleCallbacks.tracks.setIsDone(logLevel);
		}
	}
};

export const processFinalStreamBuffers = async ({
	structure,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
	avcState,
}: {
	structure: TransportStreamStructure;
	sampleCallbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	onVideoTrack: MediaParserOnVideoTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
	avcState: AvcState;
}) => {
	for (const [programId, buffer] of transportStream.streamBuffers) {
		if (buffer.getBuffer().byteLength > 0) {
			await processStreamBuffer({
				streamBuffer: buffer,
				programId,
				structure,
				sampleCallbacks,
				logLevel,
				onAudioTrack,
				onVideoTrack,
				transportStream,
				makeSamplesStartAtZero,
				avcState,
			});
			transportStream.streamBuffers.delete(programId);
		}
	}
};
