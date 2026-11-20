import type {LogLevel} from '@remotion/renderer';
import {formatBytes} from '@remotion/studio-shared';
import type {WhisperModelDownloadProgress} from '@remotion/whisper-webgpu';
import {chalk} from '../chalk';
import {makeProgressBar, PROGRESS_BAR_WIDTH} from '../make-progress-bar';
import {LABEL_WIDTH, createOverwriteableCliOutput} from '../progress-bar';
import {shouldUseNonOverlayingLogger} from '../should-use-non-overlaying-logger';

export const createWhisperProgress = ({
	quiet,
	logLevel,
	outputToStdout,
}: {
	quiet: boolean;
	logLevel: LogLevel;
	outputToStdout: boolean;
}) => {
	const updatesDontOverwrite =
		outputToStdout || shouldUseNonOverlayingLogger({logLevel});
	const progressOutput = createOverwriteableCliOutput({
		quiet,
		cancelSignal: null,
		updatesDontOverwrite,
		indent: false,
		logLevel,
	});
	const completedRows: string[] = [];
	let overlay = '';
	const runWithProgress = async <Result>(
		activeLabel: string,
		completedLabel: string,
		run: (
			onProgress: (progress: WhisperModelDownloadProgress) => void,
		) => Promise<Result>,
	) => {
		const startedAt = Date.now();
		let lastPercent: number | null = null;
		const update = (
			value: number | null,
			downloadSize: string | null,
			finished: boolean,
		) => {
			const elapsed = `${Date.now() - startedAt}ms`;
			if (updatesDontOverwrite) {
				const message = finished
					? `${activeLabel} done in ${elapsed}`
					: downloadSize === null
						? activeLabel
						: `${activeLabel} ${downloadSize}`;
				progressOutput.update(message, true);
				return;
			}

			const label = finished ? completedLabel : activeLabel;
			const prefix = label.padEnd(LABEL_WIDTH);
			const bar =
				value === null
					? ' '.repeat(PROGRESS_BAR_WIDTH)
					: makeProgressBar(value, false);
			const row = `${prefix} ${bar} ${downloadSize ?? chalk.gray(elapsed)}`;
			if (finished) {
				completedRows.push(row);
			}

			overlay = (finished ? completedRows : [...completedRows, row]).join('\n');
			progressOutput.update(overlay, false);
		};

		update(null, null, false);
		const timer =
			updatesDontOverwrite || quiet || logLevel === 'error'
				? null
				: setInterval(() => {
						if (lastPercent === null) {
							update(null, null, false);
						}
					}, 1000);
		const step = updatesDontOverwrite ? 10 : 1;
		try {
			const result = await run(({progress: value, loadedBytes, totalBytes}) => {
				const percent = Math.floor(value * 100);
				if (
					percent < 100 &&
					(lastPercent === null || percent >= lastPercent + step)
				) {
					lastPercent = percent;
					update(
						value,
						`${formatBytes(loadedBytes)}/${formatBytes(totalBytes)}`,
						false,
					);
				}
			});
			update(1, null, true);
			return result;
		} finally {
			if (timer !== null) {
				clearInterval(timer);
			}
		}
	};

	return {
		runWithProgress,
		finish: () => {
			if (overlay !== '') {
				progressOutput.update(overlay, true);
			}
		},
	};
};
