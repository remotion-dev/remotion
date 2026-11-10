import http from 'node:http';

type NodeFetchResponse = {
	ok: boolean;
	status: number;
	// Like Response.json() of the global fetch()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json: () => Promise<any>;
	arrayBuffer: () => Promise<ArrayBuffer>;
};

// Use this instead of the global fetch() in test code that runs in Node.
// The undici in Node 25.9 calls socket.setTypeOfService() on every new
// connection without catching errors. On macOS, that throws
// "setTypeOfService EINVAL" if the server reset the connection before the
// request was written, which can happen while Studio starts or stops. The error
// is thrown from a socket callback, so a try/catch around fetch() can't catch
// it, and Playwright reports it as a failure of the test that is running.
// node:http does not set the type of service.
export const nodeFetch = (
	url: string,
	init: {
		method: 'GET' | 'POST';
		headers: Record<string, string>;
		body: string | null;
	} | null,
): Promise<NodeFetchResponse> => {
	return new Promise((resolve, reject) => {
		const request = http.request(
			url,
			{
				method: init?.method ?? 'GET',
				headers: init?.headers ?? {},
				agent: false,
			},
			(response) => {
				const chunks: Buffer[] = [];
				response.on('data', (chunk: Buffer) => chunks.push(chunk));
				response.on('error', reject);
				response.on('end', () => {
					const body = Buffer.concat(chunks);
					const status = response.statusCode ?? 0;
					resolve({
						ok: status >= 200 && status < 300,
						status,
						json: () => Promise.resolve(JSON.parse(body.toString('utf-8'))),
						arrayBuffer: () =>
							Promise.resolve(
								body.buffer.slice(
									body.byteOffset,
									body.byteOffset + body.byteLength,
								) as ArrayBuffer,
							),
					});
				});
			},
		);
		request.on('error', reject);
		request.end(init?.body ?? undefined);
	});
};
