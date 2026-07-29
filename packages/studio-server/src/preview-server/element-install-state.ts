import {randomUUID} from 'node:crypto';

export const ELEMENT_INSTALL_TARGET_MAX_AGE = 5000;
export const STUDIO_PROTOCOL_TARGET_MAX_AGE = 4000;

export type ElementInstallTarget = {
	requestId: string | null;
	clientId: string;
	compositionFile: string | null;
	compositionId: string | null;
	canInstall: boolean;
	lastFocusedAt: number | null;
	readOnly: boolean;
	studioUrl: string;
	updatedAt: number;
};

const targetsByClientId = new Map<string, ElementInstallTarget>();

type StudioProtocolTarget = {
	readonly id: string;
	readonly target: ElementInstallTarget;
	readonly expiresAt: number;
};

const studioProtocolTargets = new Map<string, StudioProtocolTarget>();

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

export const getElementInstallTargetByClientId = (clientId: string) => {
	return targetsByClientId.get(clientId) ?? null;
};

export const getElementInstallTarget = (requestId: string | null) => {
	const now = Date.now();
	let bestTarget: ElementInstallTarget | null = null;

	for (const [clientId, currentTarget] of targetsByClientId) {
		if (now - currentTarget.updatedAt >= ELEMENT_INSTALL_TARGET_MAX_AGE) {
			targetsByClientId.delete(clientId);
			continue;
		}

		if (requestId !== null && currentTarget.requestId !== requestId) {
			continue;
		}

		if (bestTarget === null || compareTargets(currentTarget, bestTarget) > 0) {
			bestTarget = currentTarget;
		}
	}

	return bestTarget;
};

export const issueStudioProtocolTarget = ({
	now,
	target,
}: {
	readonly now: number;
	readonly target: ElementInstallTarget;
}) => {
	for (const [id, existing] of studioProtocolTargets) {
		if (existing.expiresAt <= now) {
			studioProtocolTargets.delete(id);
		}
	}

	const issued: StudioProtocolTarget = {
		id: randomUUID(),
		target: {...target},
		expiresAt: now + STUDIO_PROTOCOL_TARGET_MAX_AGE,
	};
	studioProtocolTargets.set(issued.id, issued);
	return issued;
};

export const consumeStudioProtocolTarget = ({
	now,
	targetId,
}: {
	readonly now: number;
	readonly targetId: string;
}): ElementInstallTarget | null => {
	const issued = studioProtocolTargets.get(targetId);
	studioProtocolTargets.delete(targetId);
	if (issued === undefined || issued.expiresAt <= now) {
		return null;
	}

	const current = getElementInstallTargetByClientId(issued.target.clientId);
	if (
		current === null ||
		now - current.updatedAt >= ELEMENT_INSTALL_TARGET_MAX_AGE ||
		!current.canInstall ||
		current.readOnly ||
		current.compositionFile !== issued.target.compositionFile ||
		current.compositionId !== issued.target.compositionId
	) {
		return null;
	}

	return issued.target;
};

export const clearElementInstallStateForTests = () => {
	targetsByClientId.clear();
	studioProtocolTargets.clear();
};
