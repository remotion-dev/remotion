import * as z from 'zod/mini';

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

export type StudioProtocolAddElementLibraryCapability = {
	readonly type: 'add-element-library';
	readonly target: StudioProtocolTarget | null;
};

export type StudioProtocolCapability =
	| StudioProtocolInstallCapability
	| StudioProtocolSetLicenseKeyCapability
	| StudioProtocolAddElementLibraryCapability;

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

const targetSchema = z.looseObject({
	id: z.string().check(z.minLength(1)),
	expiresAt: z.number(),
	lastFocusedAt: z.number(),
});
const installTargetSchema = z.looseObject({
	id: z.string().check(z.minLength(1)),
	expiresAt: z.number(),
	lastFocusedAt: z.number(),
	compositionId: z.string().check(z.minLength(1)),
});
const installCapabilitySchema = z.looseObject({
	type: z.literal('install-element'),
	payloadType: z.literal('remotion-element'),
	payloadVersions: z.array(z.number()),
	target: z.nullable(installTargetSchema),
});
const setLicenseKeyCapabilitySchema = z.looseObject({
	type: z.literal('set-license-key'),
	target: z.nullable(targetSchema),
});
const addElementLibraryCapabilitySchema = z.looseObject({
	type: z.literal('add-element-library'),
	target: z.nullable(targetSchema),
});
const capabilitySchema = z.union([
	installCapabilitySchema,
	setLicenseKeyCapabilitySchema,
	addElementLibraryCapabilitySchema,
]);
const descriptorEnvelopeSchema = z.looseObject({
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	studioVersion: z.string(),
	projectName: z.nullable(z.string()),
	capabilities: z.array(z.unknown()),
});
const descriptorSchema = z
	.looseObject({
		protocol: z.literal('remotion-studio-protocol'),
		protocolVersion: z.literal(1),
		studioVersion: z.string(),
		projectName: z.nullable(z.string()),
		capabilities: z.array(capabilitySchema),
	})
	.check(
		z.refine((descriptor) => {
			const capabilityTypes = descriptor.capabilities.map(
				(capability) => capability.type,
			);
			return new Set(capabilityTypes).size === capabilityTypes.length;
		}),
	);
const protocolVersionEnvelopeSchema = z.looseObject({
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.unknown(),
});
const legacyStudioSchema = z.looseObject({
	type: z.literal('remotion-studio'),
});

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

export const isStudioProtocolDescriptor = (
	value: unknown,
): value is StudioProtocolDescriptor =>
	z.safeParse(descriptorSchema, value).success;

export const parseStudioProtocolDescriptor = (
	value: unknown,
): StudioProtocolDescriptor | null => {
	const envelope = z.safeParse(descriptorEnvelopeSchema, value);
	if (!envelope.success) {
		return null;
	}

	const capabilities: StudioProtocolCapability[] = [];
	for (const capability of envelope.data.capabilities) {
		const parsedCapability = z.safeParse(capabilitySchema, capability);
		if (parsedCapability.success) {
			capabilities.push(parsedCapability.data);
		}
	}

	const descriptor = z.safeParse(descriptorSchema, {
		...envelope.data,
		capabilities,
	});
	return descriptor.success ? descriptor.data : null;
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

export const getAddElementLibraryCapability = (
	descriptor: StudioProtocolDescriptor,
): StudioProtocolAddElementLibraryCapability | null =>
	descriptor.capabilities.find(
		(capability): capability is StudioProtocolAddElementLibraryCapability =>
			capability.type === 'add-element-library',
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
				response = await dependencies.fetchFn(`${origin}/api/studio-protocol`, {
					cache: 'no-store',
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

			const protocolVersionEnvelope = z.safeParse(
				protocolVersionEnvelopeSchema,
				value,
			);
			if (
				protocolVersionEnvelope.success &&
				protocolVersionEnvelope.data.protocolVersion !== 1
			) {
				foundUnsupportedProtocol = true;
				return null;
			}

			const descriptor = parseStudioProtocolDescriptor(value);
			if (descriptor === null) {
				foundInvalidResponse = true;
				return null;
			}

			return {
				descriptor,
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

				return z.safeParse(legacyStudioSchema, await response.json()).success;
			} catch {
				return false;
			}
		}),
	);
	return results.some(Boolean);
};

export const isAbortError = (error: unknown): boolean =>
	error instanceof Error && error.name === 'AbortError';
