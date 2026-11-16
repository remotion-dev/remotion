import http from 'node:http';
import https from 'node:https';

export type HttpGetResponse = {
	readonly statusCode: number;
	readonly headers: http.IncomingHttpHeaders;
	/** The URL after following redirects. */
	readonly url: URL;
	readonly body: Uint8Array;
};

// Uses `node:http` instead of `fetch()`, which Node.js 16 does not have.
export const httpGet = async ({
	url,
	headers,
	signal,
	maxSize,
	tooLargeMessage,
	maxRedirects,
	validateUrl,
}: {
	url: URL;
	headers: Record<string, string>;
	signal: AbortSignal;
	maxSize: number;
	tooLargeMessage: string;
	maxRedirects: number;
	/** Called before every request, including requests for redirects. */
	validateUrl: ((url: URL) => Promise<void>) | null;
}): Promise<HttpGetResponse> => {
	let currentUrl = url;

	for (let redirects = 0; ; redirects++) {
		if (validateUrl !== null) {
			await validateUrl(currentUrl);
		}

		const client =
			currentUrl.protocol === 'https:'
				? https
				: currentUrl.protocol === 'http:'
					? http
					: null;
		if (client === null) {
			throw new Error(
				`Only HTTP(S) URLs are supported, got ${currentUrl.href}`,
			);
		}

		const requestUrl = currentUrl;
		const response = await new Promise<http.IncomingMessage>(
			(resolve, reject) => {
				const request = client.get(requestUrl, {headers, signal}, resolve);
				request.on('error', reject);
			},
		);
		const statusCode = response.statusCode ?? 0;

		if (statusCode >= 300 && statusCode < 400) {
			response.resume();
			const {location} = response.headers;
			if (location === undefined) {
				throw new Error(
					`${currentUrl.href} redirected without a Location header`,
				);
			}

			if (redirects >= maxRedirects) {
				throw new Error(`${url.href} redirected too many times`);
			}

			currentUrl = new URL(location, currentUrl);
			continue;
		}

		const body = await new Promise<Uint8Array>((resolve, reject) => {
			const contentLength = Number(response.headers['content-length']);
			if (Number.isFinite(contentLength) && contentLength > maxSize) {
				response.destroy();
				reject(new Error(tooLargeMessage));
				return;
			}

			const chunks: Uint8Array[] = [];
			let size = 0;
			response.on('data', (chunk: Uint8Array) => {
				size += chunk.byteLength;
				if (size > maxSize) {
					response.destroy();
					reject(new Error(tooLargeMessage));
					return;
				}

				chunks.push(chunk);
			});
			response.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
			response.on('error', reject);
			response.on('close', () => {
				if (!response.complete) {
					reject(new Error(`Connection to ${requestUrl.href} closed early`));
				}
			});
		});

		return {statusCode, headers: response.headers, url: currentUrl, body};
	}
};
