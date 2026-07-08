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
import {Internals, type _InternalTypes} from 'remotion';
import {getFolderId} from '../../helpers/get-folder-id';
import {validateNewFolderName} from '../../helpers/validate-new-folder-name';
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

const getUniqueFolderName = ({
	folders,
	parentName,
}: {
	folders: _InternalTypes['TFolder'][];
	parentName: string | null;
}) => {
	let counter = 1;

	while (true) {
		const name = counter === 1 ? 'NewFolder' : `NewFolder${counter}`;
		const err = validateNewFolderName({folders, newName: name, parentName});
		if (!err) {
			return name;
		}

		counter++;
	}
};

export const NewFolder: React.FC<{
	readonly parentName: string | null;
	readonly stack: string | null;
}> = ({parentName, stack}) => {
	const {folders} = useContext(Internals.CompositionManager);
	const [newName, setName] = useState(() =>
		getUniqueFolderName({folders, parentName}),
	);
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

	const folderNameErrMessage = validateNewFolderName({
		folders,
		newName,
		parentName,
	});
	const valid = folderNameErrMessage === null;

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'new-folder',
			folderName: newName,
			parentName,
		};
	}, [newName, parentName]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	const folderId = getFolderId({folderName: newName, parentName});

	return (
		<DismissableModal>
			<ModalHeader title="New folder" />
			<form onSubmit={onSubmit}>
				<div style={content}>
					{parentName ? (
						<div style={optionRow}>
							<div style={label}>Parent</div>
							<div style={rightRow}>{parentName}</div>
						</div>
					) : null}
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
						loadingNotification={'Creating folder...'}
						errorNotification={'Could not create folder'}
						successNotification={`Created folder ${folderId}`}
						genericSubmitLabel={'Add to root file'}
						submitLabel={({relativeRootPath}) => `Add to ${relativeRootPath}`}
						codemod={codemod}
						stack={stack}
						valid={valid}
						onSuccess={null}
						fallbackToRootFile
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
