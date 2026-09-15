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
import {
	getKeysToExpand,
	splitParentIntoNameAndParent,
} from '../../helpers/create-folder-tree';
import {persistExpandedFolders} from '../../helpers/persist-open-folders';
import {slugifyName} from '../../helpers/slugify-name';
import {validateNewFolderName} from '../../helpers/validate-new-folder-name';
import {FolderContext} from '../../state/folders';
import {Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {applyCodemod} from '../RenderQueue/actions';
import {CodemodFooter} from './CodemodFooter';
import {DismissableModal} from './DismissableModal';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {RemotionInput} from './RemInput';
import {SlugPreview} from './SlugPreview';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const parentNameStyle: React.CSSProperties = {
	...rightRow,
	fontSize: 13,
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
	const {setCompositionFoldersExpanded} = useContext(FolderContext);
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

	const folderName = slugifyName(newName);
	const folderNameErrMessage = folderName
		? validateNewFolderName({folders, newName: folderName, parentName})
		: 'Enter a name containing letters or numbers.';
	const valid = folderNameErrMessage === null;

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'new-folder',
			folderName,
			parentName,
		};
	}, [folderName, parentName]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);
	const onSuccess = useCallback(() => {
		if (parentName === null) {
			return;
		}

		const parentFolder = splitParentIntoNameAndParent(parentName);
		const parentFolderName = parentFolder.name;
		if (parentFolderName === null) {
			return;
		}

		setCompositionFoldersExpanded((previousState) => {
			const foldersExpanded = {...previousState};
			for (const key of getKeysToExpand(
				parentFolderName,
				parentFolder.parent,
			)) {
				foldersExpanded[key] = true;
			}

			persistExpandedFolders('compositions', foldersExpanded);
			return foldersExpanded;
		});
	}, [parentName, setCompositionFoldersExpanded]);

	return (
		<DismissableModal>
			<ModalHeader title="New folder" />
			<form onSubmit={onSubmit}>
				<div style={content}>
					{parentName ? (
						<div style={optionRow}>
							<div style={label}>Parent</div>
							<div style={parentNameStyle}>{parentName}</div>
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
								<SlugPreview
									action="create"
									currentName={null}
									input={newName}
									slug={folderName}
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
						genericSubmitLabel={'Add to root file'}
						submitLabel={({relativeRootPath}) => `Add to ${relativeRootPath}`}
						codemod={codemod}
						stack={stack}
						valid={valid}
						onSuccess={onSuccess}
						fallbackToRootFile
						applyCodemod={({signal, symbolicatedStack}) =>
							applyCodemod({
								codemod,
								dryRun: false,
								signal,
								symbolicatedStack,
								undoRedoNavigation: null,
							})
						}
						applyCodemodForPreview={null}
					/>
				</ModalFooterContainer>
			</form>
		</DismissableModal>
	);
};
