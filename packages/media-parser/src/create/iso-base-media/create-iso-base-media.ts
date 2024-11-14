import {combineUint8Arrays} from '../../boxes/webm/make-header';
import type {SamplePosition} from '../../get-sample-positions';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';
import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import type {MediaFn, MediaFnGeneratorInput} from '../media-fn';
import {createIsoBaseMediaFtyp} from './create-ftyp';
import {createPaddedMoovAtom} from './mp4-header';
import {numberTo32BitUIntOrInt, stringsToUint8Array} from './primitives';

export const createIsoBaseMedia = async ({
	writer,
	onBytesProgress,
}: MediaFnGeneratorInput): Promise<MediaFn> => {
	const header = createIsoBaseMediaFtyp();

	const w = await writer.createContent();
	await w.write(header);

	let durationInUnits = 0;

	const currentTracks: (MakeTrackAudio | MakeTrackVideo)[] = [];
	const samplePositions: SamplePosition[][] = [];
	const sampleChunkIndices: number[] = [];

	const moovOffset = w.getWrittenByteCount();
	const getPaddedMoovAtom = () => {
		return createPaddedMoovAtom({
			durationInUnits,
			trackInfo: currentTracks.map((track) => {
				return {
					track,
					durationInUnits,
					samplePositions: samplePositions[track.trackNumber] ?? [],
				};
			}),
		});
	};

	await w.write(getPaddedMoovAtom());

	const mdatSize = 8;
	const mdatSizeOffset = w.getWrittenByteCount();

	await w.write(
		combineUint8Arrays([
			// size
			numberTo32BitUIntOrInt(mdatSize),
			// type
			stringsToUint8Array('mdat'),
		]),
	);

	const updateMdatSize = async () => {
		await w.updateDataAt(mdatSizeOffset, numberTo32BitUIntOrInt(mdatSize));
	};

	const operationProm = {current: Promise.resolve()};

	const updateMoov = async () => {
		await w.updateDataAt(moovOffset, getPaddedMoovAtom());
		await updateMdatSize();

		onBytesProgress(w.getWrittenByteCount());
	};

	const updateDuration = async (newDuration: number) => {
		durationInUnits = newDuration;
		await updateMoov();
	};

	const addSample = async (chunk: AudioOrVideoSample, trackNumber: number) => {
		if (!chunk.duration) {
			throw new Error('Duration is required');
		}

		const position = w.getWrittenByteCount();
		await w.write(chunk.data);
		if (!samplePositions[trackNumber]) {
			samplePositions[trackNumber] = [];
		}

		if (!sampleChunkIndices[trackNumber]) {
			sampleChunkIndices[trackNumber] = 0;
		}

		if (chunk.type === 'key') {
			sampleChunkIndices[trackNumber]++;
		}

		samplePositions[trackNumber].push({
			isKeyframe: chunk.type === 'key',
			offset: position,
			chunk: sampleChunkIndices[trackNumber],
			cts: chunk.timestamp,
			dts: chunk.timestamp,
			duration: chunk.duration,
			size: chunk.data.length,
		});
	};

	const addTrack = async (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => {
		const trackNumber = currentTracks.length + 1;

		currentTracks.push({...track, trackNumber});
		await updateMoov();

		return Promise.resolve({trackNumber});
	};

	const waitForFinishPromises: (() => Promise<void>)[] = [];

	return {
		save: async () => {
			const file = await w.save();
			return file;
		},
		remove: async () => {
			await w.remove();
		},
		addSample: (chunk, trackNumber) => {
			operationProm.current = operationProm.current.then(() => {
				return addSample(chunk, trackNumber);
			});
			return operationProm.current;
		},
		addTrack: (track) => {
			operationProm.current = operationProm.current.then(() =>
				addTrack(track),
			) as Promise<void>;

			return operationProm.current as Promise<unknown> as Promise<{
				trackNumber: number;
			}>;
		},
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			await Promise.all(waitForFinishPromises.map((p) => p()));
			await operationProm.current;
			await w.waitForFinish();
		},
		updateDuration: (duration) => {
			operationProm.current = operationProm.current.then(() =>
				updateDuration(duration),
			);
			return operationProm.current;
		},
	};
};
