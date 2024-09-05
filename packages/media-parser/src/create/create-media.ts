import {getVariableInt} from '../boxes/webm/ebml';
import {combineUint8Arrays, matroskaToHex} from '../boxes/webm/make-header';
import {
	matroskaElements,
	type BytesAndOffset,
} from '../boxes/webm/segments/all-segments';
import type {WriterInterface} from '../writers/writer';
import {makeCluster} from './cluster';
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
import type {MakeTrackAudio, MakeTrackVideo} from './matroska-trackentry';
import {
	makeMatroskaAudioTrackEntryBytes,
	makeMatroskaTracks,
	makeMatroskaVideoTrackEntryBytes,
} from './matroska-trackentry';
import {CREATE_TIME_SCALE} from './timescale';

export type MediaFn = {
	save: () => Promise<void>;
	addSample: (chunk: EncodedVideoChunk, trackNumber: number) => Promise<void>;
	updateDuration: (duration: number) => Promise<void>;
	addTrack: (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => Promise<{trackNumber: number}>;
	addWaitForFinishPromise: (promise: () => Promise<void>) => void;
	waitForFinish: () => Promise<void>;
};

export const createMedia = async (
	writer: WriterInterface,
): Promise<MediaFn> => {
	const header = makeMatroskaHeader();

	const w = await writer.createContent();
	await w.write(header.bytes);
	const matroskaInfo = makeMatroskaInfo({
		timescale: CREATE_TIME_SCALE,
	});

	const currentTracks: BytesAndOffset[] = [];

	const seeks: Seek[] = [];
	const cues: Cue[] = [];
	const trackNumbers: number[] = [];

	const matroskaSegment = createMatroskaSegment([
		matroskaInfo,
		...createMatroskaSeekHead(seeks),
		...makeMatroskaTracks(currentTracks),
	]);

	const durationOffset =
		(matroskaSegment.offsets.children[0].children.find(
			(c) => c.field === 'Duration',
		)?.offset ?? 0) + w.getWrittenByteCount();
	const tracksOffset =
		(matroskaSegment.offsets.children.find((o) => o.field === 'Tracks')
			?.offset ?? 0) + w.getWrittenByteCount();
	const seekHeadOffset =
		(matroskaSegment.offsets.children.find((o) => o.field === 'SeekHead')
			?.offset ?? 0) + w.getWrittenByteCount();

	if (!seekHeadOffset) {
		throw new Error('could not get seek offset');
	}

	if (!durationOffset) {
		throw new Error('could not get duration offset');
	}

	if (!tracksOffset) {
		throw new Error('could not get tracks offset');
	}

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
	};

	const segmentOffset =
		w.getWrittenByteCount() +
		matroskaToHex(matroskaElements.Segment).byteLength;

	const updateSegmentSize = async (size: number) => {
		const data = getVariableInt(size, MATROSKA_SEGMENT_MIN_VINT_WIDTH);
		await w.updateDataAt(segmentOffset, data);
	};

	await w.write(matroskaSegment.bytes);

	const clusterOffset = w.getWrittenByteCount();
	let currentCluster = await makeCluster(w, 0);
	// TODO: Also create a `Cues` seek element
	seeks.push({
		hexString: matroskaElements.Cluster,
		byte: clusterOffset - seekHeadOffset,
	});
	cues.push({
		time: 0,
		clusterPosition: clusterOffset - seekHeadOffset,
		trackNumbers,
	});

	await updateSeekWrite();

	const trackNumberProgresses: Record<number, number> = {};

	const getClusterOrMakeNew = async (chunk: EncodedVideoChunk) => {
		const smallestProgress = Math.min(...Object.values(trackNumberProgresses));
		if (
			!currentCluster.shouldMakeNewCluster(
				smallestProgress,
				chunk.type === 'key',
			)
		) {
			return currentCluster;
		}

		const newCluster = w.getWrittenByteCount();
		cues.push({
			time: smallestProgress,
			clusterPosition: newCluster - seekHeadOffset,
			trackNumbers,
		});

		currentCluster = await makeCluster(w, smallestProgress);
		return currentCluster;
	};

	const addSample = async (chunk: EncodedVideoChunk, trackNumber: number) => {
		trackNumberProgresses[trackNumber] = chunk.timestamp;
		const cluster = await getClusterOrMakeNew(chunk);
		return cluster.addSample(chunk, trackNumber);
	};

	const updateDuration = async (newDuration: number) => {
		const blocks = makeDurationWithPadding(newDuration);
		await w.updateDataAt(durationOffset, blocks.bytes);
	};

	const addTrack = async (track: BytesAndOffset) => {
		currentTracks.push(track);
		const newTracks = makeMatroskaTracks(currentTracks);

		await w.updateDataAt(
			tracksOffset,
			combineUint8Arrays(newTracks.map((b) => b.bytes)),
		);
	};

	const operationProm = {current: Promise.resolve()};

	const waitForFinishPromises: (() => Promise<void>)[] = [];

	return {
		save: async () => {
			await w.save();
		},
		addSample: (chunk, trackNumber) => {
			operationProm.current = operationProm.current.then(() =>
				addSample(chunk, trackNumber),
			);
			return operationProm.current;
		},
		updateDuration: (duration) => {
			operationProm.current = operationProm.current.then(() =>
				updateDuration(duration),
			);
			return operationProm.current;
		},
		addTrack: (track) => {
			const trackNumber = currentTracks.length + 1;

			const bytes =
				track.type === 'video'
					? makeMatroskaVideoTrackEntryBytes({...track, trackNumber})
					: makeMatroskaAudioTrackEntryBytes({...track, trackNumber});

			operationProm.current = operationProm.current.then(() => addTrack(bytes));
			trackNumbers.push(trackNumber);

			return operationProm.current.then(() => ({trackNumber}));
		},
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			await Promise.all(waitForFinishPromises.map((p) => p()));
			await operationProm.current;
			await w.write(createMatroskaCues(cues).bytes);
			const segmentSize = w.getWrittenByteCount() - segmentOffset;
			await w.waitForFinish();
			await updateSegmentSize(segmentSize);
		},
	};
};
