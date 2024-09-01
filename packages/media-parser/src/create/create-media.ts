import {getVariableInt} from '../boxes/webm/ebml';
import {
	combineUint8Arrays,
	matroskaToHex,
	padMatroskaBytes,
} from '../boxes/webm/make-header';
import type {BytesAndOffset} from '../boxes/webm/segments/all-segments';
import {matroskaElements} from '../boxes/webm/segments/all-segments';
import type {WriterInterface} from '../writers/writer';
import {
	CLUSTER_MIN_VINT_WIDTH,
	createClusterSegment,
	makeSimpleBlock,
} from './cluster-segment';
import {makeMatroskaHeader} from './matroska-header';
import {makeMatroskaInfo} from './matroska-info';
import {createMatroskaSegment} from './matroska-segment';
import type {MakeTrackAudio, MakeTrackVideo} from './matroska-trackentry';
import {
	makeMatroskaAudioTrackEntryBytes,
	makeMatroskaTracks,
	makeMatroskaVideoTrackEntryBytes,
} from './matroska-trackentry';

export type MediaFn = {
	save: () => Promise<void>;
	addSample: (chunk: EncodedVideoChunk, trackNumber: number) => Promise<void>;
	updateDuration: (duration: number) => Promise<void>;
	addTrack: (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => Promise<{trackNumber: number}>;
};

export const createMedia = async (
	writer: WriterInterface,
): Promise<MediaFn> => {
	const header = makeMatroskaHeader();

	const w = await writer.createContent();
	await w.write(header.bytes);
	const matroskaInfo = makeMatroskaInfo({
		timescale: 1_000_000,
		duration: 2658,
	});

	const currentTracks: BytesAndOffset[] = [];

	const matroskaTracks = makeMatroskaTracks(currentTracks);
	const matroskaSegment = createMatroskaSegment([
		matroskaInfo,
		...matroskaTracks,
	]);

	const durationOffset =
		(matroskaSegment.offsets.children[0].children.find(
			(c) => c.field === 'Duration',
		)?.offset ?? 0) + w.getWrittenByteCount();
	const tracksOffset =
		(matroskaSegment.offsets.children.find((o) => o.field === 'Tracks')
			?.offset ?? 0) + w.getWrittenByteCount();

	if (!durationOffset) {
		throw new Error('could not get duration offset');
	}

	if (!tracksOffset) {
		throw new Error('could not get tracks offset');
	}

	await w.write(matroskaSegment.bytes);

	const cluster = createClusterSegment();
	const clusterVIntPosition =
		w.getWrittenByteCount() +
		cluster.offsets.offset +
		matroskaToHex(matroskaElements.Cluster).byteLength;

	let clusterSize = cluster.bytes.byteLength;
	await w.write(cluster.bytes);

	const addSample = async (chunk: EncodedVideoChunk, trackNumber: number) => {
		const arr = new Uint8Array(chunk.byteLength);
		chunk.copyTo(arr);
		const simpleBlock = makeSimpleBlock({
			bytes: arr,
			invisible: false,
			keyframe: chunk.type === 'key',
			lacing: 0,
			trackNumber,
			// TODO: Maybe this is bad, because it's in microseconds, but should be in timescale
			// Maybe it only works by coincidence
			timecodeRelativeToCluster: Math.round(chunk.timestamp / 1000),
		});

		clusterSize += simpleBlock.byteLength;
		await w.updateDataAt(
			clusterVIntPosition,
			getVariableInt(clusterSize, CLUSTER_MIN_VINT_WIDTH),
		);
		await w.write(simpleBlock);
	};

	const updateDuration = async (newDuration: number) => {
		const blocks = padMatroskaBytes(
			{
				type: 'Duration',
				value: {
					value: newDuration,
					size: '64',
				},
				minVintWidth: null,
			},
			1000,
		);
		await w.updateDataAt(
			durationOffset,
			combineUint8Arrays(blocks.map((b) => b.bytes)),
		);
	};

	const addTrack = async (track: BytesAndOffset) => {
		currentTracks.push(track);
		const newTracks = makeMatroskaTracks(currentTracks);

		await w.updateDataAt(
			tracksOffset,
			combineUint8Arrays(newTracks.map((b) => b.bytes)),
		);
	};

	let operationProm = Promise.resolve();

	return {
		save: async () => {
			await w.save();
		},
		addSample: (chunk, trackNumber) => {
			operationProm = operationProm.then(() => addSample(chunk, trackNumber));
			return operationProm;
		},
		updateDuration: (duration) => {
			operationProm = operationProm.then(() => updateDuration(duration));
			return operationProm;
		},
		addTrack: (track) => {
			const trackNumber = currentTracks.length + 1;

			const bytes =
				track.type === 'video'
					? makeMatroskaVideoTrackEntryBytes({...track, trackNumber})
					: makeMatroskaAudioTrackEntryBytes({...track, trackNumber});

			operationProm = operationProm.then(() => addTrack(bytes));

			return operationProm.then(() => ({trackNumber}));
		},
	};
};
