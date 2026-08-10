import {EncodedPacketSink} from 'mediabunny';
import type {Input} from 'mediabunny';

export type VideoFrameRate =
	| {
			type: 'constant';
			rate: number;
	  }
	| {
			type: 'variable';
			max: number;
			average: number;
	  };

const commonFpsValues = [
	24000 / 1001,
	24,
	25,
	30000 / 1001,
	30,
	50,
	60000 / 1001,
	60,
	120,
];

const snapToCommonFps = (fps: number) => {
	return (
		commonFpsValues.find((commonFps) => Math.abs(fps - commonFps) < 0.01) ??
		fps
	);
};

export const getVideoFrameRate = async (
	input: Input,
): Promise<VideoFrameRate | null> => {
	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		return null;
	}

	const packetSampleCount = 121;
	const timestamps = new Set<number>();
	const sink = new EncodedPacketSink(videoTrack);
	let endTimestamp = -Infinity;

	for await (const packet of sink.packets(undefined, undefined, {
		metadataOnly: true,
	})) {
		if (
			timestamps.size >= packetSampleCount &&
			packet.timestamp >= endTimestamp
		) {
			break;
		}

		timestamps.add(packet.timestamp);
		endTimestamp = Math.max(
			endTimestamp,
			packet.timestamp + packet.duration,
		);
	}

	if (timestamps.size < 2) {
		return null;
	}

	const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
	sortedTimestamps.splice(packetSampleCount);

	const intervals = sortedTimestamps.slice(1).map((timestamp, index) => {
		return timestamp - sortedTimestamps[index];
	});
	const averageInterval =
		intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
	const toleranceInSeconds = 1.01 / 1000;
	const intervalSpread = Math.max(...intervals) - Math.min(...intervals);
	const isConstant = intervalSpread <= toleranceInSeconds;

	if (isConstant) {
		return {
			type: 'constant',
			rate: snapToCommonFps(1 / averageInterval),
		};
	}

	return {
		type: 'variable',
		max: 1 / Math.min(...intervals),
		average: 1 / averageInterval,
	};
};
