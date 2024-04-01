import type {RecastCodemod} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {ModalsContext} from '../../state/modals';
import {inlineCodeSnippet} from '../Menu/styles';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {CodemodFooter} from './CodemodFooter';

const content: React.CSSProperties = {
	padding: 16,
	fontSize: 14,
	flex: 1,
	minWidth: 500,
};

const DeleteCompositionLoaded: React.FC<{
	compositionId: string;
}> = () => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error('Resolved composition context');
	}

	const {resolved, unresolved} = context;

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'delete-composition',
			idToDelete: resolved.result.id,
		};
	}, [resolved.result.id]);

	return (
		<>
			<NewCompHeader title={'Delete composition'} />
			<form>
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
				<div style={{...content, borderTop: '1px solid black'}}>
					<CodemodFooter codemod={codemod} valid />
				</div>
			</form>
		</>
	);
};

export const DeleteComposition: React.FC<{
	compositionId: string;
}> = ({compositionId}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<ResolveCompositionBeforeModal compositionId={compositionId}>
				<DeleteCompositionLoaded compositionId={compositionId} />
			</ResolveCompositionBeforeModal>
		</ModalContainer>
	);
};
