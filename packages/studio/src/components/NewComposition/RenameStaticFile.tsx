import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Row, Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {useStaticFiles} from '../use-static-files';
import {DismissableModal} from './DismissableModal';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {RemotionInput} from './RemInput';
import {
	getRenamedStaticFilePath,
	getStaticFileBaseName,
	getStaticFileRenameSelection,
	validateStaticFileRename,
	useRenameStaticFile,
} from './use-rename-static-file';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

export const RenameStaticFileModal: React.FC<{
	readonly relativePath: string;
}> = ({relativePath}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const staticFiles = useStaticFiles();
	const [newName, setNewName] = useState(() =>
		getStaticFileBaseName(relativePath),
	);
	const [submitting, setSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const renameFile = useRenameStaticFile({relativePath, staticFiles});

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		const [start, end] = getStaticFileRenameSelection(newName);
		input.setSelectionRange(start, end);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const newRelativePath = useMemo(() => {
		return getRenamedStaticFilePath({newName, relativePath});
	}, [newName, relativePath]);
	const changed = newRelativePath !== relativePath;

	const validationMessage = useMemo(() => {
		return validateStaticFileRename({
			newName,
			newRelativePath,
			relativePath,
			staticFiles,
		});
	}, [newName, newRelativePath, relativePath, staticFiles]);

	const valid = changed && validationMessage === null;

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
		renameFile(newName)
			.then((renamed) => {
				if (!renamed) {
					setSubmitting(false);
					return;
				}

				setSelectedModal(null);
			})
			.catch(() => {
				setSubmitting(false);
			});
	}, [newName, renameFile, setSelectedModal, valid]);

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
							<InputAndValidationContainer>
								<RemotionInput
									ref={inputRef}
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
							</InputAndValidationContainer>
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
