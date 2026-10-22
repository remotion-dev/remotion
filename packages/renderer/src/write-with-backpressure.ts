import type {Writable} from 'node:stream';

export const writeWithBackpressure = ({
	data,
	writable,
}: {
	data: Buffer;
	writable: Writable;
}): Promise<void> => {
	if (writable.write(data)) {
		return Promise.resolve();
	}

	return new Promise<void>((resolve, reject) => {
		const cleanup = () => {
			writable.off('close', onClose);
			writable.off('drain', onDrain);
			writable.off('error', onError);
		};

		const onClose = () => {
			cleanup();
			reject(
				new Error('The writable stream closed before it accepted all data.'),
			);
		};

		const onDrain = () => {
			cleanup();
			resolve();
		};

		const onError = (error: Error) => {
			cleanup();
			reject(error);
		};

		writable.once('close', onClose);
		writable.once('drain', onDrain);
		writable.once('error', onError);

		if (writable.destroyed) {
			onClose();
		}
	});
};
