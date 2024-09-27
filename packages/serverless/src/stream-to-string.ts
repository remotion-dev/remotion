import type {Readable} from 'stream';

export function streamToString(stream: Readable | Buffer) {
	if (Buffer.isBuffer(stream)) {
		return stream.toString('utf-8');
	}

	const chunks: Uint8Array[] = [];
	return new Promise<string>((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}
