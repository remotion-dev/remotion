export const seekToTime = (element: HTMLVideoElement, desiredTime: number) => {
	element.currentTime = desiredTime;

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

export const seekToTimeMultipleUntilRight = (
	element: HTMLVideoElement,
	desiredTime: number,
	fps: number,
) => {
	const threshold = 1 / fps / 2;
	let currentCancel: () => void = () => undefined;

	const prom = new Promise<void>((resolve, reject) => {
		const firstSeek = seekToTime(element, desiredTime + threshold);
		firstSeek.wait.then((seekedTo) => {
			const difference = Math.abs(desiredTime - seekedTo);

			if (difference <= threshold) {
				return resolve();
			}

			const sign = desiredTime > seekedTo ? 1 : -1;

			const newSeek = seekToTime(element, seekedTo + threshold * sign);
			currentCancel = newSeek.cancel;
			newSeek.wait
				.then((newTime) => {
					const newDifference = Math.abs(desiredTime - newTime);

					if (newDifference <= threshold) {
						return resolve();
					}

					const thirdSeek = seekToTime(element, desiredTime);
					currentCancel = thirdSeek.cancel;
					return thirdSeek.wait.then(() => {
						resolve();
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
