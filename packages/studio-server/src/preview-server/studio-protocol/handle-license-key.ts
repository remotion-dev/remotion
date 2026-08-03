import type {IncomingMessage, ServerResponse} from 'node:http';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {z} from 'zod';
import {consumeStudioProtocolTarget} from '../element-install-state';
import type {LiveEventsServer} from '../live-events';
import {parseRequestBody, RequestBodyTooLargeError} from '../parse-body';
import {
	getAllowedLicenseKeyOrigin,
	setStudioProtocolCorsHeaders,
} from './origin-policy';
import {writeStudioProtocolError} from './protocol-response';

type FocusStudioTab = (studioUrl: string) => void;

const studioProtocolLicenseKeyRequestSchema = z.object({
	operation: z.literal('set-license-key'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	targetId: z.string().min(1),
	licenseKey: z.string(),
});

const MAX_STUDIO_PROTOCOL_LICENSE_KEY_BODY_SIZE = 4096;

export const handleStudioProtocolLicenseKey = async ({
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
	setStudioProtocolCorsHeaders({licenseKey: true, request, response});
	const requestOrigin = getAllowedLicenseKeyOrigin(request.headers.origin);
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
			message: 'Use POST to set a public license key.',
			response,
			status: 405,
		});
		return;
	}

	let body: unknown;
	try {
		body = await parseRequestBody(request, {
			maxBytes: MAX_STUDIO_PROTOCOL_LICENSE_KEY_BODY_SIZE,
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

	const parsedRequest = studioProtocolLicenseKeyRequestSchema.safeParse(body);
	if (!parsedRequest.success) {
		writeStudioProtocolError({
			code: 'unsupported-protocol',
			message: 'Invalid Remotion Studio Protocol request.',
			response,
			status: 400,
		});
		return;
	}

	if (
		!StudioProtocolInternals.isValidPublicLicenseKey(
			parsedRequest.data.licenseKey,
		)
	) {
		writeStudioProtocolError({
			code: 'invalid-license-key',
			message: 'The license key is not a valid public Remotion license key.',
			response,
			status: 400,
		});
		return;
	}

	const target = consumeStudioProtocolTarget({
		now: Date.now(),
		origin: requestOrigin,
		purpose: 'set-license-key',
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
		type: 'license-key-install-request',
		licenseKey: parsedRequest.data.licenseKey,
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
