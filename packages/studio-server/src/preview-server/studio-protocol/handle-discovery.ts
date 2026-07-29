import type {IncomingMessage, ServerResponse} from 'node:http';
import path from 'node:path';
import type {GitSource} from '@remotion/studio-shared';
import {getProjectName} from '@remotion/studio-shared';
import {VERSION} from 'remotion/version';
import {
	ELEMENT_INSTALL_TARGET_MAX_AGE,
	getElementInstallTarget,
	issueStudioProtocolTarget,
} from '../element-install-state';
import type {LiveEventsServer} from '../live-events';
import {
	isAllowedStudioProtocolOrigin,
	setStudioProtocolCorsHeaders,
} from './origin-policy';
import {writeStudioProtocolError} from './protocol-response';

const ELEMENT_INSTALL_FOCUS_MAX_AGE = 5 * 60 * 1000;
export const ELEMENT_INSTALL_TARGET_RESPONSE_WAIT = 250;

const requestInstallTarget = ({
	liveEventsServer,
}: {
	readonly liveEventsServer: LiveEventsServer;
}) => {
	const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	liveEventsServer.sendEventToClient({
		type: 'request-element-install-target',
		requestId,
	});
	return requestId;
};

const getLiveInstallableTarget = (requestId: string) => {
	const target = getElementInstallTarget(requestId);
	const now = Date.now();
	if (
		target === null ||
		now - target.updatedAt >= ELEMENT_INSTALL_TARGET_MAX_AGE ||
		target.lastFocusedAt === null ||
		now - target.lastFocusedAt >= ELEMENT_INSTALL_FOCUS_MAX_AGE ||
		!target.canInstall ||
		target.readOnly ||
		target.compositionFile === null ||
		target.compositionId === null
	) {
		return null;
	}

	return target;
};

const getProject = ({
	gitSource,
	remotionRoot,
}: {
	readonly gitSource: GitSource | null;
	readonly remotionRoot: string;
}) =>
	getProjectName({
		basename: path.basename,
		gitSource,
		resolvedRemotionRoot: remotionRoot,
	});

export const handleStudioProtocolDiscovery = ({
	gitSource,
	liveEventsServer,
	remotionRoot,
	request,
	response,
}: {
	readonly gitSource: GitSource | null;
	readonly liveEventsServer: LiveEventsServer;
	readonly remotionRoot: string;
	readonly request: IncomingMessage;
	readonly response: ServerResponse;
}): Promise<void> => {
	setStudioProtocolCorsHeaders({request, response});
	if (!isAllowedStudioProtocolOrigin(request.headers.origin)) {
		writeStudioProtocolError({
			code: 'unsupported-origin',
			message: 'Origin not allowed',
			response,
			status: 403,
		});
		return Promise.resolve();
	}

	if (request.method !== 'GET') {
		writeStudioProtocolError({
			code: 'method-not-allowed',
			message: 'Use GET for Studio Protocol discovery.',
			response,
			status: 405,
		});
		return Promise.resolve();
	}

	const requestId = requestInstallTarget({liveEventsServer});
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			const now = Date.now();
			const target = getLiveInstallableTarget(requestId);
			const issued =
				target === null ? null : issueStudioProtocolTarget({now, target});
			response.writeHead(200, {
				'Cache-Control': 'no-store',
				'Content-Type': 'application/json',
			});
			response.end(
				JSON.stringify({
					protocol: 'remotion-studio-protocol',
					protocolVersion: 1,
					studioVersion: VERSION,
					capabilities: {
						install: [
							{
								payloadType: 'remotion-element',
								payloadVersions: [1],
							},
						],
					},
					projectName: getProject({gitSource, remotionRoot}),
					installTarget:
						issued === null || target === null
							? null
							: {
									id: issued.id,
									expiresAt: issued.expiresAt,
									compositionId: target.compositionId,
									lastFocusedAt: target.lastFocusedAt,
								},
				}),
			);
			resolve();
		}, ELEMENT_INSTALL_TARGET_RESPONSE_WAIT);
	});
};
