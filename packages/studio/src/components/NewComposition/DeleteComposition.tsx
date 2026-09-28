import React, {useCallback, useContext, useRef} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
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
	const {compositions} = useContext(Internals.CompositionManager);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const selectComposition = useSelectComposition();
	const navigationAfterDelete = useRef<
		_InternalTypes['AnyComposition'] | null | undefined
	>(undefined);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	const onSuccess = useCallback(() => {
		if (navigationAfterDelete.current === undefined) {
			return;
		}

		if (navigationAfterDelete.current === null) {
			pushUrl('/');
			setCanvasContent(null);
			return;
		}

		selectComposition(navigationAfterDelete.current, true);
	}, [selectComposition, setCanvasContent]);

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
						loadingNotification={'Deleting'}
						genericSubmitLabel={`Delete`}
						submitLabel={({relativeRootPath}) =>
							`Delete from ${relativeRootPath}`
						}
						stack={compositionStack}
						valid
						onSuccess={onSuccess}
						applyEdit={({signal, symbolicatedStack}) => {
							const currentRoute = getRoute();
							const currentCanvasContent = deriveCanvasContentFromUrl();
							const isSelected =
								currentCanvasContent?.type === 'composition' &&
								currentCanvasContent.compositionId === compositionId;
							const fallback = isSelected
								? (compositions.find(({id}) => id !== compositionId) ?? null)
								: undefined;
							navigationAfterDelete.current = fallback;

							return deleteComposition(
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
