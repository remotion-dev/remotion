import {Readable} from 'stream';

export function streamToString(stream: Readable) {
	const chunks: Buffer[] = [];
	return new Promise<string>((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}
