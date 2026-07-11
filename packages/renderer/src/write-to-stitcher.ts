import type {Writable} from 'node:stream';

export const writeToStitcher = ({
	buffer,
	stdin,
}: {
	buffer: Buffer;
	stdin: Writable;
}): Promise<void> => {
	if (stdin.destroyed || !stdin.writable) {
		return Promise.reject(new Error('ERR_STREAM_PREMATURE_CLOSE'));
	}

	return new Promise<void>((resolve, reject) => {
		let settled = false;

		const cleanup = () => {
			stdin.removeListener('drain', onDrain);
			stdin.removeListener('error', onError);
			stdin.removeListener('close', onClose);
		};

		const settle = (error?: unknown) => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		};

		const onDrain = () => settle();
		const onError = (error: Error) => settle(error);
		const onClose = () => settle(new Error('ERR_STREAM_PREMATURE_CLOSE'));

		stdin.on('drain', onDrain);
		stdin.on('error', onError);
		stdin.on('close', onClose);

		try {
			if (stdin.write(buffer)) {
				settle();
			}
		} catch (error) {
			settle(error);
		}
	});
};
