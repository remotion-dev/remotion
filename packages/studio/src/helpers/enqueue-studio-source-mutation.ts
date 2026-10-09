import type {
	ApiRoutes,
	DeleteNodesRequest,
	SequenceNodePathMutation,
} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {queueSequenceNodePathMutationFromApiResponse} from './sequence-node-path-mutations';
import {enqueueSourceMutation} from './source-mutation-queue';

export const enqueueStudioSourceMutation = <T>(
	endpoint: keyof ApiRoutes,
	body: unknown,
	run: () => Promise<T>,
): Promise<T> => {
	const nodes =
		endpoint === '/api/delete-nodes'
			? (body as DeleteNodesRequest).nodes.map((node) => ({
					absolutePath: node.fileName,
					nodePath: node.nodePath,
				}))
			: [];

	return enqueueSourceMutation(
		async (operation) => {
			try {
				const result = await run();
				queueSequenceNodePathMutationFromApiResponse(result);
				if (typeof result !== 'object' || result === null) {
					return result;
				}

				if ('success' in result && result.success === false) {
					Internals.OptimisticSequenceDeletion.rollback(
						nodes,
						operation.revision,
					);
					return result;
				}

				if (
					(endpoint === '/api/undo' || endpoint === '/api/redo') &&
					'nodePathMutation' in result &&
					result.nodePathMutation
				) {
					const mutation = result.nodePathMutation as SequenceNodePathMutation;
					for (const file of mutation.files) {
						for (const remapping of file.remappings) {
							if (
								remapping.oldNodePath === null &&
								remapping.newNodePath !== null
							) {
								Internals.OptimisticSequenceDeletion.restore(
									[
										{
											absolutePath: file.absolutePath,
											nodePath: remapping.newNodePath,
										},
									],
									operation.revision,
									false,
								);
							} else if (
								remapping.newNodePath === null &&
								remapping.oldNodePath !== null
							) {
								Internals.OptimisticSequenceDeletion.restore(
									[
										{
											absolutePath: file.absolutePath,
											nodePath: remapping.oldNodePath,
										},
									],
									operation.revision,
									true,
								);
							}
						}
					}
				}

				// A successful delete only acknowledges persistence. Reapplying its
				// optimistic state here could overwrite a newer undo intent.
				return result;
			} catch (error) {
				Internals.OptimisticSequenceDeletion.rollback(
					nodes,
					operation.revision,
				);
				throw error;
			}
		},
		(operation) => {
			if (nodes.length > 0) {
				Internals.OptimisticSequenceDeletion.set(
					nodes,
					operation.revision,
					true,
				);
			}
		},
	);
};
