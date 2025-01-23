import {
	MediaParserInternals,
	type AudioOrVideoSample,
	type SamplePosition,
} from '@remotion/media-parser';
import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import {combineUint8Arrays} from '../matroska/matroska-utils';
import type {MediaFn, MediaFnGeneratorInput} from '../media-fn';
import {createIsoBaseMediaFtyp} from './create-ftyp';
import {createPaddedMoovAtom} from './mp4-header';
import {numberTo32BitUIntOrInt, stringsToUint8Array} from './primitives';

const CONTAINER_TIMESCALE = 1_000;

export const createIsoBaseMedia = async ({
	writer,
	onBytesProgress,
	onMillisecondsProgress,
	logLevel,
	filename,
	progressTracker,
}: MediaFnGeneratorInput): Promise<MediaFn> => {
	const header = createIsoBaseMediaFtyp({
		compatibleBrands: ['isom', 'iso2', 'avc1', 'mp42'],
		majorBrand: 'isom',
		minorBrand: 512,
	});

	const w = await writer.createContent({
		filename,
		mimeType: 'video/mp4',
		logLevel,
	});
	await w.write(header);

	let globalDurationInUnits = 0;
	const lowestTrackTimestamps: Record<number, number> = {};
	const trackDurations: Record<number, number> = {};

	const currentTracks: (MakeTrackAudio | MakeTrackVideo)[] = [];
	const samplePositions: SamplePosition[][] = [];
	const sampleChunkIndices: number[] = [];

	const moovOffset = w.getWrittenByteCount();
	const getPaddedMoovAtom = () => {
		return createPaddedMoovAtom({
			durationInUnits: globalDurationInUnits,
			trackInfo: currentTracks.map((track) => {
				return {
					track,
					durationInUnits: trackDurations[track.trackNumber] ?? 0,
					samplePositions: samplePositions[track.trackNumber] ?? [],
					timescale: track.timescale,
				};
			}),
			timescale: CONTAINER_TIMESCALE,
		});
	};

	await w.write(getPaddedMoovAtom());

	let mdatSize = 8;
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
		onBytesProgress(w.getWrittenByteCount());
	};

	const operationProm = {current: Promise.resolve()};

	const updateMoov = async () => {
		await w.updateDataAt(moovOffset, getPaddedMoovAtom());

		onBytesProgress(w.getWrittenByteCount());
	};

	const addCodecPrivateToTrack = ({
		trackNumber,
		codecPrivate,
	}: {
		trackNumber: number;
		codecPrivate: Uint8Array;
	}) => {
		currentTracks.forEach((track) => {
			if (track.trackNumber === trackNumber) {
				track.codecPrivate = codecPrivate;
			}
		});
	};

	let lastChunkWasVideo = false;

	const addSample = async ({
		chunk,
		trackNumber,
		isVideo,
		codecPrivate,
	}: {
		chunk: AudioOrVideoSample;
		trackNumber: number;
		isVideo: boolean;
		codecPrivate: Uint8Array | null;
	}) => {
		const position = w.getWrittenByteCount();

		await w.write(chunk.data);
		mdatSize += chunk.data.length;
		onBytesProgress(w.getWrittenByteCount());
		progressTracker.setPossibleLowestTimestamp(
			Math.min(chunk.timestamp, chunk.cts ?? Infinity, chunk.dts ?? Infinity),
		);
		progressTracker.updateTrackProgress(trackNumber, chunk.timestamp);

		if (codecPrivate) {
			addCodecPrivateToTrack({trackNumber, codecPrivate});
		}

		const currentTrack = currentTracks.find(
			(t) => t.trackNumber === trackNumber,
		);
		if (!currentTrack) {
			throw new Error(
				`Tried to add sample to track ${trackNumber}, but it doesn't exist`,
			);
		}

		if (
			!lowestTrackTimestamps[trackNumber] ||
			chunk.timestamp < lowestTrackTimestamps[trackNumber]
		) {
			lowestTrackTimestamps[trackNumber] = chunk.timestamp;
		}

		if (typeof lowestTrackTimestamps[trackNumber] !== 'number') {
			throw new Error(
				`Tried to add sample to track ${trackNumber}, but it has no timestamp`,
			);
		}

		const newDurationInMicroSeconds =
			chunk.timestamp +
			(chunk.duration ?? 0) -
			lowestTrackTimestamps[trackNumber];
		const newDurationInTrackTimeUnits = Math.round(
			newDurationInMicroSeconds / (1_000_000 / currentTrack.timescale),
		);
		trackDurations[trackNumber] = newDurationInTrackTimeUnits;

		// webcodecs returns frame duration in microseconds
		const newDurationInMilliseconds = Math.round(
			(newDurationInMicroSeconds / 1_000_000) * CONTAINER_TIMESCALE,
		);

		if (newDurationInMilliseconds > globalDurationInUnits) {
			globalDurationInUnits = newDurationInMilliseconds;
			onMillisecondsProgress(newDurationInMilliseconds);
		}

		if (!samplePositions[trackNumber]) {
			samplePositions[trackNumber] = [];
		}

		if (typeof sampleChunkIndices[trackNumber] === 'undefined') {
			sampleChunkIndices[trackNumber] = 0;
		}

		// For video, make a new chunk if it's a keyframe
		if (isVideo && chunk.type === 'key') {
			sampleChunkIndices[trackNumber]++;
		} // For audio, make a new chunk every 22 samples, that's how bbb.mp4 is encoded
		else if (!isVideo && samplePositions[trackNumber].length % 22 === 0) {
			sampleChunkIndices[trackNumber]++;
		}
		// Need to create a new chunk if the last chunk was a different type
		else if (lastChunkWasVideo !== isVideo) {
			sampleChunkIndices[trackNumber]++;
		}

		// media parser and EncodedVideoChunk returns timestamps in microseconds
		// need to normalize the timestamps to milliseconds

		const samplePositionToAdd: SamplePosition = {
			isKeyframe: chunk.type === 'key',
			offset: position,
			chunk: sampleChunkIndices[trackNumber],
			cts: Math.round((chunk.cts / 1_000_000) * currentTrack.timescale),
			dts: Math.round((chunk.dts / 1_000_000) * currentTrack.timescale),
			duration: Math.round(
				((chunk.duration ?? 0) / 1_000_000) * currentTrack.timescale,
			),
			size: chunk.data.length,
		};
		lastChunkWasVideo = isVideo;

		samplePositions[trackNumber].push(samplePositionToAdd);
	};

	const addTrack = (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => {
		const trackNumber = currentTracks.length + 1;

		currentTracks.push({...track, trackNumber});
		progressTracker.registerTrack(trackNumber);

		return Promise.resolve({trackNumber});
	};

	const waitForFinishPromises: (() => Promise<void>)[] = [];

	return {
		getBlob: () => {
			return w.getBlob();
		},
		remove: async () => {
			await w.remove();
		},
		addSample: ({chunk, trackNumber, isVideo, codecPrivate}) => {
			operationProm.current = operationProm.current.then(() => {
				return addSample({
					chunk,
					trackNumber,
					isVideo,
					codecPrivate,
				});
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
		updateTrackSampleRate: ({sampleRate, trackNumber}) => {
			currentTracks.forEach((track) => {
				if (track.trackNumber === trackNumber) {
					if (track.type !== 'audio') {
						throw new Error(
							`Tried to update sample rate of track ${trackNumber}, but it's not an audio track`,
						);
					}

					track.sampleRate = sampleRate;
				}
			});
		},
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			MediaParserInternals.Log.verbose(
				logLevel,
				'All write operations queued. Waiting for finish...',
			);
			await Promise.all(waitForFinishPromises.map((p) => p()));
			MediaParserInternals.Log.verbose(logLevel, 'Cleanup tasks executed');
			await operationProm.current;
			await updateMoov();
			await updateMdatSize();
			MediaParserInternals.Log.verbose(
				logLevel,
				'All write operations done. Waiting for finish...',
			);
			await w.finish();
		},
	};
};
