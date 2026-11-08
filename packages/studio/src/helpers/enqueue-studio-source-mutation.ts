import type {
	ApiRoutes,
	DeleteNodesRequest,
	SaveSequencePropsRequest,
	SequenceNodePathMutation,
	SourceMutationGuard,
} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {
	clearPendingSequenceSplits,
	supersedePendingSequenceSplits,
} from '../components/Timeline/pending-sequence-splits';
import {invalidateDuplicatedElementSelection} from './duplicated-element-selection';
import {
	captureExternalSourceRevision,
	sourceEditCancelledMessage,
	subscribeToExternalSourceChanges,
} from './external-source-changes';
import {installRequiredPackages} from './install-required-package';
import {loadGoogleFontForPreview} from './load-google-font-for-preview';
import {captureOptimisticEffectMutation} from './optimistic-effect-mutations';
import {
	captureSourceRequest,
	markSourceRequestPaths,
	normalizeSourceFileName,
	rebaseSourceRequest,
} from './rebase-source-request';
import {
	getPendingSequenceNodePathMutations,
	queuePendingSequenceDeletionRemappings,
	queueSequenceNodePathMutationFromApiResponse,
	subscribeToSequenceNodePathMutations,
} from './sequence-node-path-mutations';
import {enqueueSourceMutation} from './source-mutation-queue';

