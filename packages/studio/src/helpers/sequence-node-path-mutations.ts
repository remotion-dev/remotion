import type {SequenceNodePathMutation} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {requestInsertedElementSelection} from './inserted-element-selection';
import {getLastDispatchedSourceMutationRevision} from './source-mutation-queue';

const pendingMutations: SequenceNodePathMutation[] = [];
const pendingDeletionRetirements: Array<() => void> = [];
const seenMutationIds = new Set<string>();

export const queueSequenceNodePathMutation = (
	mutation: SequenceNodePathMutation,
): void => {
	if (seenMutationIds.has(mutation.mutationId)) {
		return;
	}

	seenMutationIds.add(mutation.mutationId);
	pendingMutations.push(mutation);
	pendingDeletionRetirements.push(
		Internals.OptimisticSequenceDeletion.prepareRetirement(
			mutation.files.flatMap((file) =>
				file.remappings.flatMap((remapping) =>
					remapping.oldNodePath === null
						? []
						: [
								{
									absolutePath: file.absolutePath,
									nodePath: remapping.oldNodePath,
								},
							],
				),
			),
			getLastDispatchedSourceMutationRevision(),
		),
	);

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
	(): SequenceNodePathMutation[] => {
		for (const retire of pendingDeletionRetirements.splice(0)) {
			retire();
		}

		return pendingMutations.splice(0);
	};
