import type {IncomingMessage, ServerResponse} from 'node:http';
import path from 'node:path';
import type {GitSource} from '@remotion/studio-shared';
import {getProjectName} from '@remotion/studio-shared';
import {VERSION} from 'remotion/version';
import type {ElementInstallTarget} from '../element-install-state';
import {
	ELEMENT_INSTALL_TARGET_MAX_AGE,
	getElementInstallTarget,
	issueStudioProtocolTarget,
	subscribeToElementInstallTargets,
} from '../element-install-state';
import type {LiveEventsServer} from '../live-events';
import {
	getAllowedStudioProtocolOrigin,
	setStudioProtocolCorsHeaders,
} from './origin-policy';
import {writeStudioProtocolError} from './protocol-response';

// Leave time to return the descriptor before the protocol client's 2-second deadline.
export const ELEMENT_INSTALL_TARGET_RESPONSE_WAIT = 1500;

const requestInstallTarget = ({
	liveEventsServer,
	response,
}: {
	readonly liveEventsServer: LiveEventsServer;
	readonly response: ServerResponse;
}): Promise<ElementInstallTarget | null> => {
	const clients = new Set(liveEventsServer.getClientIds());
	if (clients.size === 0) return Promise.resolve(null);
	const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return new Promise((resolve) => {
		// Another discovery can overwrite the latest target cached for a client.
		// Keep this request's replies until every known client answers or time runs out.
		const targets = new Map<string, ElementInstallTarget>();
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			unsubscribe();
			response.off('close', finish);
			const connected = new Set(liveEventsServer.getClientIds());
			for (const clientId of targets.keys()) {
				if (!connected.has(clientId)) targets.delete(clientId);
			}

			resolve(getLiveStudioTarget(requestId, targets));
		};

		const unsubscribe = subscribeToElementInstallTargets((target) => {
			if (target.requestId !== requestId || !clients.has(target.clientId))
				return;
			targets.set(target.clientId, target);
			if (targets.size === clients.size) finish();
		});
		const timeout = setTimeout(finish, ELEMENT_INSTALL_TARGET_RESPONSE_WAIT);
		response.once('close', finish);
		liveEventsServer.sendEventToClient({
			type: 'request-element-install-target',
			requestId,
		});
	});
};

const getLiveStudioTarget = (
	requestId: string,
	targets: Map<string, ElementInstallTarget>,
) => {
	const target = getElementInstallTarget(requestId, targets);
	const now = Date.now();
	if (
		target === null ||
		now - target.updatedAt >= ELEMENT_INSTALL_TARGET_MAX_AGE ||
		target.readOnly
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
	const requestOrigin = getAllowedStudioProtocolOrigin(request);
	if (requestOrigin === null) {
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

	return requestInstallTarget({liveEventsServer, response}).then((target) => {
		if (!response.destroyed) {
			const now = Date.now();
			const installTarget = target;
			const issuedInstallTarget =
				installTarget === null
					? null
					: issueStudioProtocolTarget({
							now,
							origin: requestOrigin,
							purpose: 'install-element',
							target: installTarget,
						});
			const issuedLicenseKeyTarget =
				target === null || target.lastFocusedAt === null
					? null
					: issueStudioProtocolTarget({
							now,
							origin: requestOrigin,
							purpose: 'set-license-key',
							target,
						});
			const issuedElementLibraryTarget =
				target === null || target.lastFocusedAt === null
					? null
					: issueStudioProtocolTarget({
							now,
							origin: requestOrigin,
							purpose: 'add-element-library',
							target,
						});
			response.writeHead(200, {
				'Cache-Control': 'no-store',
				'Content-Type': 'application/json',
			});
			response.end(
				JSON.stringify({
					protocol: 'remotion-studio-protocol',
					protocolVersion: 1,
					studioVersion: VERSION,
					projectName: getProject({gitSource, remotionRoot}),
					capabilities: [
						{
							type: 'install-element',
							payloadType: 'remotion-element',
							payloadVersions: [1, 2],
							target:
								issuedInstallTarget === null || installTarget === null
									? null
									: {
											id: issuedInstallTarget.id,
											expiresAt: issuedInstallTarget.expiresAt,
											compositionId: installTarget.compositionId,
											lastFocusedAt: installTarget.lastFocusedAt,
										},
						},
						{
							type: 'set-license-key',
							target:
								issuedLicenseKeyTarget === null ||
								target === null ||
								target.lastFocusedAt === null
									? null
									: {
											id: issuedLicenseKeyTarget.id,
											expiresAt: issuedLicenseKeyTarget.expiresAt,
											lastFocusedAt: target.lastFocusedAt,
										},
						},
						{
							type: 'add-element-library',
							target:
								issuedElementLibraryTarget === null ||
								target === null ||
								target.lastFocusedAt === null
									? null
									: {
											id: issuedElementLibraryTarget.id,
											expiresAt: issuedElementLibraryTarget.expiresAt,
											lastFocusedAt: target.lastFocusedAt,
										},
						},
					],
				}),
			);
		}
	});
};