export const enqueueStudioSourceMutation = <T>(
	endpoint: keyof ApiRoutes,
	body: unknown,
	run: (rebasedBody: unknown, guard: SourceMutationGuard | null) => Promise<T>,
): Promise<T> => {
	if (endpoint === '/api/undo' || endpoint === '/api/redo') {
		invalidateDuplicatedElementSelection();
		clearPendingSequenceSplits();
	}

	const nodes =
		endpoint === '/api/delete-nodes'
			? (body as DeleteNodesRequest).nodes.map((node) => ({
					absolutePath: node.fileName,
					nodePath: node.nodePath,
				}))
			: [];
	const initialMutations = getPendingSequenceNodePathMutations();
	const mutations: SequenceNodePathMutation[] = [];
	const root = typeof window === 'undefined' ? '' : (window.remotion_cwd ?? '');
	let rebasedBody = body;
	let capturedBody = body;
	let rebaseError: unknown = null;
	let unsubscribeFromMutations = () => {};
	let unsubscribeFromExternalChanges = () => {};
	let sourceGuard: SourceMutationGuard | null = null;
	let effectMutation: ReturnType<
		typeof captureOptimisticEffectMutation
	> | null = null;

	return enqueueSourceMutation(
		async (operation) => {
			try {
				if (rebaseError !== null) {
					throw rebaseError;
				}

				await effectMutation?.prepare();

				// Preparation is part of the queued edit, not a prerequisite for
				// enqueueing it. Undo and other edits must follow user action order.
				if (endpoint === '/api/save-sequence-props') {
					const fonts = (body as SaveSequencePropsRequest).edits.flatMap(
						({sourceEdit}) =>
							sourceEdit?.type === 'google-font' ? [sourceEdit.font] : [],
					);
					if (fonts.length > 0) {
						await Promise.all(
							fonts.map(({fontFamily}) =>
								loadGoogleFontForPreview({fontFamily, document}),
							),
						);
						await installRequiredPackages([
							{name: '@remotion/google-fonts', version: null},
						]);
					}
				}

				unsubscribeFromMutations();
				if (rebaseError !== null) {
					throw rebaseError;
				}

				Internals.OptimisticEffects.startSourceMutation(operation.revision);
				const result = await run(
					effectMutation?.resolve(rebasedBody) ?? rebasedBody,
					sourceGuard,
				);
				if (rebaseError !== null) throw rebaseError;
				queueSequenceNodePathMutationFromApiResponse(result);
				const ownMutation =
					typeof result === 'object' &&
					result !== null &&
					'nodePathMutation' in result &&
					result.nodePathMutation
						? (result.nodePathMutation as SequenceNodePathMutation)
						: null;
				markSourceRequestPaths(
					result,
					ownMutation ? [...mutations, ownMutation] : mutations,
					false,
				);
				if (typeof result !== 'object' || result === null) {
					effectMutation?.acknowledge(ownMutation?.mutationId ?? null);
					return result;
				}

				if (
					('success' in result && result.success === false) ||
					('canUpdate' in result && result.canUpdate === false)
				) {
					effectMutation?.rollback();
					Internals.OptimisticSequenceDeletion.rollbackRevision(
						operation.revision,
					);
					return result;
				}

				effectMutation?.acknowledge(ownMutation?.mutationId ?? null);
				if (ownMutation !== null)
					Internals.OptimisticEffects.acknowledgeMutation(
						ownMutation.mutationId,
					);

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
				effectMutation?.rollback();
				Internals.OptimisticSequenceDeletion.rollbackRevision(
					operation.revision,
				);
				throw error;
			} finally {
				unsubscribeFromExternalChanges();
				unsubscribeFromMutations();
				Internals.OptimisticEffects.finishSourceMutation(operation.revision);
			}
		},
		(operation) => {
			try {
				capturedBody = captureSourceRequest(body, initialMutations);
				rebasedBody = capturedBody;
				effectMutation = captureOptimisticEffectMutation(endpoint, body);
				sourceGuard = captureExternalSourceRevision(effectMutation.files);
				const files = new Set(
					effectMutation.files.map((file) =>
						normalizeSourceFileName(file, root),
					),
				);
				unsubscribeFromExternalChanges = subscribeToExternalSourceChanges(
					(file) => {
						if (!files.has(file)) return;
						rebaseError = new Error(sourceEditCancelledMessage);
						effectMutation?.rollback();
						Internals.OptimisticSequenceDeletion.rollbackRevision(
							operation.revision,
						);
					},
				);
			} catch (error) {
				rebaseError = error;
				return;
			}

			if (endpoint === '/api/save-sequence-props') {
				supersedePendingSequenceSplits(
					(body as SaveSequencePropsRequest).edits
						.filter((edit) =>
							[
								'from',
								'durationInFrames',
								'trimBefore',
								'playbackRate',
							].includes(edit.key),
						)
						.map((edit) => edit.nodePath),
				);
			} else if (nodes.length > 0) {
				supersedePendingSequenceSplits(nodes);
			}

			if (nodes.length > 0) {
				Internals.OptimisticSequenceDeletion.set(
					nodes,
					operation.revision,
					true,
				);
			}

			const applyMutation = (mutation: SequenceNodePathMutation) => {
				mutations.push(mutation);
				if (rebaseError !== null) {
					return;
				}

				try {
					const nextBody = rebaseSourceRequest(
						capturedBody,
						mutations,
						false,
						root,
					);
					if (nodes.length > 0) {
						const previousNodes = (rebasedBody as DeleteNodesRequest).nodes;
						const nextNodes = (nextBody as DeleteNodesRequest).nodes;
						queuePendingSequenceDeletionRemappings(
							mutation.mutationId,
							previousNodes.flatMap((previous, index) => {
								const next = nextNodes[index];
								if (
									JSON.stringify(previous.nodePath) ===
									JSON.stringify(next.nodePath)
								) {
									return [];
								}

								return [
									{
										previousNodePath: {
											absolutePath: previous.fileName,
											nodePath: previous.nodePath,
										},
										nodePath: {
											absolutePath: next.fileName,
											nodePath: next.nodePath,
										},
										revision: operation.revision,
									},
								];
							}),
						);
					}

					rebasedBody = nextBody;
				} catch (error) {
					rebaseError = error;
					// This batch will not be persisted. Retire all of its optimistic
					// deletions before changed source paths can refer to other layers.
					if (nodes.length > 0) {
						queuePendingSequenceDeletionRemappings(
							mutation.mutationId,
							(rebasedBody as DeleteNodesRequest).nodes.map((node) => ({
								previousNodePath: {
									absolutePath: node.fileName,
									nodePath: node.nodePath,
								},
								nodePath: null,
								revision: operation.revision,
							})),
						);
					}
				}
			};

			for (const mutation of initialMutations) {
				applyMutation(mutation);
			}

			unsubscribeFromMutations =
				subscribeToSequenceNodePathMutations(applyMutation);
		},
	);
};
