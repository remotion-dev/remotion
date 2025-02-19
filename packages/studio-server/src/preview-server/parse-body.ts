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
