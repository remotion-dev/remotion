import React, {useCallback, useContext} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {
	applyOptimisticCompositionOperation,
	getActiveOptimisticCompositionOperations,
} from '../../helpers/optimistic-composition-operations';
import {getRoute, pushUrl} from '../../helpers/url-state';
import {useSelectComposition} from '../InitialCompositionLoader';
import {deriveCanvasContentFromUrl} from '../load-canvas-content-from-url';
import {inlineCodeSnippet} from '../Menu/styles';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {deleteComposition} from '../RenderQueue/actions';
import {CompositionEditFooter} from './CompositionEditFooter';
import {DismissableModal} from './DismissableModal';

const content: React.CSSProperties = {
	padding: 16,
	fontSize: 14,
	flex: 1,
	minWidth: 500,
};

const DeleteCompositionLoaded: React.FC<{
	readonly compositionId: string;
}> = ({compositionId}) => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error('Resolved composition context');
	}

	const {unresolved} = context;
	const compositionStack = unresolved.stack ?? null;
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const selectComposition = useSelectComposition();

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	return (
		<>
			<ModalHeader title={'Delete composition'} />
			<form onSubmit={onSubmit}>
				<div style={content}>
					Do you want to delete the{' '}
					<code style={inlineCodeSnippet}>
						{unresolved.durationInFrames === 1 ? `<Still>` : '<Composition>'}
					</code>{' '}
					with ID {'"'}
					{unresolved.id}
					{'"'}?
					<br />
					The associated <code style={inlineCodeSnippet}>component</code> will
					remain in your code.
				</div>
				<ModalFooterContainer>
					<CompositionEditFooter
						errorNotification={`Could not delete composition`}
						loadingNotification={null}
						genericSubmitLabel={`Delete`}
						submitLabel={({relativeRootPath}) =>
							`Delete from ${relativeRootPath}`
						}
						stack={compositionStack}
						valid
						onSuccess={null}
						applyEdit={({signal, symbolicatedStack}) => {
							const getSnapshot = () => compositionManagerRef.current;
							const isShown = () => {
								const canvasContent = deriveCanvasContentFromUrl();
								return (
									canvasContent?.type === 'composition' &&
									canvasContent.compositionId === compositionId
								);
							};

							// Compositions that are being deleted are no navigation targets.
							const getFallback = () => {
								const pendingDeletions = new Set(
									getActiveOptimisticCompositionOperations(
										getSnapshot(),
									).flatMap((operation) =>
										operation.type === 'delete'
											? [operation.compositionId]
											: [],
									),
								);
								return (
									getSnapshot().compositions.find(
										({id}) => id !== compositionId && !pendingDeletions.has(id),
									) ?? null
								);
							};

							const navigateTo = (
								target: _InternalTypes['AnyComposition'] | null,
							) => {
								if (target === null) {
									pushUrl('/');
									setCanvasContent(null);
								} else {
									selectComposition(target, true);
								}
							};

							const currentRoute = getRoute();
							const fallback = isShown() ? getFallback() : undefined;

							// The composition disappears immediately, so leave it now
							// instead of after the source edit is persisted.
							if (fallback !== undefined) {
								navigateTo(fallback);
							}

							// On failure, return to the composition unless the user has
							// navigated elsewhere in the meantime.
							const restoreSelection = () => {
								if (fallback === undefined) {
									return;
								}

								const canvasContent = deriveCanvasContentFromUrl();
								const stillOnFallback =
									fallback === null
										? canvasContent === null
										: canvasContent?.type === 'composition' &&
											canvasContent.compositionId === fallback.id;
								const restored = getSnapshot().compositions.find(
									({id}) => id === compositionId,
								);
								if (stillOnFallback && restored) {
									selectComposition(restored, true);
								}
							};

							return applyOptimisticCompositionOperation({
								operation: {type: 'delete', compositionId},
								getSnapshot,
								persist: () =>
									deleteComposition(
										{
											idToDelete: compositionId,
											symbolicatedStack,
											undoRedoNavigation:
												fallback === undefined
													? null
													: {
															undoRoute: currentRoute,
															redoRoute:
																fallback === null ? '/' : `/${fallback.id}`,
														},
										},
										signal,
									),
							}).then(
								(result) => {
									if (!result.success) {
										restoreSelection();
									} else if (isShown()) {
										// It was reopened while the deletion was pending, for
										// example from the browser history.
										navigateTo(getFallback());
									}

									return result;
								},
								(error) => {
									restoreSelection();
									throw error;
								},
							);
						}}
					/>
				</ModalFooterContainer>
			</form>
		</>
	);
};

export const DeleteComposition: React.FC<{
	readonly compositionId: string;
}> = ({compositionId}) => {
	return (
		<DismissableModal>
			<ResolveCompositionBeforeModal compositionId={compositionId}>
				<DeleteCompositionLoaded compositionId={compositionId} />
			</ResolveCompositionBeforeModal>
		</DismissableModal>
	);
};
