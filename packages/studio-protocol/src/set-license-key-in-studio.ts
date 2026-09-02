import * as z from 'zod/mini';
import {isValidPublicLicenseKey} from './license-key';
import type {StudioProtocolFetcher} from './studio-discovery';
import {
	discoverStudios,
	fetchWithTimeout,
	focusedStudioMaxAge,
	getSetLicenseKeyCapability,
	isAbortError,
	studioProtocolProbePorts,
} from './studio-discovery';
import {
	isAwaitingConfirmationResponse,
	parseStudioProtocolError,
} from './studio-response';

export type SetLicenseKeyInStudioErrorCode =
	| 'invalid-license-key'
	| 'no-compatible-studio'
	| 'studio-upgrade-required'
	| 'no-configurable-target'
	| 'unsupported-protocol'
	| 'invalid-response'
	| 'target-expired'
	| 'no-config-file'
	| 'request-rejected'
	| 'request-timed-out'
	| 'network-error';

export type SetLicenseKeyInStudioResult =
	| {
			readonly success: true;
			readonly status: 'awaiting-confirmation';
			readonly target: {
				readonly projectName: string | null;
				readonly studioOrigin: string;
				readonly studioVersion: string;
			};
	  }
	| {
			readonly success: false;
			readonly code: SetLicenseKeyInStudioErrorCode;
			readonly message: string;
	  };

export type SetLicenseKeyInStudioDependencies = {
	readonly fetchFn: StudioProtocolFetcher;
	readonly now: () => number;
	readonly ports: readonly number[];
};

export type StudioProtocolSetLicenseKeyRequest = {
	readonly operation: 'set-license-key';
	readonly protocol: 'remotion-studio-protocol';
	readonly protocolVersion: 1;
	readonly targetId: string;
	readonly licenseKey: string;
};

const studioProtocolSetLicenseKeyRequestSchema = z.object({
	operation: z.literal('set-license-key'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	targetId: z.string().check(z.minLength(1)),
	licenseKey: z.string(),
});

export const parseStudioProtocolSetLicenseKeyRequest = (
	value: unknown,
): StudioProtocolSetLicenseKeyRequest | null => {
	const parsed = z.safeParse(studioProtocolSetLicenseKeyRequestSchema, value);
	return parsed.success ? parsed.data : null;
};

export const setLicenseKeyInStudioWithDependencies = async (
	licenseKey: string,
	dependencies: SetLicenseKeyInStudioDependencies,
): Promise<SetLicenseKeyInStudioResult> => {
	if (!isValidPublicLicenseKey(licenseKey)) {
		return {
			success: false,
			code: 'invalid-license-key',
			message: 'The license key is not a valid public Remotion license key.',
		};
	}

	const discovery = await discoverStudios(dependencies);
	if (discovery.studios.length === 0) {
		if (discovery.foundUnsupportedProtocol) {
			return {
				success: false,
				code: 'unsupported-protocol',
				message:
					'The running Remotion Studio uses an unsupported Studio Protocol version.',
			};
		}

		if (discovery.foundInvalidResponse) {
			return {
				success: false,
				code: 'invalid-response',
				message:
					'Remotion Studio returned an invalid Studio Protocol response.',
			};
		}

		return {
			success: false,
			code: 'no-compatible-studio',
			message: 'Start Remotion Studio, focus it, and try again.',
		};
	}

	const supportedStudios = discovery.studios.flatMap((studio) => {
		const capability = getSetLicenseKeyCapability(studio.descriptor);
		return capability === null ? [] : [{...studio, capability}];
	});
	if (supportedStudios.length === 0) {
		return {
			success: false,
			code: 'studio-upgrade-required',
			message:
				'This Remotion Studio cannot set a license key through Studio Protocol. Upgrade Remotion to 4.0.504 or newer.',
		};
	}

	const now = dependencies.now();
	const configurable = supportedStudios
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
	const selected = configurable[0];
	const selectedTarget = selected?.capability.target;
	if (!selected || selectedTarget === null || selectedTarget === undefined) {
		return {
			success: false,
			code: 'no-configurable-target',
			message: 'Focus a writable Remotion Studio tab, then try again.',
		};
	}

	let response: Response;
	try {
		const requestBody = {
			operation: 'set-license-key',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId: selectedTarget.id,
			licenseKey,
		} satisfies StudioProtocolSetLicenseKeyRequest;
		response = await fetchWithTimeout({
			fetchFn: dependencies.fetchFn,
			url: `${selected.origin}/api/studio-protocol/license-key`,
			options: {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(requestBody),
			},
		});
	} catch (error) {
		const timedOut = isAbortError(error);
		return {
			success: false,
			code: timedOut ? 'request-timed-out' : 'network-error',
			message: timedOut
				? 'The request to Remotion Studio timed out.'
				: 'Could not connect to Remotion Studio.',
		};
	}

	let result: unknown;
	try {
		result = await response.json();
	} catch {
		return {
			success: false,
			code: 'invalid-response',
			message: 'Remotion Studio returned an invalid license-key response.',
		};
	}

	if (response.ok && isAwaitingConfirmationResponse(result)) {
		return {
			success: true,
			status: 'awaiting-confirmation',
			target: {
				projectName: selected.descriptor.projectName,
				studioOrigin: selected.origin,
				studioVersion: selected.descriptor.studioVersion,
			},
		};
	}

	const protocolError = parseStudioProtocolError(result);
	if (protocolError !== null) {
		return {
			success: false,
			code:
				protocolError.code === 'target-expired'
					? 'target-expired'
					: protocolError.code === 'no-config-file'
						? 'no-config-file'
						: 'request-rejected',
			message: protocolError.message,
		};
	}

	return {
		success: false,
		code: 'invalid-response',
		message: 'Remotion Studio returned an invalid license-key response.',
	};
};

export const setLicenseKeyInStudio = ({
	licenseKey,
}: {
	readonly licenseKey: string;
}): Promise<SetLicenseKeyInStudioResult> =>
	setLicenseKeyInStudioWithDependencies(licenseKey, {
		fetchFn: fetch,
		now: Date.now,
		ports: studioProtocolProbePorts,
	});
