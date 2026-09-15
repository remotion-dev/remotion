import type {RecastCodemod} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {getRoute, pushUrl} from '../../helpers/url-state';
import {useSelectComposition} from '../InitialCompositionLoader';
import {inlineCodeSnippet} from '../Menu/styles';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {applyCodemod} from '../RenderQueue/actions';
import {CodemodFooter} from './CodemodFooter';
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

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'delete-composition',
			idToDelete: compositionId,
		};
	}, [compositionId]);

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
					<CodemodFooter
						errorNotification={`Could not delete composition`}
						loadingNotification={'Deleting'}
						genericSubmitLabel={`Delete`}
						submitLabel={({relativeRootPath}) =>
							`Delete from ${relativeRootPath}`
						}
						codemod={codemod}
						stack={compositionStack}
						valid
						onSuccess={onSuccess}
						applyCodemod={({signal, symbolicatedStack}) => {
							const currentRoute = getRoute();
							const isSelected = currentRoute === `/${compositionId}`;
							const fallback = isSelected
								? (compositions.find(({id}) => id !== compositionId) ?? null)
								: undefined;
							navigationAfterDelete.current = fallback;

							return applyCodemod({
								codemod,
								dryRun: false,
								signal,
								symbolicatedStack,
								undoRedoNavigation:
									fallback === undefined
										? null
										: {
												undoRoute: currentRoute,
												redoRoute: fallback === null ? '/' : `/${fallback.id}`,
											},
							});
						}}
						applyCodemodForPreview={null}
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
