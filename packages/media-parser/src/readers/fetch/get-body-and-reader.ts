import type {Reader} from '../reader';

type ReturnType = {
	reader: Reader;
	contentLength: number | null;
	needsContentRange: boolean;
};

export const getLengthAndReader = async (
	endsWithM3u8: boolean,
	res: Response,
	ownController: AbortController,
): Promise<ReturnType> => {
	if (endsWithM3u8) {
		const text = await res.text();

		const encoded = new TextEncoder().encode(text);

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

	const length = res.headers.get('content-length');
	const contentLength = length === null ? null : parseInt(length, 10);

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
