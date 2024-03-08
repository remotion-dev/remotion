import type {Codec} from './codec';
import {combineVideoStreams} from './combine-video-streams';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';

export const createCombinedVideo = async ({
	addRemotionMetadata,
	binariesDirectory,
	cancelSignal,
	codec,
	filelistDir,
	files,
	fps,
	indent,
	logLevel,
	numberOfGifLoops,
	onProgress,
	output,
}: {
	fps: number;
	codec: Codec;
	filelistDir: string;
	numberOfGifLoops: number | null;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	onProgress: (p: number) => void;
	files: string[];
	addRemotionMetadata: boolean;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}) => {
	await combineVideoStreams({
		addRemotionMetadata,
		binariesDirectory,
		cancelSignal,
		codec,
		filelistDir,
		files,
		fps,
		indent,
		logLevel,
		numberOfGifLoops,
		onProgress,
		output,
	});
};
