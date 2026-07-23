import type {RecastCodemod} from '@remotion/studio-shared';
import React, {useCallback, useMemo} from 'react';
import {getFolderId} from '../../helpers/get-folder-id';
import {inlineCodeSnippet} from '../Menu/styles';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {applyCodemod} from '../RenderQueue/actions';
import {CodemodFooter} from './CodemodFooter';
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
	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'delete-folder',
			folderName,
			parentName,
		};
	}, [folderName, parentName]);

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
					<CodemodFooter
						errorNotification={`Could not delete folder`}
						loadingNotification={'Deleting folder'}
						successNotification={`Deleted folder ${folderId}`}
						genericSubmitLabel={`Delete`}
						submitLabel={({relativeRootPath}) =>
							`Delete from ${relativeRootPath}`
						}
						codemod={codemod}
						stack={stack}
						valid
						onSuccess={null}
						applyCodemod={({signal, symbolicatedStack}) =>
							applyCodemod({
								codemod,
								dryRun: false,
								signal,
								symbolicatedStack,
							})
						}
					/>
				</ModalFooterContainer>
			</form>
		</DismissableModal>
	);
};
