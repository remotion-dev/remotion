import {isRecord} from './validation';

export type StudioProtocolTarget = {
	readonly id: string;
	readonly expiresAt: number;
	readonly lastFocusedAt: number;
};

export type StudioProtocolInstallTarget = StudioProtocolTarget & {
	readonly compositionId: string;
};

export type StudioProtocolLicenseKeyTarget = StudioProtocolTarget;

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
	readonly capabilities: {
		readonly install: readonly {
			readonly payloadType: 'remotion-element';
			readonly payloadVersions: readonly number[];
		}[];
		readonly setLicenseKey?: true;
	};
	readonly installTarget: StudioProtocolInstallTarget | null;
	readonly licenseKeyTarget?: StudioProtocolLicenseKeyTarget | null;
};

// Studio Protocol v1 shipped with separate capability and target fields.
// Normalize that wire shape so operation clients can use a discriminated union
// without breaking discovery for released Studio versions.
type StudioProtocolClientDescriptor = Pick<
	StudioProtocolDescriptor,
	'projectName' | 'protocol' | 'protocolVersion' | 'studioVersion'
> & {
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

	const [installCapability] = value.capabilities.install;
	return (
		isRecord(installCapability) &&
		installCapability.payloadType === 'remotion-element' &&
		Array.isArray(installCapability.payloadVersions) &&
		installCapability.payloadVersions.every(
			(version) => typeof version === 'number',
		) &&
		(value.installTarget === null || isInstallTarget(value.installTarget)) &&
		(value.capabilities.setLicenseKey === undefined ||
			value.capabilities.setLicenseKey === true) &&
		(value.licenseKeyTarget === undefined ||
			value.licenseKeyTarget === null ||
			isTarget(value.licenseKeyTarget))
	);
};

const normalizeDescriptor = (
	descriptor: StudioProtocolDescriptor,
): StudioProtocolClientDescriptor => {
	const [installCapability] = descriptor.capabilities.install;
	return {
		protocol: descriptor.protocol,
		protocolVersion: descriptor.protocolVersion,
		studioVersion: descriptor.studioVersion,
		projectName: descriptor.projectName,
		capabilities: [
			{
				type: 'install-element',
				payloadType: installCapability!.payloadType,
				payloadVersions: installCapability!.payloadVersions,
				target: descriptor.installTarget,
			},
			...(descriptor.capabilities.setLicenseKey === true
				? [
						{
							type: 'set-license-key' as const,
							target: descriptor.licenseKeyTarget ?? null,
						},
					]
				: []),
		],
	};
};

export const getInstallCapability = (
	descriptor: StudioProtocolClientDescriptor,
): StudioProtocolInstallCapability | null =>
	descriptor.capabilities.find(
		(capability): capability is StudioProtocolInstallCapability =>
			capability.type === 'install-element',
	) ?? null;

export const getSetLicenseKeyCapability = (
	descriptor: StudioProtocolClientDescriptor,
): StudioProtocolSetLicenseKeyCapability | null =>
	descriptor.capabilities.find(
		(capability): capability is StudioProtocolSetLicenseKeyCapability =>
			capability.type === 'set-license-key',
	) ?? null;

export type DiscoveredStudio = {
	readonly descriptor: StudioProtocolClientDescriptor;
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
				descriptor: normalizeDescriptor(value),
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
