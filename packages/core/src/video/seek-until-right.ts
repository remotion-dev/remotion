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

export const seekToTimeMultipleUntilRight = async (
	element: HTMLVideoElement,
	desiredTime: number,
	fps: number,
) => {
	const seekedTo = await seekToTime(element, desiredTime).wait;
	const difference = Math.abs(desiredTime - seekedTo);
	const threshold = 1 / fps;
	const ident = Math.random();

	if (difference > threshold) {
		console.log(
			ident,
			'seekedTo',
			seekedTo,
			'desiredTime',
			desiredTime,
			'difference',
			difference,
			'threshold',
			threshold,
		);
		const sign = desiredTime > seekedTo ? 1 : -1;

		const newTime = await seekToTime(
			element,
			desiredTime + (threshold / 2) * sign,
		).wait;
		console.log(
			ident,
			'before',
			seekedTo,
			'after',
			newTime,
			'desired',
			desiredTime,
		);
	}
};
