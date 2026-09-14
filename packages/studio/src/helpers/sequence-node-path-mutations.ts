import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import {requestInsertedElementSelection} from './inserted-element-selection';

const pendingMutations: SequenceNodePathMutation[] = [];
const seenMutationIds = new Set<string>();

export const queueSequenceNodePathMutation = (
	mutation: SequenceNodePathMutation,
): void => {
	if (seenMutationIds.has(mutation.mutationId)) {
		return;
	}

	seenMutationIds.add(mutation.mutationId);
	pendingMutations.push(mutation);
	if (mutation.timelineSelection !== null) {
		requestInsertedElementSelection({
			compositionId: mutation.timelineSelection.compositionId,
			nodePath: {
				absolutePath: mutation.timelineSelection.absolutePath,
				nodePath: mutation.timelineSelection.nodePath,
			},
			notification: null,
		});
	}
};

export const queueSequenceNodePathMutationFromApiResponse = (
	response: unknown,
): void => {
	if (
		typeof response !== 'object' ||
		response === null ||
		!('nodePathMutation' in response)
	) {
		return;
	}

	const {nodePathMutation} = response;
	if (
		typeof nodePathMutation !== 'object' ||
		nodePathMutation === null ||
		!('mutationId' in nodePathMutation) ||
		typeof nodePathMutation.mutationId !== 'string'
	) {
		return;
	}

	queueSequenceNodePathMutation(nodePathMutation as SequenceNodePathMutation);
};

export const takePendingSequenceNodePathMutations =
	(): SequenceNodePathMutation[] => pendingMutations.splice(0);
