import type {Reader} from '../reader';

type ReturnType = {
	reader: Reader;
	contentLength: number | null;
	needsContentRange: boolean;
};

export const getLengthAndReader = async ({
	canLiveWithoutContentLength,
	res,
	ownController,
	requestedWithoutRange,
}: {
	canLiveWithoutContentLength: boolean;
	res: Response;
	ownController: AbortController;
	requestedWithoutRange: boolean;
}): Promise<ReturnType> => {
	const length = res.headers.get('content-length');
	const contentLength = length === null ? null : parseInt(length, 10);
	if (
		requestedWithoutRange ||
		(canLiveWithoutContentLength && contentLength === null)
	) {
		const buffer = await res.arrayBuffer();
		const encoded = new Uint8Array(buffer);

		let streamCancelled = false;
		const stream = new ReadableStream({
			start(controller) {
				if (ownController.signal.aborted) {
					return;
				}

				if (streamCancelled) {
					return;
				}

				try {
					controller.enqueue(encoded);
					controller.close();
				} catch {
					// sometimes on windows after aborting on node 16		: Invalid state: ReadableStreamDefaultController is not in a state where chunk can be enqueued
				}
			},
			cancel() {
				streamCancelled = true;
			},
		});

		return {
			contentLength: encoded.byteLength,
			reader: {
				reader: stream.getReader(),
				abort: () => {
					ownController.abort();
					return Promise.resolve();
				},
			},
			needsContentRange: false,
		};
	}

	if (!res.body) {
		throw new Error('No body');
	}

	const reader = res.body.getReader();

	return {
		reader: {
			reader,
			abort: () => {
				ownController.abort();
				return Promise.resolve();
			},
		},
		contentLength,
		needsContentRange: true,
	};
};
