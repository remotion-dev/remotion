import React, {useCallback} from 'react';
import {getFolderId} from '../../helpers/get-folder-id';
import {inlineCodeSnippet} from '../Menu/styles';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {unwrapFolder} from '../RenderQueue/actions';
import {CompositionEditFooter} from './CompositionEditFooter';
import {DismissableModal} from './DismissableModal';

const content: React.CSSProperties = {
	padding: 16,
	fontSize: 14,
	flex: 1,
	minWidth: 500,
};

export const DeleteFolder: React.FC<{
	readonly folderName: string;
	readonly parentName: string | null;
	readonly stack: string | null;
}> = ({folderName, parentName, stack}) => {
	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	const folderId = getFolderId({folderName, parentName});

	return (
		<DismissableModal>
			<ModalHeader title={'Delete folder'} />
			<form onSubmit={onSubmit}>
				<div style={content}>
					Do you want to delete the{' '}
					<code style={inlineCodeSnippet}>Folder</code> with ID {'"'}
					{folderId}
					{'"'}?
					<br />
					The compositions and nested folders inside it will stay in your code.
				</div>
				<ModalFooterContainer>
					<CompositionEditFooter
						errorNotification={`Could not delete folder`}
						loadingNotification={'Deleting folder'}
						genericSubmitLabel={`Delete`}
						submitLabel={({relativeRootPath}) =>
							`Delete from ${relativeRootPath}`
						}
						stack={stack}
						valid
						onSuccess={null}
						applyEdit={({signal, symbolicatedStack}) =>
							unwrapFolder(
								{
									folderName,
									parentName,
									symbolicatedStack,
									undoRedoNavigation: null,
								},
								signal,
							)
						}
					/>
				</ModalFooterContainer>
			</form>
		</DismissableModal>
	);
};
