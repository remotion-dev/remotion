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
} from '../element-install-state';
import type {LiveEventsServer} from '../live-events';
import {
	getAllowedLicenseKeyOrigin,
	getAllowedStudioProtocolOrigin,
	setStudioProtocolCorsHeaders,
} from './origin-policy';
import {writeStudioProtocolError} from './protocol-response';

const STUDIO_PROTOCOL_FOCUS_MAX_AGE = 5 * 60 * 1000;
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

const getLiveStudioTarget = (requestId: string) => {
	const target = getElementInstallTarget(requestId);
	const now = Date.now();
	if (
		target === null ||
		now - target.updatedAt >= ELEMENT_INSTALL_TARGET_MAX_AGE ||
		target.lastFocusedAt === null ||
		now - target.lastFocusedAt >= STUDIO_PROTOCOL_FOCUS_MAX_AGE ||
		target.readOnly
	) {
		return null;
	}

	return target;
};

const isInstallableTarget = (
	target: ElementInstallTarget | null,
): target is ElementInstallTarget & {
	readonly compositionFile: string;
	readonly compositionId: string;
	readonly lastFocusedAt: number;
} =>
	target !== null &&
	target.canInstall &&
	target.compositionFile !== null &&
	target.compositionId !== null &&
	target.lastFocusedAt !== null;

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
	setStudioProtocolCorsHeaders({licenseKey: false, request, response});
	const requestOrigin = getAllowedStudioProtocolOrigin(request.headers.origin);
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

	const requestId = requestInstallTarget({liveEventsServer});
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			const now = Date.now();
			const target = getLiveStudioTarget(requestId);
			const installTarget = isInstallableTarget(target) ? target : null;
			const issuedInstallTarget =
				installTarget === null
					? null
					: issueStudioProtocolTarget({
							now,
							origin: requestOrigin,
							purpose: 'install-element',
							target: installTarget,
						});
			const licenseKeyOrigin = getAllowedLicenseKeyOrigin(
				request.headers.origin,
			);
			const issuedLicenseKeyTarget =
				target === null || licenseKeyOrigin === null
					? null
					: issueStudioProtocolTarget({
							now,
							origin: licenseKeyOrigin,
							purpose: 'set-license-key',
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
							payloadVersions: [1],
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
					],
				}),
			);
			resolve();
		}, ELEMENT_INSTALL_TARGET_RESPONSE_WAIT);
	});
};
