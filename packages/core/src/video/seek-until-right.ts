export const seekToTime = (element: HTMLVideoElement, desiredTime: number) => {
	element.currentTime = desiredTime;

	let cancel: number;
	const prom = new Promise<number>((resolve) => {
		cancel = element.requestVideoFrameCallback((_cb, metadata) => {
			resolve(metadata.mediaTime);
		});
	});

	return {
		wait: prom,
		cancel: () => {
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

			if (difference < threshold) {
				return resolve();
			}

			const sign = desiredTime > seekedTo ? 1 : -1;

			const newSeek = seekToTime(element, seekedTo + threshold * sign);
			currentCancel = newSeek.cancel;
			newSeek.wait
				.then((newTime) => {
					const newDifference = Math.abs(desiredTime - newTime);

					if (newDifference < threshold) {
						return resolve();
					}

					const thirdSeek = seekToTime(element, desiredTime);
					currentCancel = thirdSeek.cancel;
					thirdSeek.wait.then(() => {
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
