import type {Writer} from '@remotion/media-parser';
import {
	MediaParserInternals,
	type AudioOrVideoSample,
} from '@remotion/media-parser';
import type {LogLevel} from '../../log';
import {Log} from '../../log';
import {
	CLUSTER_MIN_VINT_WIDTH,
	createClusterSegment,
	makeSimpleBlock,
} from './cluster-segment';
import {getVariableInt, matroskaToHex} from './matroska-utils';

const maxClusterTimestamp = 2 ** 15;

export const timestampToClusterTimestamp = (
	timestamp: number,
	timescale: number,
) => {
	return Math.round((timestamp / timescale) * 1000);
};

export const canFitInCluster = ({
	clusterStartTimestamp,
	chunk,
	timescale,
}: {
	clusterStartTimestamp: number;
	chunk: AudioOrVideoSample;
	timescale: number;
}) => {
	const timecodeRelativeToCluster =
		timestampToClusterTimestamp(chunk.timestamp, timescale) -
		timestampToClusterTimestamp(clusterStartTimestamp, timescale);

	if (timecodeRelativeToCluster < 0) {
		throw new Error(
			`timecodeRelativeToCluster is negative, tried to add ${chunk.timestamp} to ${clusterStartTimestamp}`,
		);
	}

	return timecodeRelativeToCluster <= maxClusterTimestamp;
};

export const makeCluster = async ({
	writer,
	clusterStartTimestamp,
	timescale,
	logLevel,
}: {
	writer: Writer;
	clusterStartTimestamp: number;
	timescale: number;
	logLevel: LogLevel;
}) => {
	Log.verbose(
		logLevel,
		`Making new Matroska cluster with timestamp ${clusterStartTimestamp}`,
	);
	const cluster = createClusterSegment(
		timestampToClusterTimestamp(clusterStartTimestamp, timescale),
	);
	const clusterVIntPosition =
		writer.getWrittenByteCount() +
		cluster.offsets.offset +
		matroskaToHex(MediaParserInternals.matroskaElements.Cluster).byteLength;

	let clusterSize =
		cluster.bytes.byteLength -
		matroskaToHex(MediaParserInternals.matroskaElements.Cluster).byteLength -
		CLUSTER_MIN_VINT_WIDTH;
	await writer.write(cluster.bytes);

	const addSample = async (chunk: AudioOrVideoSample, trackNumber: number) => {
		const timecodeRelativeToCluster =
			timestampToClusterTimestamp(chunk.timestamp, timescale) -
			timestampToClusterTimestamp(clusterStartTimestamp, timescale);

		if (!canFitInCluster({clusterStartTimestamp, chunk, timescale})) {
			throw new Error(
				`timecodeRelativeToCluster is too big: ${timecodeRelativeToCluster} > ${maxClusterTimestamp}`,
			);
		}

		const keyframe = chunk.type === 'key';
		const simpleBlock = makeSimpleBlock({
			bytes: chunk.data,
			invisible: false,
			keyframe,
			lacing: 0,
			trackNumber,
			timecodeRelativeToCluster,
		});

		clusterSize += simpleBlock.byteLength;
		await writer.updateDataAt(
			clusterVIntPosition,
			getVariableInt(clusterSize, CLUSTER_MIN_VINT_WIDTH),
		);
		await writer.write(simpleBlock);
		return {timecodeRelativeToCluster};
	};

	const shouldMakeNewCluster = ({
		isVideo,
		chunk,
		newT,
	}: {
		newT: number;
		chunk: AudioOrVideoSample;
		isVideo: boolean;
	}) => {
		const newTimestamp = timestampToClusterTimestamp(newT, timescale);
		const oldTimestamp = timestampToClusterTimestamp(
			clusterStartTimestamp,
			timescale,
		);

		const canFit = canFitInCluster({
			chunk,
			clusterStartTimestamp,
			timescale,
		});

		if (!canFit) {
			// We must create a new cluster
			// This is for example if we have an audio-only file
			Log.verbose(
				logLevel,
				`Cannot fit ${chunk.timestamp} in cluster ${clusterStartTimestamp}. Creating new cluster`,
			);
			return true;
		}

		const keyframe = chunk.type === 'key';

		// TODO: Timestamp falls apart when video only
		return newTimestamp - oldTimestamp >= 2000 && keyframe && isVideo;
	};

	return {
		addSample,
		shouldMakeNewCluster,
		startTimestamp: clusterStartTimestamp,
	};
};
