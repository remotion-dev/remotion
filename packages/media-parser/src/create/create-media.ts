import {getVariableInt} from '../boxes/webm/ebml';
import type {WriterInterface} from '../writers/writer';
import {
	CLUSTER_MIN_VINT_WIDTH,
	createClusterSegment,
	makeSimpleBlock,
} from './cluster-segment';
import {makeMatroskaHeader} from './matroska-header';
import {makeMatroskaInfo} from './matroska-info';
import {createMatroskaSegment} from './matroska-segment';
import {
	makeMatroskaTracks,
	makeMatroskaVideoTrackEntryBytes,
} from './matroska-trackentry';

export type MediaFn = {
	save: () => Promise<void>;
	addSample: (chunk: EncodedVideoChunk, trackNumber: number) => Promise<void>;
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
	const matroskaTrackEntry = makeMatroskaVideoTrackEntryBytes({
		color: {
			transferChracteristics: 'bt709',
			matrixCoefficients: 'bt709',
			primaries: 'bt709',
			fullRange: true,
		},
		width: 1920,
		height: 1080,
		defaultDuration: 2658,
		trackNumber: 1,
		codecId: 'V_VP8',
	});
	const matroskaTracks = makeMatroskaTracks([matroskaTrackEntry]);
	const matroskaSegment = createMatroskaSegment([matroskaInfo, matroskaTracks]);

	const durationOffset = matroskaSegment.offsets.children[0].children.find(
		(c) => c.field === 'Duration',
	)?.offset;
	if (!durationOffset) {
		throw new Error('could not get duration offset');
	}

	await w.write(matroskaSegment.bytes);

	const cluster = createClusterSegment();
	const clusterVIntPosition = w.getWrittenByteCount() + cluster.offsets.offset;

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
		await w.updateVIntAt(
			clusterVIntPosition,
			getVariableInt(clusterSize, CLUSTER_MIN_VINT_WIDTH),
		);
		await w.write(simpleBlock);
	};

	let addSampleProm = Promise.resolve();

	return {
		save: async () => {
			await w.save();
		},
		addSample: (chunk, trackNumber) => {
			addSampleProm = addSampleProm.then(() => addSample(chunk, trackNumber));
			return addSampleProm;
		},
	};
};
