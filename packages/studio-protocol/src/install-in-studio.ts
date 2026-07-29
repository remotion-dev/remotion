import type {SerializedDragData} from './drag-data';
import {isRecord} from './validation';

export type StudioInstallTarget = {
	readonly type: 'remotion-studio';
	readonly projectName: string | null;
	readonly port: number | null;
	readonly lastFocusedAt: number | null;
	readonly canInstall: boolean;
	readonly activeCompositionId: string | null;
	readonly readOnly: boolean;
	readonly origin: string;
};

export type InstallInStudioResult =
	| {
			readonly success: true;
			readonly target: StudioInstallTarget;
	  }
	| {
			readonly success: false;
			readonly reason: string;
	  };

const probePorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];
const focusedStudioMaxAge = 5 * 60 * 1000;

type InstallInStudioDependencies = {
	readonly fetchFn: Fetcher;
	readonly now: () => number;
	readonly ports: readonly number[];
};

type Fetcher = (
	input: string | URL | Request,
	options?: RequestInit,
) => Promise<Response>;

const fetchWithTimeout = async ({
	fetchFn,
	options = {},
	url,
}: {
	readonly fetchFn: Fetcher;
	readonly options?: RequestInit;
	readonly url: string;
}) => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 700);
	try {
		return await fetchFn(url, {...options, signal: controller.signal});
	} finally {
		clearTimeout(timeout);
	}
};

const isNullableString = (value: unknown): value is string | null => {
	return value === null || typeof value === 'string';
};

const isStudioInstallTarget = (
	value: unknown,
): value is Omit<StudioInstallTarget, 'origin'> => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		value.type === 'remotion-studio' &&
		isNullableString(value.projectName) &&
		(value.port === null ||
			(typeof value.port === 'number' && Number.isFinite(value.port))) &&
		(value.lastFocusedAt === null ||
			(typeof value.lastFocusedAt === 'number' &&
				Number.isFinite(value.lastFocusedAt))) &&
		typeof value.canInstall === 'boolean' &&
		isNullableString(value.activeCompositionId) &&
		typeof value.readOnly === 'boolean'
	);
};

const findBestStudioInstallTarget = async ({
	fetchFn,
	now,
	ports,
}: InstallInStudioDependencies): Promise<StudioInstallTarget | null> => {
	const targets = await Promise.all(
		ports.map(async (port): Promise<StudioInstallTarget | null> => {
			const origin = `http://localhost:${port}`;
			try {
				const response = await fetchWithTimeout({
					fetchFn,
					url: `${origin}/api/element-install-target`,
				});
				if (!response.ok) {
					return null;
				}

				const target: unknown = await response.json();
				if (!isStudioInstallTarget(target)) {
					return null;
				}

				return {...target, origin};
			} catch {
				return null;
			}
		}),
	);

	const currentTime = now();
	const installableTargets = targets.filter(
		(target): target is StudioInstallTarget =>
			target !== null &&
			target.canInstall &&
			target.lastFocusedAt !== null &&
			currentTime - target.lastFocusedAt < focusedStudioMaxAge,
	);

	return (
		installableTargets.sort((a, b) => b.lastFocusedAt! - a.lastFocusedAt!)[0] ??
		null
	);
};

export const installInStudioWithDependencies = async (
	dragData: SerializedDragData,
	dependencies: InstallInStudioDependencies,
): Promise<InstallInStudioResult> => {
	const target = await findBestStudioInstallTarget(dependencies);
	if (target === null) {
		return {
			success: false,
			reason:
				'Focus the Remotion Studio you want to install into, then click again.',
		};
	}

	try {
		const response = await fetchWithTimeout({
			fetchFn: dependencies.fetchFn,
			url: `${target.origin}/api/request-element-install`,
			options: {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					mimeType: dragData.mimeType,
					payload: dragData.payload,
				}),
			},
		});
		const result: unknown = await response.json();

		if (
			!response.ok ||
			!isRecord(result) ||
			result.success !== true ||
			result.status !== 'sent'
		) {
			return {
				success: false,
				reason:
					isRecord(result) &&
					result.success === false &&
					typeof result.reason === 'string'
						? result.reason
						: 'Could not send payload to Remotion Studio.',
			};
		}

		return {success: true, target};
	} catch (error) {
		return {
			success: false,
			reason: error instanceof Error ? error.message : String(error),
		};
	}
};

export const installInStudio = (
	dragData: SerializedDragData,
): Promise<InstallInStudioResult> => {
	return installInStudioWithDependencies(dragData, {
		fetchFn: fetch,
		now: Date.now,
		ports: probePorts,
	});
};
