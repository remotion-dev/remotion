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

		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(encoded);
				controller.close();
			},
		});

		return {
			contentLength: encoded.byteLength,
			reader: {
				reader: stream.getReader(),
				abort() {
					ownController.abort();
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
			},
		},
		contentLength,
		needsContentRange: true,
	};
};
