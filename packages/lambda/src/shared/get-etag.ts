import crypto from 'node:crypto';
import fs from 'node:fs';

const chunk = 1024 * 1024 * 5; // 5MB

const md5 = (data: Buffer) =>
	crypto.createHash('md5').update(data).digest('hex');

export const getEtagOfFile = (
	filePath: string,
	onProgress: (bytes: number) => void,
) => {
	const calc = async () => {
		const size = await fs.promises.stat(filePath).then((s) => s.size);

		if (size <= chunk) {
			const buffer = await fs.promises.readFile(filePath);
			return `"${md5(buffer)}"`;
		}

		const stream = fs.createReadStream(filePath, {
			highWaterMark: chunk,
		});

		const md5Chunks: string[] = [];
		const chunksNumber = Math.ceil(size / chunk);

		return new Promise<string>((resolve, reject) => {
			stream.on('data', (c) => {
				md5Chunks.push(md5(c as Buffer));
				onProgress(c.length);
			});
			stream.on('end', () => {
				resolve(
					`"${md5(Buffer.from(md5Chunks.join(''), 'hex'))}-${chunksNumber}"`,
				);
			});
			stream.on('error', (err) => {
				reject(err);
			});
		});
	};

	let tag: string | null = null;

	return async () => {
		if (tag !== null) {
			return tag;
		}

		tag = await calc();
		return tag;
	};
};
