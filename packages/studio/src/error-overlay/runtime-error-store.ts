import type {ModuleMap} from '@remotion/studio-shared';

type RuntimeError = {
	readonly error: Error;
	readonly moduleIds: ModuleId[] | null;
};

let errors: RuntimeError[] = [];
const listeners = new Set<() => void>();

export const getRuntimeErrors = () => errors;

export const subscribeToRuntimeErrors = (listener: () => void) => {
	listeners.add(listener);
	// Read again after subscribing so errors between render and commit are kept.
	listener();
	return () => {
		listeners.delete(listener);
	};
};

export const addErrorToOverlay = (
	error: Error,
	moduleIds: ModuleId[] | null,
) => {
	const existing = errors.findIndex(
		(candidate) =>
			candidate.error.stack === error.stack &&
			candidate.error.message === error.message,
	);
	const record: RuntimeError = {
		error,
		moduleIds: moduleIds ?? errors[existing]?.moduleIds ?? null,
	};
	// Replace repeated records too: a repeated error during HMR has not recovered.
	errors =
		existing === -1
			? [...errors, record]
			: errors.map((previous, index) =>
					index === existing ? record : previous,
				);
	for (const listener of listeners) {
		listener();
	}
};

export const clearRecoveredRuntimeErrors = ({
	errorsBeforeUpdate,
	updatedModules,
	failedModules,
	moduleMap,
	reactRefreshFinished,
}: {
	errorsBeforeUpdate: RuntimeError[];
	updatedModules: ModuleId[];
	failedModules: Set<ModuleId>;
	moduleMap: ModuleMap;
	reactRefreshFinished: boolean;
}) => {
	const refreshedProject =
		reactRefreshFinished &&
		failedModules.size === 0 &&
		updatedModules.some((moduleId) => {
			const name = moduleMap[moduleId] || String(moduleId);
			return (
				(name.startsWith('./') ||
					name.startsWith('../') ||
					name.startsWith('/') ||
					name.startsWith('src/')) &&
				!name.includes('node_modules/') &&
				!name.includes('!lazy-compilation-proxy')
			);
		});
	const remaining = errors.filter((record) => {
		if (!errorsBeforeUpdate.includes(record)) {
			return true;
		}

		if (record.moduleIds === null) {
			return !refreshedProject;
		}

		return (
			!record.moduleIds.some((id) => updatedModules.includes(id)) ||
			record.moduleIds.some((id) => failedModules.has(id))
		);
	});
	if (remaining.length === errors.length) {
		return;
	}

	errors = remaining;
	for (const listener of listeners) {
		listener();
	}
};
