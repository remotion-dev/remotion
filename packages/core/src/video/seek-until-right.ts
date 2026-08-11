import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {type LogLevel} from '../log';
import {seek} from '../seek';

const roundTo6Commas = (num: number) => {
	return Math.round(num * 100_000) / 100_000;
};

export const seekToTime = ({
	element,
	desiredTime,
	logLevel,
	mountTime,
}: {
	element: HTMLVideoElement;
	desiredTime: number;
	logLevel: LogLevel;
	mountTime: number;
}) => {
	if (isApproximatelyTheSame(element.currentTime, desiredTime)) {
		return {
			wait: Promise.resolve(desiredTime),
			cancel: () => {},
		};
	}

	seek({
		logLevel,
		mediaRef: element,
		time: desiredTime,
		why: 'Seeking during rendering',
		mountTime,
	});

	let cancel: number;
	let cancelSeeked: null | (() => void) = null;
	const prom = new Promise<number>((resolve) => {
		cancel = element.requestVideoFrameCallback((now, metadata) => {
			const displayIn = metadata.expectedDisplayTime - now;
			if (displayIn <= 0) {
				resolve(metadata.mediaTime);

				return;
			}

			setTimeout(() => {
				resolve(metadata.mediaTime);
			}, displayIn + 150);
		});
	});

	const waitForSeekedEvent = new Promise<void>((resolve) => {
		const onDone = () => {
			resolve();
		};

		element.addEventListener('seeked', onDone, {
			once: true,
		});
		cancelSeeked = () => {
			element.removeEventListener('seeked', onDone);
		};
	});

	return {
		wait: Promise.all([prom, waitForSeekedEvent] as const).then(
			([time]) => time,
		),
		cancel: () => {
			cancelSeeked?.();
			element.cancelVideoFrameCallback(cancel);
		},
	};
};

export const seekToTimeMultipleUntilRight = ({
	element,
	desiredTime,
	fps,
	logLevel,
	mountTime,
}: {
	element: HTMLVideoElement;
	desiredTime: number;
	fps: number;
	logLevel: LogLevel;
	mountTime: number;
}) => {
	const threshold = 1 / fps / 2;
	let currentCancel: () => void = () => undefined;

	if (
		Number.isFinite(element.duration) &&
		element.currentTime >= element.duration &&
		desiredTime >= element.duration
	) {
		return {
			prom: Promise.resolve(),
			cancel: () => {},
		};
	}

	const prom = new Promise<void>((resolve, reject) => {
		const firstSeek = seekToTime({
			element,
			desiredTime: desiredTime + threshold,
			logLevel,
			mountTime,
		});
		firstSeek.wait.then((seekedTo) => {
			const difference = Math.abs(desiredTime - seekedTo);

			if (difference <= threshold) {
				return resolve();
			}

			const sign = desiredTime > seekedTo ? 1 : -1;

			const newSeek = seekToTime({
				element,
				desiredTime: seekedTo + threshold * sign,
				logLevel,
				mountTime,
			});
			currentCancel = newSeek.cancel;
			newSeek.wait
				.then((newTime) => {
					const newDifference = Math.abs(desiredTime - newTime);

					if (roundTo6Commas(newDifference) <= roundTo6Commas(threshold)) {
						return resolve();
					}

					const thirdSeek = seekToTime({
						element,
						desiredTime: desiredTime + threshold,
						logLevel,
						mountTime,
					});
					currentCancel = thirdSeek.cancel;
					return thirdSeek.wait
						.then(() => {
							resolve();
						})
						.catch((err) => {
							reject(err);
						});
				})
				.catch((err) => {
					reject(err);
				});
		});

		currentCancel = firstSeek.cancel;
	});

	return {
		prom,
		cancel: () => {
			currentCancel();
		},
	};
};
