import type {AudioOrVideoSample} from '@remotion/media-parser';
import {MediaParserInternals} from '@remotion/media-parser';
import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import type {MediaFn, MediaFnGeneratorInput} from '../media-fn';
import {makeCluster, timestampToClusterTimestamp} from './cluster';
import {makeDurationWithPadding} from './make-duration-with-padding';
import {createMatroskaCues, type Cue} from './matroska-cues';
import {makeMatroskaHeader} from './matroska-header';
import {makeMatroskaInfo} from './matroska-info';
import type {Seek} from './matroska-seek';
import {createMatroskaSeekHead} from './matroska-seek';
import {
	MATROSKA_SEGMENT_MIN_VINT_WIDTH,
	createMatroskaSegment,
} from './matroska-segment';
import {makeMatroskaTracks} from './matroska-trackentry';
import {
	combineUint8Arrays,
	getVariableInt,
	matroskaToHex,
} from './matroska-utils';

const {matroskaElements} = MediaParserInternals;

const timescale = 1_000_000;

export const createMatroskaMedia = async ({
	writer,
	onBytesProgress,
	onMillisecondsProgress,
	filename,
	logLevel,
	progressTracker,
}: MediaFnGeneratorInput): Promise<MediaFn> => {
	const header = makeMatroskaHeader();

	const w = await writer.createContent({
		filename,
		mimeType: 'video/webm',
		logLevel,
	});
	await w.write(header.bytes);
	const matroskaInfo = makeMatroskaInfo({
		timescale,
	});

	const currentTracks: (MakeTrackAudio | MakeTrackVideo)[] = [];

	const seeks: Seek[] = [];
	const cues: Cue[] = [];
	const trackNumbers: number[] = [];

	const matroskaSegment = createMatroskaSegment([
		...createMatroskaSeekHead(seeks),
		matroskaInfo,
		...makeMatroskaTracks(currentTracks),
	]);

	const infoSegment = matroskaSegment.offsets.children.find(
		(o) => o.field === 'Info',
	);

	const durationOffset =
		(infoSegment?.children.find((c) => c.field === 'Duration')?.offset ?? 0) +
		w.getWrittenByteCount();
	const tracksOffset =
		(matroskaSegment.offsets.children.find((o) => o.field === 'Tracks')
			?.offset ?? 0) + w.getWrittenByteCount();
	const seekHeadOffset =
		(matroskaSegment.offsets.children.find((o) => o.field === 'SeekHead')
			?.offset ?? 0) + w.getWrittenByteCount();
	const infoOffset = (infoSegment?.offset ?? 0) + w.getWrittenByteCount();

	if (!seekHeadOffset) {
		throw new Error('could not get seek offset');
	}

	if (!durationOffset) {
		throw new Error('could not get duration offset');
	}

	if (!tracksOffset) {
		throw new Error('could not get tracks offset');
	}

	if (!infoOffset) {
		throw new Error('could not get tracks offset');
	}

	seeks.push({
		hexString: matroskaElements.Info,
		byte: infoOffset - seekHeadOffset,
	});

	seeks.push({
		hexString: matroskaElements.Tracks,
		byte: tracksOffset - seekHeadOffset,
	});

	const updateSeekWrite = async () => {
		const updatedSeek = createMatroskaSeekHead(seeks);
		await w.updateDataAt(
			seekHeadOffset,
			combineUint8Arrays(updatedSeek.map((b) => b.bytes)),
		);
		onBytesProgress(w.getWrittenByteCount());
	};

	const segmentOffset = w.getWrittenByteCount();

	const updateSegmentSize = async (size: number) => {
		const data = getVariableInt(size, MATROSKA_SEGMENT_MIN_VINT_WIDTH);
		await w.updateDataAt(
			segmentOffset + matroskaToHex(matroskaElements.Segment).byteLength,
			data,
		);
		onBytesProgress(w.getWrittenByteCount());
	};

	await w.write(matroskaSegment.bytes);

	const clusterOffset = w.getWrittenByteCount();
	let currentCluster = await makeCluster({
		writer: w,
		clusterStartTimestamp: 0,
		timescale,
		logLevel,
	});
	seeks.push({
		hexString: matroskaElements.Cluster,
		byte: clusterOffset - seekHeadOffset,
	});

	const getClusterOrMakeNew = async ({
		chunk,
		isVideo,
	}: {
		chunk: AudioOrVideoSample;
		isVideo: boolean;
	}) => {
		// In Safari, samples can arrive out of order, e.g public/bigbuckbunny.mp4
		// Therefore, only updating track number progress if it is a keyframe
		// to allow for timestamps to be lower than the previous one

		progressTracker.setPossibleLowestTimestamp(
			Math.min(chunk.timestamp, chunk.cts ?? Infinity, chunk.dts ?? Infinity),
		);

		const smallestProgress = progressTracker.getSmallestProgress();

		if (
			!currentCluster.shouldMakeNewCluster({
				newT: smallestProgress,
				isVideo,
				chunk,
			})
		) {
			return {cluster: currentCluster, isNew: false, smallestProgress};
		}

		currentCluster = await makeCluster({
			writer: w,
			clusterStartTimestamp: smallestProgress,
			timescale,
			logLevel,
		});
		return {cluster: currentCluster, isNew: true, smallestProgress};
	};

	const updateDuration = async (newDuration: number) => {
		const blocks = makeDurationWithPadding(newDuration);
		await w.updateDataAt(durationOffset, blocks.bytes);
		onBytesProgress(w.getWrittenByteCount());
	};

	const addSample = async ({
		chunk,
		trackNumber,
		isVideo,
	}: {
		chunk: AudioOrVideoSample;
		trackNumber: number;
		isVideo: boolean;
	}) => {
		const {cluster, isNew, smallestProgress} = await getClusterOrMakeNew({
			chunk,
			isVideo,
		});

		const newDuration = Math.round(
			(chunk.timestamp + (chunk.duration ?? 0)) / 1000,
		);

		await updateDuration(newDuration);

		const {timecodeRelativeToCluster} = await cluster.addSample(
			chunk,
			trackNumber,
		);
		if (isNew) {
			const newCluster = w.getWrittenByteCount();
			cues.push({
				time:
					timestampToClusterTimestamp(smallestProgress, timescale) +
					timecodeRelativeToCluster,
				clusterPosition: newCluster - seekHeadOffset,
				trackNumber,
			});
		}

		if (chunk.type === 'key') {
			progressTracker.updateTrackProgress(trackNumber, chunk.timestamp);
		}

		onBytesProgress(w.getWrittenByteCount());
		onMillisecondsProgress(newDuration);
	};

	const addTrack = async (track: MakeTrackVideo | MakeTrackAudio) => {
		currentTracks.push(track);
		const newTracks = makeMatroskaTracks(currentTracks);
		progressTracker.registerTrack(track.trackNumber);

		await w.updateDataAt(
			tracksOffset,
			combineUint8Arrays(newTracks.map((b) => b.bytes)),
		);
	};

	const operationProm = {current: Promise.resolve()};

	const waitForFinishPromises: (() => Promise<void>)[] = [];

	return {
		updateTrackSampleRate: ({sampleRate, trackNumber}) => {
			currentTracks.forEach((track) => {
				if (track.trackNumber === trackNumber) {
					if (track.type !== 'audio') {
						throw new Error('track is not audio');
					}

					track.sampleRate = sampleRate;
				}
			});
		},
		getBlob: async () => {
			return w.getBlob();
		},
		remove: async () => {
			await w.remove();
		},
		addSample: ({chunk, trackNumber, isVideo}) => {
			operationProm.current = operationProm.current.then(() =>
				addSample({chunk, trackNumber, isVideo}),
			);
			return operationProm.current;
		},
		addTrack: (track) => {
			const trackNumber = currentTracks.length + 1;

			operationProm.current = operationProm.current.then(() =>
				addTrack({...track, trackNumber}),
			);
			trackNumbers.push(trackNumber);

			return operationProm.current.then(() => ({trackNumber}));
		},
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			await Promise.all(waitForFinishPromises.map((p) => p()));
			await operationProm.current;
			seeks.push({
				hexString: matroskaElements.Cues,
				byte: w.getWrittenByteCount() - seekHeadOffset,
			});
			await updateSeekWrite();

			await w.write(createMatroskaCues(cues).bytes);
			const segmentSize =
				w.getWrittenByteCount() -
				segmentOffset -
				matroskaToHex(matroskaElements.Segment).byteLength -
				MATROSKA_SEGMENT_MIN_VINT_WIDTH;
			await updateSegmentSize(segmentSize);
			await w.finish();
		},
	};
};
