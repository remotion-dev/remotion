import {combineUint8Arrays} from '../boxes/webm/make-header';
import {
	matroskaElements,
	type BytesAndOffset,
} from '../boxes/webm/segments/all-segments';
import type {WriterInterface} from '../writers/writer';
import {makeCluster} from './cluster';
import {makeDurationWithPadding} from './make-duration-with-padding';
import {makeMatroskaHeader} from './matroska-header';
import {makeMatroskaInfo} from './matroska-info';
import type {Seek} from './matroska-seek';
import {createMatroskaSeekHead} from './matroska-seek';
import {createMatroskaSegment} from './matroska-segment';
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

	await w.write(matroskaSegment.bytes);

	const clusterOffset = w.getWrittenByteCount();
	let currentCluster = await makeCluster(w, 0);
	seeks.push({
		hexString: matroskaElements.Cluster,
		byte: clusterOffset - seekHeadOffset,
	});
	await updateSeekWrite();

	const getClusterOrMakeNew = async (chunk: EncodedVideoChunk) => {
		if (!currentCluster.shouldMakeNewCluster(chunk)) {
			return currentCluster;
		}

		currentCluster = await makeCluster(w, chunk.timestamp);
		return currentCluster;
	};

	const addSample = async (chunk: EncodedVideoChunk, trackNumber: number) => {
		const cluster = await getClusterOrMakeNew(chunk);
		return cluster.addSample(chunk, trackNumber);
	};

	const updateDuration = async (newDuration: number) => {
		const blocks = makeDurationWithPadding(newDuration);
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

	const waitForFinishPromises: (() => Promise<void>)[] = [];

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
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			await Promise.all(waitForFinishPromises.map((p) => p()));
		},
	};
};
