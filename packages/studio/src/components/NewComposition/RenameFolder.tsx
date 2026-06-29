import type {RecastCodemod} from '@remotion/studio-shared';
import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {getFolderId} from '../../helpers/get-folder-id';
import {validateFolderRename} from '../../helpers/validate-folder-rename';
import {Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {applyCodemod} from '../RenderQueue/actions';
import {CodemodFooter} from './CodemodFooter';
import {DismissableModal} from './DismissableModal';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

export const RenameFolder: React.FC<{
	readonly folderName: string;
	readonly parentName: string | null;
	readonly stack: string | null;
}> = ({folderName, parentName, stack}) => {
	const {folders} = useContext(Internals.CompositionManager);
	const [newName, setName] = useState(folderName);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.select();
	}, []);

	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[],
	);

	const folderNameErrMessage = validateFolderRename({
		folders,
		newName,
		originalName: folderName,
		parentName,
	});

	const valid = folderNameErrMessage === null && folderName !== newName;

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'rename-folder',
			folderName,
			parentName,
			newName,
		};
	}, [folderName, newName, parentName]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	const folderId = getFolderId({folderName, parentName});

	return (
		<DismissableModal>
			<ModalHeader title={`Rename ${folderId}`} />
			<form onSubmit={onSubmit}>
				<div style={content}>
					<div style={optionRow}>
						<div style={label}>Name</div>
						<div style={rightRow}>
							<InputAndValidationContainer>
								<RemotionInput
									ref={inputRef}
									value={newName}
									onChange={onNameChange}
									type="text"
									autoFocus
									placeholder="Folder name"
									status="ok"
									rightAlign
								/>
								{folderNameErrMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={folderNameErrMessage}
											type="error"
										/>
									</>
								) : null}
							</InputAndValidationContainer>
						</div>
					</div>
				</div>
				<ModalFooterContainer>
					<CodemodFooter
						loadingNotification={'Renaming folder...'}
						errorNotification={'Could not rename folder'}
						successNotification={`Renamed folder to ${newName}`}
						genericSubmitLabel={'Rename'}
						submitLabel={({relativeRootPath}) => `Modify ${relativeRootPath}`}
						codemod={codemod}
						stack={stack}
						valid={valid}
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
