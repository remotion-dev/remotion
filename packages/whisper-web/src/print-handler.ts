import type {LogLevel} from './log';
import {Log} from './log';
import type {TranscriptionJson} from './result';

const RESULT_TOKEN = 'remotion_final:';
const PROGRESS_TOKEN = 'remotion_progress:';
const UPDATE_TOKEN = 'remotion_update:';
const BUSY_TOKEN = 'remotion_busy:';

export const printHandler = ({
	onProgress,
	onDone,
	onBusy,
	onUpdate,
	logLevel,
}: {
	onProgress: (value: number) => void;
	onBusy: () => void;
	onDone: (value: TranscriptionJson) => void;
	onUpdate: (value: TranscriptionJson) => void;
	logLevel: LogLevel;
}) => {
	return (text: string) => {
		Log.verbose(logLevel, text);

		if (text.startsWith(PROGRESS_TOKEN)) {
			const value = parseInt(text.slice(PROGRESS_TOKEN.length), 10);
			onProgress(value);
		} else if (text.startsWith(RESULT_TOKEN)) {
			const json = JSON.parse(text.slice(RESULT_TOKEN.length));
			onDone(json);
		} else if (text.startsWith(UPDATE_TOKEN)) {
			const json = JSON.parse(text.slice(UPDATE_TOKEN.length));
			onUpdate(json);
		} else if (text.startsWith(BUSY_TOKEN)) {
			onBusy();
		}
	};
};
