import type {ApiRoutes} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {assertEffectChainEditable} from './effect-deletion-state';

const authorizedDeletions = new WeakSet<object>();
export const authorizeEffectDeletionRequest = (request: object) => {
	authorizedDeletions.add(request);
};

// Inspect only declared transport locations, never effect config/schema values.
export const guardPendingEffectDeletion = (
	endpoint: keyof ApiRoutes,
	body: unknown,
) => {
	if (
		endpoint === '/api/delete-effect' &&
		typeof body === 'object' &&
		body !== null &&
		authorizedDeletions.has(body)
	)
		return;
	const object = body as Record<string, unknown>;
	let targets: unknown[] = [];
	switch (endpoint) {
		case '/api/add-effect':
		case '/api/reorder-effect':
		case '/api/save-effect-props':
		case '/api/add-effect-keyframe':
		case '/api/update-effect-keyframe-settings':
			targets = [body];
			break;
		case '/api/delete-effect':
		case '/api/duplicate-effect':
			targets = body as unknown[];
			break;
		case '/api/paste-effects':
			targets = [{sequenceNodePath: object.targetSequenceNodePath}];
			break;
		case '/api/save-multiple-effect-props':
			targets = object.edits as unknown[];
			break;
		case '/api/save-sequence-props':
			targets =
				(object.movedKeyframes as {effectKeyframes: unknown[]} | null)
					?.effectKeyframes ?? [];
			break;
		case '/api/add-keyframes':
		case '/api/delete-keyframes':
		case '/api/move-keyframes':
		case '/api/batch-update-keyframe-settings':
			targets = object.effectKeyframes as unknown[];
			break;
		default:
			return;
	}

	for (const target of targets ?? []) {
		const nodePath = (
			target as {sequenceNodePath: SequencePropsSubscriptionKey}
		).sequenceNodePath;
		if (nodePath) assertEffectChainEditable(nodePath);
	}
};
