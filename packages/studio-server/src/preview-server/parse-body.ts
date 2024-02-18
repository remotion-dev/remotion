import type {IncomingMessage} from 'node:http';

export const parseRequestBody = async (
	req: IncomingMessage,
): Promise<unknown> => {
	const body = await new Promise<string>((_resolve) => {
		let data = '';
		req.on('data', (chunk) => {
			data += chunk;
		});
		req.on('end', () => {
			_resolve(data.toString());
		});
	});

	return JSON.parse(body);
};

export const parseMultipartRequestBody = async (
	req: IncomingMessage,
): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const data: Buffer[] = [];
		req.on('data', (chunk: Buffer) => {
			data.push(chunk);
		});
		req.on('end', () => {
			resolve(Buffer.concat(data));
		});
		req.on('error', (err) => {
			reject(err);
		});
	});
};
