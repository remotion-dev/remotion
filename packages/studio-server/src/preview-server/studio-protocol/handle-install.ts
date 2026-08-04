import type {IncomingMessage, ServerResponse} from 'node:http';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import type {ElementInstallRequest} from '@remotion/studio-shared';
import {z} from 'zod';
import type {getElementInstallTarget} from '../element-install-state';
import {consumeStudioProtocolTarget} from '../element-install-state';
import type {LiveEventsServer} from '../live-events';
import {parseRequestBody, RequestBodyTooLargeError} from '../parse-body';
import {
	getAllowedStudioProtocolOrigin,
	setStudioProtocolCorsHeaders,
} from './origin-policy';
import {writeStudioProtocolError} from './protocol-response';

type FocusStudioTab = (studioUrl: string) => void;

const studioProtocolInstallRequestSchema = z.object({
	operation: z.literal('install-element'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	targetId: z.string(),
	payload: z.unknown(),
});

// A valid payload may contain 250,000 JSON characters. Allow room for its
// UTF-8 representation and the protocol envelope while keeping memory bounded.
const MAX_STUDIO_PROTOCOL_INSTALL_BODY_SIZE = 1_000_000;

const deliverElementInstall = ({
	element,
	focusStudioTab,
	liveEventsServer,
	origin,
	target,
}: {
	readonly element: ElementInstallRequest['element'];
	readonly focusStudioTab: FocusStudioTab;
	readonly liveEventsServer: LiveEventsServer;
	readonly origin: string;
	readonly target: NonNullable<ReturnType<typeof getElementInstallTarget>>;
}): boolean => {
	if (target.compositionFile === null || target.compositionId === null) {
		return false;
	}

	const installRequest: ElementInstallRequest = {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		clientId: target.clientId,
		createdAt: Date.now(),
		compositionFile: target.compositionFile,
		compositionId: target.compositionId,
		element,
		from: null,
		position: null,
		source: {
			type: 'studio-protocol',
			origin,
		},
	};

	const delivered = liveEventsServer.sendEventToClientId(target.clientId, {
		type: 'element-install-request',
		request: installRequest,
	});
	if (delivered) {
		focusStudioTab(target.studioUrl);
	}

	return delivered;
};

export const handleStudioProtocolInstall = async ({
	focusStudioTab,
	liveEventsServer,
	request,
	response,
}: {
	readonly focusStudioTab: FocusStudioTab;
	readonly liveEventsServer: LiveEventsServer;
	readonly request: IncomingMessage;
	readonly response: ServerResponse;
}): Promise<void> => {
	setStudioProtocolCorsHeaders({licenseKey: false, request, response});
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
			message: 'Use POST to request an Element installation.',
			response,
			status: 405,
		});
		return;
	}

	let body: unknown;
	try {
		body = await parseRequestBody(request, {
			maxBytes: MAX_STUDIO_PROTOCOL_INSTALL_BODY_SIZE,
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

	const parsedRequest = studioProtocolInstallRequestSchema.safeParse(body);
	if (!parsedRequest.success) {
		writeStudioProtocolError({
			code: 'unsupported-protocol',
			message: 'Invalid Remotion Studio Protocol request.',
			response,
			status: 400,
		});
		return;
	}

	const payload = StudioProtocolInternals.parseStudioElementPayload(
		parsedRequest.data.payload,
	);
	if (payload === null) {
		writeStudioProtocolError({
			code: 'invalid-payload',
			message: 'Invalid Element payload.',
			response,
			status: 400,
		});
		return;
	}

	const target = consumeStudioProtocolTarget({
		now: Date.now(),
		origin: requestOrigin,
		purpose: 'install-element',
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

	if (
		!deliverElementInstall({
			element: payload.element,
			focusStudioTab,
			liveEventsServer,
			origin: requestOrigin,
			target,
		})
	) {
		writeStudioProtocolError({
			code: 'target-expired',
			message: 'The selected Remotion Studio tab is no longer connected.',
			response,
			status: 409,
		});
		return;
	}

	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(
		JSON.stringify({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'awaiting-confirmation',
		}),
	);
};
