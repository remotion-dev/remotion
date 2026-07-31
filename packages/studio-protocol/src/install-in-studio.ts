import type {StudioElementPayload} from './element-payload';
import {isRecord} from './validation';

export type StudioProtocolInstallTarget = {
	readonly id: string;
	readonly expiresAt: number;
	readonly compositionId: string;
	readonly lastFocusedAt: number;
};

export type StudioProtocolLicenseKeyTarget = {
	readonly id: string;
	readonly expiresAt: number;
	readonly lastFocusedAt: number;
};

export type StudioProtocolDescriptor = {
	readonly protocol: 'remotion-studio-protocol';
	readonly protocolVersion: 1;
	readonly studioVersion: string;
	readonly capabilities: {
		readonly install: readonly {
			readonly payloadType: 'remotion-element';
			readonly payloadVersions: readonly number[];
		}[];
		readonly setLicenseKey?: true;
	};
	readonly projectName: string | null;
	readonly installTarget: StudioProtocolInstallTarget | null;
	readonly licenseKeyTarget?: StudioProtocolLicenseKeyTarget | null;
};

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

export type StudioProtocolFetcher = (
	input: string | URL | Request,
	options?: RequestInit,
) => Promise<Response>;

export type InstallInStudioDependencies = {
	readonly fetchFn: StudioProtocolFetcher;
	readonly now: () => number;
	readonly ports: readonly number[];
	readonly pageOrigin: string | null;
};

export const studioProtocolProbePorts = [
	3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009,
];
export const focusedStudioMaxAge = 5 * 60 * 1000;
const requestTimeout = 2_000;

const failure = (
	code: InstallInStudioErrorCode,
	message: string,
): InstallInStudioResult => ({success: false, code, message});

export const fetchWithTimeout = async ({
	fetchFn,
	options,
	url,
}: {
	readonly fetchFn: StudioProtocolFetcher;
	readonly options: RequestInit | null;
	readonly url: string;
}) => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), requestTimeout);
	try {
		return await fetchFn(url, {
			...(options ?? {}),
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timeout);
	}
};

const isNullableString = (value: unknown): value is string | null =>
	value === null || typeof value === 'string';

const isInstallTarget = (
	value: unknown,
): value is StudioProtocolInstallTarget => {
	return (
		isRecord(value) &&
		typeof value.id === 'string' &&
		value.id.length > 0 &&
		typeof value.expiresAt === 'number' &&
		Number.isFinite(value.expiresAt) &&
		typeof value.compositionId === 'string' &&
		value.compositionId.length > 0 &&
		typeof value.lastFocusedAt === 'number' &&
		Number.isFinite(value.lastFocusedAt)
	);
};

const isLicenseKeyTarget = (
	value: unknown,
): value is StudioProtocolLicenseKeyTarget =>
	isRecord(value) &&
	typeof value.id === 'string' &&
	value.id.length > 0 &&
	typeof value.expiresAt === 'number' &&
	Number.isFinite(value.expiresAt) &&
	typeof value.lastFocusedAt === 'number' &&
	Number.isFinite(value.lastFocusedAt);

export const isStudioProtocolDescriptor = (
	value: unknown,
): value is StudioProtocolDescriptor => {
	if (
		!isRecord(value) ||
		value.protocol !== 'remotion-studio-protocol' ||
		value.protocolVersion !== 1 ||
		typeof value.studioVersion !== 'string' ||
		!isNullableString(value.projectName) ||
		!isRecord(value.capabilities) ||
		!Array.isArray(value.capabilities.install) ||
		value.capabilities.install.length !== 1
	) {
		return false;
	}

	const [capability] = value.capabilities.install;
	return (
		isRecord(capability) &&
		capability.payloadType === 'remotion-element' &&
		Array.isArray(capability.payloadVersions) &&
		capability.payloadVersions.every(
			(version) => typeof version === 'number',
		) &&
		(value.installTarget === null || isInstallTarget(value.installTarget)) &&
		(value.capabilities.setLicenseKey === undefined ||
			value.capabilities.setLicenseKey === true) &&
		(value.licenseKeyTarget === undefined ||
			value.licenseKeyTarget === null ||
			isLicenseKeyTarget(value.licenseKeyTarget))
	);
};

const hasSupportedElementCapability = (
	descriptor: StudioProtocolDescriptor,
): boolean => descriptor.capabilities.install[0]!.payloadVersions.includes(1);

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

export type DiscoveredStudio = {
	readonly descriptor: StudioProtocolDescriptor;
	readonly discoveredAt: number;
	readonly origin: string;
};

