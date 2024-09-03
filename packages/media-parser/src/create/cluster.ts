import {getVariableInt} from '../boxes/webm/ebml';
import {matroskaToHex} from '../boxes/webm/make-header';
import {matroskaElements} from '../boxes/webm/segments/all-segments';
import type {Writer} from '../writers/writer';
import {
	CLUSTER_MIN_VINT_WIDTH,
	createClusterSegment,
	makeSimpleBlock,
} from './cluster-segment';
import {CREATE_TIME_SCALE} from './timescale';

const maxClusterTimestamp = 2 ** 15;

const timestampToClusterTimestamp = (timestamp: number) => {
	return Math.round((timestamp / CREATE_TIME_SCALE) * 1000);
};

export const makeCluster = async (w: Writer, timestamp: number) => {
	const cluster = createClusterSegment(timestampToClusterTimestamp(timestamp));
	const clusterVIntPosition =
		w.getWrittenByteCount() +
		cluster.offsets.offset +
		matroskaToHex(matroskaElements.Cluster).byteLength;

	let clusterSize = cluster.bytes.byteLength;
	await w.write(cluster.bytes);

	const addSample = async (chunk: EncodedVideoChunk, trackNumber: number) => {
		const arr = new Uint8Array(chunk.byteLength);
		chunk.copyTo(arr);
		const timecodeRelativeToCluster =
			timestampToClusterTimestamp(chunk.timestamp) -
			timestampToClusterTimestamp(timestamp);
		if (timecodeRelativeToCluster > maxClusterTimestamp) {
			throw new Error('timecodeRelativeToCluster is too big');
		}

		const keyframe = chunk.type === 'key';
		const simpleBlock = makeSimpleBlock({
			bytes: arr,
			invisible: false,
			keyframe,
			lacing: 0,
			trackNumber,
			timecodeRelativeToCluster,
		});

		clusterSize += simpleBlock.byteLength;
		await w.updateDataAt(
			clusterVIntPosition,
			getVariableInt(clusterSize, CLUSTER_MIN_VINT_WIDTH),
		);
		await w.write(simpleBlock);
	};

	const shouldMakeNewCluster = (chunk: EncodedVideoChunk) => {
		const newTimestamp = timestampToClusterTimestamp(chunk.timestamp);
		const oldTimestamp = timestampToClusterTimestamp(timestamp);

		return newTimestamp - oldTimestamp >= 2000 && chunk.type === 'key';
	};

	return {addSample, shouldMakeNewCluster};
};
