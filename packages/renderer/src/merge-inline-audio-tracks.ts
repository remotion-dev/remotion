import path from 'node:path';
import type {DownloadMap} from './assets/download-map';
import type {InlineAudioTrack} from './assets/inline-audio-mixing';
import {chunk} from './chunk';
import {deleteDirectory} from './delete-directory';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import {mergeAudioTrack} from './merge-audio-track';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';

const MAX_INLINE_AUDIO_INPUTS = 10;

export const inlineAudioTrackToPreprocessedAudioTrack = ({
	track,
	relativeToInSeconds,
	padToDurationInSeconds,
	sampleRate,
}: {
	track: InlineAudioTrack;
	relativeToInSeconds: number;
	padToDurationInSeconds: number | null;
	sampleRate: number;
}): PreprocessedAudioTrack => {
	const delayInSamples = Math.max(
		0,
		Math.round((track.startInSeconds - relativeToInSeconds) * sampleRate),
	);
	const padAtEndInSamples =
		padToDurationInSeconds === null
			? 0
			: Math.max(
					0,
					Math.round(padToDurationInSeconds * sampleRate) -
						delayInSamples -
						Math.round(track.durationInSeconds * sampleRate),
				);

	return {
		outName: track.outName,
		filter: {
			pad_start:
				delayInSamples === 0
					? null
					: `adelay=${new Array(3).fill(`${delayInSamples}S`).join('|')}`,
			pad_end:
				padAtEndInSamples === 0 ? null : `apad=pad_len=${padAtEndInSamples}`,
		},
	};
};

export const mergeInlineAudioTracks = async ({
	tracks,
	downloadMap,
	remotionRoot,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
	fps,
	chunkLengthInSeconds,
	sampleRate,
}: {
	tracks: InlineAudioTrack[];
	downloadMap: DownloadMap;
	remotionRoot: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	fps: number;
	chunkLengthInSeconds: number;
	sampleRate: number;
}): Promise<InlineAudioTrack | null> => {
	let currentTracks = tracks.sort(
		(a, b) => a.startInSeconds - b.startInSeconds,
	);
	let level = 0;

	while (currentTracks.length > 1) {
		const groups = chunk(currentTracks, MAX_INLINE_AUDIO_INPUTS);
		currentTracks = await Promise.all(
			groups.map(async (group, index): Promise<InlineAudioTrack> => {
				if (group.length === 1) {
					return group[0];
				}

				const [{startInSeconds}] = group;
				const durationInSamples = Math.max(
					...group.map((track) => {
						return (
							Math.round((track.startInSeconds - startInSeconds) * sampleRate) +
							Math.round(track.durationInSeconds * sampleRate)
						);
					}),
				);
				const outName = path.join(
					downloadMap.audioMixing,
					`inline-${level}-${index}.wav`,
				);

				await mergeAudioTrack({
					files: group.map((track) =>
						inlineAudioTrackToPreprocessedAudioTrack({
							track,
							relativeToInSeconds: startInSeconds,
							padToDurationInSeconds: null,
							sampleRate,
						}),
					),
					outName,
					downloadMap,
					remotionRoot,
					indent,
					logLevel,
					binariesDirectory,
					cancelSignal,
					onProgress: () => undefined,
					fps,
					chunkLengthInSeconds,
					sampleRate,
				});

				for (const track of group) {
					deleteDirectory(track.outName);
				}

				return {
					outName,
					startInSeconds,
					durationInSeconds: durationInSamples / sampleRate,
				};
			}),
		);
		level++;
	}

	return currentTracks[0] ?? null;
};
