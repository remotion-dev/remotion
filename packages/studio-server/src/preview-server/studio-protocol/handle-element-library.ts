import type {IncomingMessage, ServerResponse} from 'node:http';
import {z} from 'zod';
import {consumeStudioProtocolTarget} from '../element-install-state';
import type {LiveEventsServer} from '../live-events';
import {parseRequestBody, RequestBodyTooLargeError} from '../parse-body';
import {
	getAllowedStudioProtocolOrigin,
	setStudioProtocolCorsHeaders,
} from './origin-policy';
import {writeStudioProtocolError} from './protocol-response';

type FocusStudioTab = (studioUrl: string) => void;

const studioProtocolElementLibraryRequestSchema = z.object({
	operation: z.literal('add-element-library'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	targetId: z.string().min(1),
	url: z.string(),
	displayName: z.string().nullable(),
});

const MAX_STUDIO_PROTOCOL_ELEMENT_LIBRARY_BODY_SIZE = 16 * 1024;

export const handleStudioProtocolElementLibrary = async ({
	configFile,
	focusStudioTab,
	liveEventsServer,
	request,
	response,
}: {
	readonly configFile: string | null;
	readonly focusStudioTab: FocusStudioTab;
	readonly liveEventsServer: LiveEventsServer;
	readonly request: IncomingMessage;
	readonly response: ServerResponse;
}): Promise<void> => {
	setStudioProtocolCorsHeaders({request, response});
	const requestOrigin = getAllowedStudioProtocolOrigin(request.headers.origin);
	if (requestOrigin === null) {
		writeStudioProtocolError({
			code: 'unsupported-origin',
			message: 'Origin not allowed',
			response,
			status: 403,
		});
		return;
	}

	if (request.method !== 'POST') {
		writeStudioProtocolError({
			code: 'method-not-allowed',
			message: 'Use POST to add an Element catalog.',
			response,
			status: 405,
		});
		return;
	}

	let body: unknown;
	try {
		body = await parseRequestBody(request, {
			maxBytes: MAX_STUDIO_PROTOCOL_ELEMENT_LIBRARY_BODY_SIZE,
		});
	} catch (error) {
		if (error instanceof RequestBodyTooLargeError) {
			writeStudioProtocolError({
				code: 'request-too-large',
				message: 'The request body is too large.',
				response,
				status: 413,
			});
			return;
		}

		writeStudioProtocolError({
			code: 'invalid-request',
			message: 'The request body is not valid JSON.',
			response,
			status: 400,
		});
		return;
	}

	const parsedRequest =
		studioProtocolElementLibraryRequestSchema.safeParse(body);
	if (!parsedRequest.success) {
		writeStudioProtocolError({
			code: 'unsupported-protocol',
			message: 'Invalid Remotion Studio Protocol request.',
			response,
			status: 400,
		});
		return;
	}

	let normalizedUrl: string;
	try {
		const parsedUrl = new URL(parsedRequest.data.url);
		if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
			throw new Error('Unsupported protocol');
		}

		normalizedUrl = parsedUrl.href;
	} catch {
		writeStudioProtocolError({
			code: 'invalid-url',
			message: 'The Element catalog URL must be an absolute HTTP or HTTPS URL.',
			response,
			status: 400,
		});
		return;
	}

	const displayName = parsedRequest.data.displayName?.trim() ?? null;
	if (displayName === '') {
		writeStudioProtocolError({
			code: 'invalid-display-name',
			message: 'The Element catalog display name must not be empty.',
			response,
			status: 400,
		});
		return;
	}

	const target = consumeStudioProtocolTarget({
		now: Date.now(),
		origin: requestOrigin,
		purpose: 'add-element-library',
		targetId: parsedRequest.data.targetId,
	});
	if (target === null) {
		writeStudioProtocolError({
			code: 'target-expired',
			message: 'The selected Studio target is no longer available.',
			response,
			status: 409,
		});
		return;
	}

	if (configFile === null) {
		writeStudioProtocolError({
			code: 'no-config-file',
			message: 'The selected Studio did not load a Remotion config file.',
			response,
			status: 409,
		});
		return;
	}

	const delivered = liveEventsServer.sendEventToClientId(target.clientId, {
		type: 'element-library-add-request',
		url: normalizedUrl,
		displayName,
		origin: requestOrigin,
	});
	if (!delivered) {
		writeStudioProtocolError({
			code: 'target-expired',
			message: 'The selected Remotion Studio tab is no longer connected.',
			response,
			status: 409,
		});
		return;
	}

	focusStudioTab(target.studioUrl);

	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(
		JSON.stringify({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'awaiting-confirmation',
		}),
	);
};
