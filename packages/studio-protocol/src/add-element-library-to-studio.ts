import * as z from 'zod/mini';
import {isAllowedStudioProtocolPageOrigin} from './install-in-studio';
import type {StudioProtocolFetcher} from './studio-discovery';
import {
	discoverStudios,
	fetchWithTimeout,
	focusedStudioMaxAge,
	getAddElementLibraryCapability,
	isAbortError,
	studioProtocolProbePorts,
} from './studio-discovery';
import {
	isAwaitingConfirmationResponse,
	parseStudioProtocolError,
} from './studio-response';

export type AddElementLibraryToStudioInput = {
	readonly url: string;
	readonly displayName?: string;
};

export type AddElementLibraryToStudioErrorCode =
	| 'invalid-url'
	| 'invalid-display-name'
	| 'unsupported-origin'
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

export type AddElementLibraryToStudioResult =
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
			readonly code: AddElementLibraryToStudioErrorCode;
			readonly message: string;
	  };

export type AddElementLibraryToStudioDependencies = {
	readonly fetchFn: StudioProtocolFetcher;
	readonly now: () => number;
	readonly pageOrigin: string | null;
	readonly ports: readonly number[];
};

export type StudioProtocolAddElementLibraryRequest = {
	readonly operation: 'add-element-library';
	readonly protocol: 'remotion-studio-protocol';
	readonly protocolVersion: 1;
	readonly targetId: string;
	readonly url: string;
	readonly displayName: string | null;
};

const studioProtocolAddElementLibraryRequestSchema = z.object({
	operation: z.literal('add-element-library'),
	protocol: z.literal('remotion-studio-protocol'),
	protocolVersion: z.literal(1),
	targetId: z.string().check(z.minLength(1)),
	url: z.string(),
	displayName: z.nullable(z.string()),
});

export const parseStudioProtocolAddElementLibraryRequest = (
	value: unknown,
): StudioProtocolAddElementLibraryRequest | null => {
	const parsed = z.safeParse(
		studioProtocolAddElementLibraryRequestSchema,
		value,
	);
	return parsed.success ? parsed.data : null;
};

const failure = (
	code: AddElementLibraryToStudioErrorCode,
	message: string,
): AddElementLibraryToStudioResult => ({success: false, code, message});

export const addElementLibraryToStudioWithDependencies = async (
	{
		displayName,
		url,
	}: {
		readonly displayName: string | null;
		readonly url: string;
	},
	dependencies: AddElementLibraryToStudioDependencies,
): Promise<AddElementLibraryToStudioResult> => {
	if (!isAllowedStudioProtocolPageOrigin(dependencies.pageOrigin)) {
		return failure(
			'unsupported-origin',
			'Adding an Element catalog is only supported on HTTPS websites and local development origins.',
		);
	}

	if (typeof url !== 'string') {
		return failure('invalid-url', 'The Element catalog URL must be a string.');
	}

	let normalizedUrl: string;
	try {
		const parsedUrl = new URL(url);
		if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
			return failure(
				'invalid-url',
				'The Element catalog URL must use HTTP or HTTPS.',
			);
		}

		normalizedUrl = parsedUrl.href;
	} catch {
		return failure(
			'invalid-url',
			'The Element catalog URL must be an absolute HTTP or HTTPS URL.',
		);
	}

	if (displayName !== null && typeof displayName !== 'string') {
		return failure(
			'invalid-display-name',
			'The Element catalog display name must be a string.',
		);
	}

	const normalizedDisplayName = displayName?.trim() ?? null;
	if (normalizedDisplayName === '') {
		return failure(
			'invalid-display-name',
			'The Element catalog display name must not be empty.',
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

		if (discovery.foundInvalidResponse) {
			return failure(
				'invalid-response',
				'Remotion Studio returned an invalid Studio Protocol response.',
			);
		}

		return failure(
			'no-compatible-studio',
			'Start Remotion Studio, focus it, and try again.',
		);
	}

	const supportedStudios = discovery.studios.flatMap((studio) => {
		const capability = getAddElementLibraryCapability(studio.descriptor);
		return capability === null ? [] : [{...studio, capability}];
	});
	if (supportedStudios.length === 0) {
		return failure(
			'studio-upgrade-required',
			'This Remotion Studio cannot add an Element catalog through Studio Protocol. Upgrade Remotion to 4.0.518 or newer.',
		);
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
		return failure(
			'no-configurable-target',
			'Focus a writable Remotion Studio tab, then try again.',
		);
	}

	let response: Response;
	try {
		const requestBody = {
			operation: 'add-element-library',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId: selectedTarget.id,
			url: normalizedUrl,
			displayName: normalizedDisplayName,
		} satisfies StudioProtocolAddElementLibraryRequest;
		response = await fetchWithTimeout({
			fetchFn: dependencies.fetchFn,
			url: `${selected.origin}/api/studio-protocol/element-library`,
			options: {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(requestBody),
			},
		});
	} catch (error) {
		const timedOut = isAbortError(error);
		return failure(
			timedOut ? 'request-timed-out' : 'network-error',
			timedOut
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
			'Remotion Studio returned an invalid Element catalog response.',
		);
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
		return failure(
			protocolError.code === 'target-expired'
				? 'target-expired'
				: protocolError.code === 'no-config-file'
					? 'no-config-file'
					: 'request-rejected',
			protocolError.message,
		);
	}

	return failure(
		'invalid-response',
		'Remotion Studio returned an invalid Element catalog response.',
	);
};

export const addElementLibraryToStudio = ({
	displayName,
	url,
}: AddElementLibraryToStudioInput): Promise<AddElementLibraryToStudioResult> =>
	addElementLibraryToStudioWithDependencies(
		{displayName: displayName ?? null, url},
		{
			fetchFn: fetch,
			now: Date.now,
			pageOrigin:
				typeof globalThis.location === 'undefined'
					? null
					: globalThis.location.origin,
			ports: studioProtocolProbePorts,
		},
	);
