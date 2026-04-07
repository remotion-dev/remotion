import type {StreamTargetChunk} from 'mediabunny';

const canUseCreateWritable = async (): Promise<boolean> => {
	if (!('storage' in navigator)) {
		return false;
	}

	if (!('getDirectory' in navigator.storage)) {
		return false;
	}

	try {
		const directoryHandle = await navigator.storage.getDirectory();
		const fileHandle = await directoryHandle.getFileHandle(
			'remotion-probe-web-fs-support',
			{
				create: true,
			},
		);

		const writable = await fileHandle.createWritable();
		await writable.close();
		return true;
	} catch {
		return false;
	}
};

const makeWebFsTargetWithFs = async (filename: string) => {
	const directoryHandle = await navigator.storage.getDirectory();
	const actualFilename = `__remotion_convert:${filename}`;

	const remove = async () => {
		try {
			await directoryHandle.removeEntry(actualFilename, {
				recursive: true,
			});
		} catch {}
	};

	await remove();

	const fileHandle = await directoryHandle.getFileHandle(actualFilename, {
		create: true,
	});
	const writable = await fileHandle.createWritable();

	let written = 0;

	const writableStream = new WritableStream({
		async write(chunk: StreamTargetChunk) {
			await writable.seek(chunk.position);
			await writable.write(chunk);
			written += chunk.data.byteLength;
		},
	});

	const getBlob = async () => {
		const newHandle = await directoryHandle.getFileHandle(actualFilename, {
			create: true,
		});
		const newFile = await newHandle.getFile();
		return newFile;
	};

	return {
		stream: writableStream,
		getBlob,
		getWrittenByteCount: () => written,
		close: () => writable.close(),
	};
};

const makeWebFsTargetInMemory = (filename: string) => {
	let buffer = new Uint8Array(1024 * 1024);
	let length = 0;
	let written = 0;

	const ensureCapacity = (needed: number) => {
		if (needed <= buffer.byteLength) {
			return;
		}

		let newSize = buffer.byteLength;
		while (newSize < needed) {
			newSize *= 2;
		}

		const newBuffer = new Uint8Array(newSize);
		newBuffer.set(buffer);
		buffer = newBuffer;
	};

	const writableStream = new WritableStream({
		write(chunk: StreamTargetChunk) {
			const end = chunk.position + chunk.data.byteLength;
			ensureCapacity(end);
			buffer.set(new Uint8Array(chunk.data), chunk.position);
			if (end > length) {
				length = end;
			}

			written += chunk.data.byteLength;
		},
	});

	const getBlob = (): Promise<File> =>
		Promise.resolve(
			new File([buffer.slice(0, length)], filename, {
				lastModified: Date.now(),
			}),
		);

	return {
		stream: writableStream,
		getBlob,
		getWrittenByteCount: () => written,
		close: () => {},
	};
};

export const makeWebFsTarget = async (filename: string) => {
	const canUse = await canUseCreateWritable();
	if (canUse) {
		return makeWebFsTargetWithFs(filename);
	}

	return makeWebFsTargetInMemory(filename);
};
