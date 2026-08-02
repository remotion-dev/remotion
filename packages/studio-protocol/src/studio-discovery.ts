import {isRecord} from './validation';

export type StudioProtocolTarget = {
	readonly id: string;
	readonly expiresAt: number;
	readonly lastFocusedAt: number;
};

export type StudioProtocolInstallTarget = StudioProtocolTarget & {
	readonly compositionId: string;
};

export type StudioProtocolInstallCapability = {
	readonly type: 'install-element';
	readonly payloadType: 'remotion-element';
	readonly payloadVersions: readonly number[];
	readonly target: StudioProtocolInstallTarget | null;
};

export type StudioProtocolSetLicenseKeyCapability = {
	readonly type: 'set-license-key';
	readonly target: StudioProtocolTarget | null;
};

export type StudioProtocolCapability =
	| StudioProtocolInstallCapability
	| StudioProtocolSetLicenseKeyCapability;

export type StudioProtocolDescriptor = {
	readonly protocol: 'remotion-studio-protocol';
	readonly protocolVersion: 1;
	readonly studioVersion: string;
	readonly projectName: string | null;
	readonly capabilities: readonly StudioProtocolCapability[];
};

export type StudioProtocolFetcher = (
	input: string | URL | Request,
	options?: RequestInit,
) => Promise<Response>;

export type StudioProtocolDiscoveryDependencies = {
	readonly fetchFn: StudioProtocolFetcher;
	readonly now: () => number;
	readonly ports: readonly number[];
};

export const studioProtocolProbePorts = [
	3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009,
];
export const focusedStudioMaxAge = 5 * 60 * 1000;
const requestTimeout = 2_000;

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

const isTarget = (value: unknown): value is StudioProtocolTarget =>
	isRecord(value) &&
	typeof value.id === 'string' &&
	value.id.length > 0 &&
	typeof value.expiresAt === 'number' &&
	Number.isFinite(value.expiresAt) &&
	typeof value.lastFocusedAt === 'number' &&
	Number.isFinite(value.lastFocusedAt);

const isInstallTarget = (
	value: unknown,
): value is StudioProtocolInstallTarget => {
	if (!isRecord(value)) {
		return false;
	}

	const {compositionId} = value;
	return (
		isTarget(value) &&
		typeof compositionId === 'string' &&
		compositionId.length > 0
	);
};

const isCapability = (value: unknown): value is StudioProtocolCapability => {
	if (!isRecord(value)) {
		return false;
	}

	if (value.type === 'install-element') {
		return (
			value.payloadType === 'remotion-element' &&
			Array.isArray(value.payloadVersions) &&
			value.payloadVersions.every((version) => typeof version === 'number') &&
			(value.target === null || isInstallTarget(value.target))
		);
	}

	return (
		value.type === 'set-license-key' &&
		(value.target === null || isTarget(value.target))
	);
};

export const isStudioProtocolDescriptor = (
	value: unknown,
): value is StudioProtocolDescriptor => {
	if (
		!isRecord(value) ||
		value.protocol !== 'remotion-studio-protocol' ||
		value.protocolVersion !== 1 ||
		typeof value.studioVersion !== 'string' ||
		!isNullableString(value.projectName) ||
		!Array.isArray(value.capabilities) ||
		!value.capabilities.every(isCapability)
	) {
		return false;
	}

	const capabilityTypes = value.capabilities.map(
		(capability) => capability.type,
	);
	return new Set(capabilityTypes).size === capabilityTypes.length;
};

export const getInstallCapability = (
	descriptor: StudioProtocolDescriptor,
): StudioProtocolInstallCapability | null =>
	descriptor.capabilities.find(
		(capability): capability is StudioProtocolInstallCapability =>
			capability.type === 'install-element',
	) ?? null;

export const getSetLicenseKeyCapability = (
	descriptor: StudioProtocolDescriptor,
): StudioProtocolSetLicenseKeyCapability | null =>
	descriptor.capabilities.find(
		(capability): capability is StudioProtocolSetLicenseKeyCapability =>
			capability.type === 'set-license-key',
	) ?? null;

export type DiscoveredStudio = {
	readonly descriptor: StudioProtocolDescriptor;
	readonly discoveredAt: number;
	readonly origin: string;
};

export const discoverStudios = async (
	dependencies: StudioProtocolDiscoveryDependencies,
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
	dependencies: StudioProtocolDiscoveryDependencies,
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
