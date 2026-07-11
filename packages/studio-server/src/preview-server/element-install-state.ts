export const ELEMENT_INSTALL_TARGET_MAX_AGE = 5000;

export type ElementInstallTarget = {
	requestId: string | null;
	clientId: string;
	compositionFile: string | null;
	compositionId: string | null;
	canInstall: boolean;
	lastFocusedAt: number | null;
	readOnly: boolean;
	updatedAt: number;
};

const targetsByClientId = new Map<string, ElementInstallTarget>();

const compareTargets = (a: ElementInstallTarget, b: ElementInstallTarget) => {
	const aFocusedAt = a.lastFocusedAt ?? 0;
	const bFocusedAt = b.lastFocusedAt ?? 0;

	if (aFocusedAt !== bFocusedAt) {
		return aFocusedAt - bFocusedAt;
	}

	return a.updatedAt - b.updatedAt;
};

export const updateElementInstallTarget = (
	newTarget: Omit<ElementInstallTarget, 'updatedAt'>,
) => {
	targetsByClientId.set(newTarget.clientId, {
		...newTarget,
		updatedAt: Date.now(),
	});
};

export const getElementInstallTarget = (requestId?: string) => {
	const now = Date.now();
	let bestTarget: ElementInstallTarget | null = null;

	for (const [clientId, currentTarget] of targetsByClientId) {
		if (now - currentTarget.updatedAt >= ELEMENT_INSTALL_TARGET_MAX_AGE) {
			targetsByClientId.delete(clientId);
			continue;
		}

		if (requestId !== undefined && currentTarget.requestId !== requestId) {
			continue;
		}

		if (bestTarget === null || compareTargets(currentTarget, bestTarget) > 0) {
			bestTarget = currentTarget;
		}
	}

	return bestTarget;
};

export const clearElementInstallStateForTests = () => {
	targetsByClientId.clear();
};
