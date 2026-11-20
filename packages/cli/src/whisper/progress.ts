import type {LogLevel} from '@remotion/renderer';
import {chalk} from '../chalk';
import {makeProgressBar, PROGRESS_BAR_WIDTH} from '../make-progress-bar';
import {LABEL_WIDTH, createOverwriteableCliOutput} from '../progress-bar';
import {shouldUseNonOverlayingLogger} from '../should-use-non-overlaying-logger';

export const createWhisperProgress = ({
	quiet,
	logLevel,
}: {
	quiet: boolean;
	logLevel: LogLevel;
}) => {
	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});
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
		run: (onProgress: (progress: number) => void) => Promise<Result>,
	) => {
		const startedAt = Date.now();
		let lastPercent = 0;
		const update = (value: number | null, finished: boolean) => {
			const label = finished ? completedLabel : activeLabel;
			const prefix = label.padEnd(LABEL_WIDTH);
			const elapsed = `${Date.now() - startedAt}ms`;
			const status =
				value === null || finished ? elapsed : `${Math.floor(value * 100)}%`;
			if (updatesDontOverwrite) {
				progressOutput.update(
					value === null ? label : `${prefix} ${status}`,
					true,
				);
				return;
			}

			const bar =
				value === null
					? ' '.repeat(PROGRESS_BAR_WIDTH)
					: makeProgressBar(value, false);
			const row = `${prefix} ${bar} ${value === null || finished ? chalk.gray(status) : status}`;
			if (finished) {
				completedRows.push(row);
			}

			overlay = (finished ? completedRows : [...completedRows, row]).join('\n');
			progressOutput.update(overlay, false);
		};

		update(null, false);
		const timer =
			updatesDontOverwrite || quiet || logLevel === 'error'
				? null
				: setInterval(() => {
						if (lastPercent === 0) {
							update(null, false);
						}
					}, 1000);
		const step = updatesDontOverwrite ? 10 : 1;
		try {
			const result = await run((value) => {
				const percent = Math.floor(value * 100);
				if (percent < 100 && percent >= lastPercent + step) {
					lastPercent = percent;
					update(value, false);
				}
			});
			update(1, true);
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
