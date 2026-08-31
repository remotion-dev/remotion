import * as z from 'zod/mini';
import {
	parseStudioElementPayload,
	type StudioElementPayload,
} from './element-payload';
import type {StudioProtocolFetcher} from './studio-discovery';
import {
	discoverStudios,
	fetchWithTimeout,
	focusedStudioMaxAge,
	getInstallCapability,
	hasLegacyStudio,
	isAbortError,
	studioProtocolProbePorts,
} from './studio-discovery';
import {
	isAwaitingConfirmationResponse,
	parseStudioProtocolError,
} from './studio-response';

export type InstallInStudioErrorCode =
	| 'unsupported-origin'
	| 'no-compatible-studio'
	| 'studio-upgrade-required'
	| 'no-installable-target'
	| 'unsupported-protocol'
	| 'invalid-response'
	| 'target-expired'
	| 'request-rejected'
	| 'request-timed-out'
	| 'network-error';

export type InstallInStudioResult =
	| {
			readonly success: true;
			readonly status: 'awaiting-confirmation';
			readonly target: {
				readonly projectName: string | null;
				readonly compositionId: string;
				readonly studioOrigin: string;
				readonly studioVersion: string;
			};
	  }
	| {
			readonly success: false;
			readonly code: InstallInStudioErrorCode;
			readonly message: string;
	  };

export type InstallInStudioDependencies = {
	readonly fetchFn: StudioProtocolFetcher;
	readonly now: () => number;
	readonly ports: readonly number[];
	readonly pageOrigin: string | null;
};

export type StudioProtocolInstallRequest = {
	readonly operation: 'install-element';
	readonly protocol: 'remotion-studio-protocol';
	readonly protocolVersion: 1;
	readonly targetId: string;
	readonly payload: StudioElementPayload;
};

const studioProtocolInstallRequestEnvelopeSchema = z.object({
	operation: z.literal('install-element'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	targetId: z.string(),
	payload: z.unknown(),
});

export const parseStudioProtocolInstallRequest = (
	value: unknown,
):
	| {readonly status: 'valid'; readonly request: StudioProtocolInstallRequest}
	| {readonly status: 'invalid-request' | 'invalid-payload'} => {
	const envelope = z.safeParse(
		studioProtocolInstallRequestEnvelopeSchema,
		value,
	);
	if (!envelope.success) {
		return {status: 'invalid-request'};
	}

	const payload = parseStudioElementPayload(envelope.data.payload);
	if (payload === null) {
		return {status: 'invalid-payload'};
	}

	return {
		status: 'valid',
		request: {
			operation: envelope.data.operation,
			protocol: envelope.data.protocol,
			protocolVersion: envelope.data.protocolVersion,
			targetId: envelope.data.targetId,
			payload,
		},
	};
};

const failure = (
	code: InstallInStudioErrorCode,
	message: string,
): InstallInStudioResult => ({success: false, code, message});

export const isAllowedStudioProtocolPageOrigin = (
	origin: string | null,
): boolean => {
	if (origin === null) {
		return false;
	}

	try {
		const parsed = new URL(origin);
		return (
			parsed.protocol === 'https:' ||
			(parsed.protocol === 'http:' &&
				(parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'))
		);
	} catch {
		return false;
	}
};

export const installInStudioWithDependencies = async (
	payload: StudioElementPayload,
	dependencies: InstallInStudioDependencies,
): Promise<InstallInStudioResult> => {
	if (!isAllowedStudioProtocolPageOrigin(dependencies.pageOrigin)) {
		return failure(
			'unsupported-origin',
			'Install in Studio is only supported on HTTPS websites and local development origins.',
		);
	}

	const discovery = await discoverStudios(dependencies);
	if (discovery.studios.length === 0) {
		if (discovery.foundUnsupportedProtocol) {
			return failure(
				'unsupported-protocol',
				'The running Remotion Studio uses an unsupported Studio Protocol version.',
			);
		}

		if (await hasLegacyStudio(dependencies)) {
			return failure(
				'studio-upgrade-required',
				'This Remotion Studio does not support the Remotion Studio Protocol. Upgrade Remotion to 4.0.502 or newer.',
			);
		}

		if (discovery.foundInvalidResponse) {
			return failure(
				'invalid-response',
				'Remotion Studio returned an invalid Studio Protocol response.',
			);
		}

		return failure(
			'no-compatible-studio',
			'Start Remotion Studio and open a composition, then try again.',
		);
	}

	const supportedStudios = discovery.studios.flatMap((studio) => {
		const capability = getInstallCapability(studio.descriptor);
		return capability?.payloadVersions.includes(1)
			? [{...studio, capability}]
			: [];
	});
	if (supportedStudios.length === 0) {
		return failure(
			'unsupported-protocol',
			'The running Remotion Studio cannot install this Element payload version.',
		);
	}

	const now = dependencies.now();
	const installable = supportedStudios
		.filter(({capability}) => {
			const {target} = capability;
			return (
				target !== null &&
				target.expiresAt > now &&
				now - target.lastFocusedAt < focusedStudioMaxAge
			);
		})
		.sort((a, b) => {
			const focusDifference =
				b.capability.target!.lastFocusedAt - a.capability.target!.lastFocusedAt;
			return focusDifference === 0
				? b.discoveredAt - a.discoveredAt
				: focusDifference;
		});
	const selected = installable[0];
	const selectedTarget = selected?.capability.target;
	if (!selected || selectedTarget === null || selectedTarget === undefined) {
		return failure(
			'no-installable-target',
			'Focus a composition in a Remotion Studio that is not read-only, then try again.',
		);
	}

	let response: Response;
	try {
		const requestBody = {
			operation: 'install-element',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId: selectedTarget.id,
			payload,
		} satisfies StudioProtocolInstallRequest;
		response = await fetchWithTimeout({
			fetchFn: dependencies.fetchFn,
			url: `${selected.origin}/api/studio-protocol/install`,
			options: {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(requestBody),
			},
		});
	} catch (error) {
		return failure(
			isAbortError(error) ? 'request-timed-out' : 'network-error',
			isAbortError(error)
				? 'The request to Remotion Studio timed out.'
				: 'Could not connect to Remotion Studio.',
		);
	}

	let result: unknown;
	try {
		result = await response.json();
	} catch {
		return failure(
			'invalid-response',
			'Remotion Studio returned an invalid installation response.',
		);
	}

	if (response.ok && isAwaitingConfirmationResponse(result)) {
		return {
			success: true,
			status: 'awaiting-confirmation',
			target: {
				projectName: selected.descriptor.projectName,
				compositionId: selectedTarget.compositionId,
				studioOrigin: selected.origin,
				studioVersion: selected.descriptor.studioVersion,
			},
		};
	}

	const protocolError = parseStudioProtocolError(result);
	if (protocolError !== null) {
		return failure(
			protocolError.code === 'target-expired'
				? 'target-expired'
				: 'request-rejected',
			protocolError.message,
		);
	}

	return failure(
		'invalid-response',
		'Remotion Studio returned an invalid installation response.',
	);
};

export const installInStudio = ({
	payload,
}: {
	readonly payload: StudioElementPayload;
}): Promise<InstallInStudioResult> => {
	return installInStudioWithDependencies(payload, {
		fetchFn: fetch,
		now: Date.now,
		pageOrigin:
			typeof globalThis.location === 'undefined'
				? null
				: globalThis.location.origin,
		ports: studioProtocolProbePorts,
	});
};