export const discoverStudios = async (
	dependencies: InstallInStudioDependencies,
): Promise<{
	readonly studios: DiscoveredStudio[];
	readonly foundUnsupportedProtocol: boolean;
	readonly foundInvalidResponse: boolean;
}> => {
	let foundUnsupportedProtocol = false;
	let foundInvalidResponse = false;
	const studios = await Promise.all(
		dependencies.ports.map(async (port): Promise<DiscoveredStudio | null> => {
			const origin = `http://localhost:${port}`;
			let response: Response;
			try {
				response = await fetchWithTimeout({
					fetchFn: dependencies.fetchFn,
					options: {cache: 'no-store'},
					url: `${origin}/api/studio-protocol`,
				});
			} catch {
				return null;
			}

			if (!response.ok) {
				return null;
			}

			let value: unknown;
			try {
				value = await response.json();
			} catch {
				foundInvalidResponse = true;
				return null;
			}

			if (
				isRecord(value) &&
				value.protocol === 'remotion-studio-protocol' &&
				value.protocolVersion !== 1
			) {
				foundUnsupportedProtocol = true;
				return null;
			}

			if (!isStudioProtocolDescriptor(value)) {
				foundInvalidResponse = true;
				return null;
			}

			return {
				descriptor: value,
				discoveredAt: dependencies.now(),
				origin,
			};
		}),
	);

	return {
		studios: studios.filter(
			(studio): studio is DiscoveredStudio => studio !== null,
		),
		foundUnsupportedProtocol,
		foundInvalidResponse,
	};
};

export const hasLegacyStudio = async (
	dependencies: InstallInStudioDependencies,
): Promise<boolean> => {
	const results = await Promise.all(
		dependencies.ports.map(async (port) => {
			try {
				const response = await fetchWithTimeout({
					fetchFn: dependencies.fetchFn,
					options: {cache: 'no-store'},
					url: `http://localhost:${port}/api/element-install-target`,
				});
				if (!response.ok) {
					return false;
				}

				const value: unknown = await response.json();
				return isRecord(value) && value.type === 'remotion-studio';
			} catch {
				return false;
			}
		}),
	);
	return results.some(Boolean);
};

export const isAbortError = (error: unknown): boolean =>
	error instanceof Error && error.name === 'AbortError';

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

	const supportedStudios = discovery.studios.filter(({descriptor}) =>
		hasSupportedElementCapability(descriptor),
	);
	if (supportedStudios.length === 0) {
		return failure(
			'unsupported-protocol',
			'The running Remotion Studio cannot install this Element payload version.',
		);
	}

	const now = dependencies.now();
	const installable = supportedStudios
		.filter(({descriptor}) => {
			const target = descriptor.installTarget;
			return (
				target !== null &&
				target.expiresAt > now &&
				now - target.lastFocusedAt < focusedStudioMaxAge
			);
		})
		.sort((a, b) => {
			const focusDifference =
				b.descriptor.installTarget!.lastFocusedAt -
				a.descriptor.installTarget!.lastFocusedAt;
			return focusDifference === 0
				? b.discoveredAt - a.discoveredAt
				: focusDifference;
		});
	const selected = installable[0];
	if (!selected || selected.descriptor.installTarget === null) {
		return failure(
			'no-installable-target',
			'Focus a writable composition in Remotion Studio, then try again.',
		);
	}

	let response: Response;
	try {
		response = await fetchWithTimeout({
			fetchFn: dependencies.fetchFn,
			url: `${selected.origin}/api/studio-protocol/install`,
			options: {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					protocol: 'remotion-studio-protocol',
					protocolVersion: 1,
					targetId: selected.descriptor.installTarget.id,
					payload,
				}),
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

	if (
		response.ok &&
		isRecord(result) &&
		result.protocol === 'remotion-studio-protocol' &&
		result.protocolVersion === 1 &&
		result.status === 'awaiting-confirmation'
	) {
		return {
			success: true,
			status: 'awaiting-confirmation',
			target: {
				projectName: selected.descriptor.projectName,
				compositionId: selected.descriptor.installTarget.compositionId,
				studioOrigin: selected.origin,
				studioVersion: selected.descriptor.studioVersion,
			},
		};
	}

	if (
		isRecord(result) &&
		result.status === 'error' &&
		isRecord(result.error) &&
		typeof result.error.code === 'string' &&
		typeof result.error.message === 'string'
	) {
		const {code} = result.error;
		return failure(
			code === 'target-expired' ? 'target-expired' : 'request-rejected',
			result.error.message,
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
