import type {ChangeEventHandler} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {renameStaticFile} from '../../api/rename-static-file';
import {pushUrl} from '../../helpers/url-state';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Row, Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {useStaticFiles} from '../use-static-files';
import {DismissableModal} from './DismissableModal';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const getParent = (relativePath: string) => {
	const slashIndex = relativePath.lastIndexOf('/');
	return slashIndex === -1 ? '' : relativePath.slice(0, slashIndex);
};

const getBaseName = (relativePath: string) => {
	const slashIndex = relativePath.lastIndexOf('/');
	return slashIndex === -1 ? relativePath : relativePath.slice(slashIndex + 1);
};

export const RenameStaticFileModal: React.FC<{
	readonly relativePath: string;
}> = ({relativePath}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const staticFiles = useStaticFiles();
	const [newName, setNewName] = useState(() => getBaseName(relativePath));
	const [submitting, setSubmitting] = useState(false);

	const parent = useMemo(() => getParent(relativePath), [relativePath]);
	const newRelativePath = useMemo(() => {
		return [parent, newName].filter(Boolean).join('/');
	}, [newName, parent]);

	const validationMessage = useMemo(() => {
		const trimmedName = newName.trim();
		if (trimmedName.length === 0) {
			return 'Name cannot be empty';
		}

		if (trimmedName !== newName) {
			return 'Name cannot start or end with whitespace';
		}

		if (newName.includes('/') || newName.includes('\\')) {
			return 'Name cannot include slashes';
		}

		if (newRelativePath === relativePath) {
			return 'Choose a different name';
		}

		const existingFile = staticFiles.find((file) => {
			return file.name === newRelativePath && file.name !== relativePath;
		});

		if (existingFile) {
			return 'An asset with this name already exists';
		}

		return null;
	}, [newName, newRelativePath, relativePath, staticFiles]);

	const valid = validationMessage === null;

	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setNewName(e.target.value);
		},
		[],
	);

	const onRename = useCallback(() => {
		if (!valid) {
			return;
		}

		setSubmitting(true);
		const notification = showNotification(`Renaming ${relativePath}...`, null);

		renameStaticFile({
			oldRelativePath: relativePath,
			newRelativePath,
		})
			.then(() => {
				setSelectedModal(null);
				if (
					canvasContent?.type === 'asset' &&
					canvasContent.asset === relativePath
				) {
					setCanvasContent({type: 'asset', asset: newRelativePath});
					pushUrl(`/assets/${newRelativePath}`);
				}

				notification.replaceContent(`Renamed to ${newRelativePath}`, 2000);
			})
			.catch((err) => {
				setSubmitting(false);
				notification.replaceContent(
					`Could not rename ${relativePath}: ${(err as Error).message}`,
					3000,
				);
			});
	}, [
		canvasContent,
		newRelativePath,
		relativePath,
		setCanvasContent,
		setSelectedModal,
		valid,
	]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
		(e) => {
			e.preventDefault();
			onRename();
		},
		[onRename],
	);

	return (
		<DismissableModal>
			<ModalHeader title={`Rename ${relativePath}`} />
			<form onSubmit={onSubmit}>
				<div style={content}>
					<div style={optionRow}>
						<div style={label}>Name</div>
						<div style={rightRow}>
							<div>
								<RemotionInput
									value={newName}
									onChange={onNameChange}
									type="text"
									autoFocus
									autoComplete="off"
									data-1p-ignore
									placeholder="Asset name"
									status={validationMessage ? 'error' : 'ok'}
									rightAlign
								/>
								{validationMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={validationMessage}
											type="error"
										/>
									</>
								) : null}
							</div>
						</div>
					</div>
				</div>
				<ModalFooterContainer>
					<Row align="center" justify="flex-end">
						<Button onClick={() => setSelectedModal(null)}>Cancel</Button>
						<Spacing x={1} />
						<Button onClick={onRename} disabled={!valid || submitting}>
							Rename
						</Button>
					</Row>
				</ModalFooterContainer>
			</form>
		</DismissableModal>
	);
};
