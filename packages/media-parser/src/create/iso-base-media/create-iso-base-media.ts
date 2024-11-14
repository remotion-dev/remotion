import type {MakeTrackAudio, MakeTrackVideo} from '../make-track-info';
import type {MediaFn, MediaFnGeneratorInput} from '../media-fn';
import {createIsoBaseMediaFtyp} from './create-ftyp';
import {createPaddedMoovAtom} from './mp4-header';
import type {IsoBaseMediaTrackData} from './serialize-track';

export const createIsoBaseMedia = async ({
	writer,
	onBytesProgress,
}: MediaFnGeneratorInput): Promise<MediaFn> => {
	const header = createIsoBaseMediaFtyp();

	const w = await writer.createContent();
	await w.write(header);

	let durationInUnits = 0;

	const currentTracks: IsoBaseMediaTrackData[] = [];

	const moovOffset = w.getWrittenByteCount();
	const moov = createPaddedMoovAtom({
		durationInUnits,
		trackInfo: currentTracks,
	});
	await w.write(moov);

	const operationProm = {current: Promise.resolve()};

	const updateMoov = async () => {
		await w.updateDataAt(
			moovOffset,
			createPaddedMoovAtom({
				durationInUnits,
				trackInfo: currentTracks,
			}),
		);

		onBytesProgress(w.getWrittenByteCount());
	};

	const updateDuration = async (newDuration: number) => {
		durationInUnits = newDuration;
		await updateMoov();
	};

	const addTrack = async (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => {
		const trackNumber = currentTracks.length + 1;

		currentTracks.push({
			track: {
				...track,
				trackNumber,
			},
			durationInUnits,
			samplePositions: [],
		});
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
		addSample: (chunk, trackNumber, isVideo) => {
			operationProm.current = operationProm.current.then(() => {
				console.log(chunk, trackNumber, isVideo);
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
