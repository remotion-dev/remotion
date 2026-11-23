import {ELEMENT_PAYLOAD_MIME_TYPE} from '@remotion/studio-protocol';
import {StudioServerInternals} from '@remotion/studio-server';

const FETCH_TIMEOUT_IN_MILLISECONDS = 30_000;
const MAX_PAGE_SIZE_IN_BYTES = 20 * 1024 * 1024;

export const fetchElementPage = async (url: URL) => {
	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		FETCH_TIMEOUT_IN_MILLISECONDS,
	);
	let response: Awaited<ReturnType<typeof StudioServerInternals.httpGet>>;
	try {
		response = await StudioServerInternals.httpGet({
			url,
			headers: {
				accept: `text/html, ${ELEMENT_PAYLOAD_MIME_TYPE}, application/json;q=0.9, */*;q=0.8`,
			},
			signal: controller.signal,
			maxSize: MAX_PAGE_SIZE_IN_BYTES,
			tooLargeMessage: `The response is larger than ${MAX_PAGE_SIZE_IN_BYTES / 1024 / 1024}MB.`,
			maxRedirects: 10,
			validateUrl: null,
		});
	} catch (err) {
		throw new Error(
			`Could not fetch ${url.href}: ${controller.signal.aborted ? `Timed out after ${FETCH_TIMEOUT_IN_MILLISECONDS / 1000} seconds.` : (err as Error).message}`,
		);
	} finally {
		clearTimeout(timeout);
	}

	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new Error(
			`Could not fetch ${url.href}: The server responded with HTTP ${response.statusCode}.`,
		);
	}

	return {
		text: new TextDecoder().decode(response.body),
		url: response.url,
		isJson: /json/i.test(response.headers['content-type'] ?? ''),
	};
};
