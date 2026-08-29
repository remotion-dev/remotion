import type {
	ChangeEventHandler,
	Dispatch,
	RefObject,
	SetStateAction,
} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {getStaticFiles} from '../../api/get-static-files';
import {writeStaticFile} from '../../api/write-static-file';
import {LIGHT_TEXT} from '../../helpers/colors';
import {getFolderId} from '../../helpers/get-folder-id';
import {installRequiredPackages} from '../../helpers/install-required-package';
import {sortItemsByNonceHistory} from '../../helpers/sort-by-nonce-history';
import {
	getUniqueCompositionName,
	useCreateComposition,
} from '../../helpers/use-create-composition';
import {Checkmark} from '../../icons/Checkmark';
import {CollapsedFolderIcon} from '../../icons/folder';
import {FolderContext} from '../../state/folders';
import type {CanvasCaptureImport} from '../../state/modals';
import {Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {CodemodFooter} from './CodemodFooter';
import type {ComboboxValue} from './ComboBox';
import {Combobox} from './ComboBox';
import {DismissableModal} from './DismissableModal';
import {getNewCompositionDefaults} from './get-new-composition-defaults';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {InputDragger} from './InputDragger';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const folderSelectStyle: React.CSSProperties = {
	boxSizing: 'border-box',
	width: 250,
};

const folderIconStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 16,
	width: 16,
};

const folderLabelStyle: React.CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	display: 'flex',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'normal',
	minWidth: 0,
};

const folderLabelTextStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'normal',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const FolderDropdownLabel: React.FC<{
	readonly indentation: number;
	readonly folderPath: string | null;
}> = ({folderPath, indentation}) => {
	return (
		<div style={folderLabelStyle}>
			<Spacing x={indentation * 1.5} />
			{folderPath === null ? (
				<div style={folderIconStyle} />
			) : (
				<CollapsedFolderIcon color={LIGHT_TEXT} style={folderIconStyle} />
			)}
			<Spacing x={1} />
			<span style={folderLabelTextStyle}>{folderPath ?? 'None'}</span>
		</div>
	);
};

const rootFolderId = 'new-composition-root-folder';
const folderSelectIdPrefix = 'new-composition-folder-';

export type NewCompositionFormValues = {
	readonly durationInFrames: number;
	readonly folder: {
		readonly folderName: string | null;
		readonly parentName: string | null;
		readonly stack: string | null;
	};
	readonly fps: number;
	readonly id: string;
	readonly size: {
		readonly height: number;
		readonly width: number;
	};
};

export const NewCompositionFields: React.FC<{
	readonly heightValidationMessage: string | null;
	readonly inputRef: RefObject<HTMLInputElement | null>;
	readonly nameValidationMessage: string | null;
	readonly setValues: Dispatch<SetStateAction<NewCompositionFormValues>>;
	readonly values: NewCompositionFormValues;
	readonly widthValidationMessage: string | null;
}> = ({
	heightValidationMessage,
	inputRef,
	nameValidationMessage,
	setValues,
	values,
	widthValidationMessage,
}) => {
	const {folders} = useContext(Internals.CompositionManager);
	const {compositionSortOrder} = useContext(FolderContext);
	const selectedFolderId = values.folder.folderName
		? `${folderSelectIdPrefix}${getFolderId({
				folderName: values.folder.folderName,
				parentName: values.folder.parentName,
			})}`
		: rootFolderId;
	const folderValues = useMemo((): ComboboxValue[] => {
		const foldersInTreeOrder: (typeof folders)[number][] = [];
		const sortedFolders =
			compositionSortOrder === 'alphabetical'
				? folders
						.slice()
						.sort((a, b) =>
							a.name.localeCompare(b.name, undefined, {numeric: true}),
						)
				: sortItemsByNonceHistory(folders);
		const appendFolders = (parent: string | null) => {
			sortedFolders
				.filter((folder) => folder.parent === parent)
				.forEach((folder) => {
					foldersInTreeOrder.push(folder);
					appendFolders(
						getFolderId({folderName: folder.name, parentName: folder.parent}),
					);
				});
		};

		appendFolders(null);

		return [
			{
				id: rootFolderId,
				keyHint: null,
				label: <FolderDropdownLabel folderPath={null} indentation={0} />,
				leftItem: values.folder.folderName === null ? <Checkmark /> : null,
				onClick: () => {
					setValues((current) => ({
						...current,
						folder: {
							folderName: null,
							parentName: null,
							stack: null,
						},
					}));
				},
				quickSwitcherLabel: 'None',
				subMenu: null,
				type: 'item',
				value: rootFolderId,
			},
			...(folders.length === 0
				? []
				: [
						{
							id: 'new-composition-root-folder-divider',
							type: 'divider' as const,
						},
					]),
			...foldersInTreeOrder.map((folder): ComboboxValue => {
				const folderPath = getFolderId({
					folderName: folder.name,
					parentName: folder.parent,
				});
				const indentation = folder.parent?.split('/').length ?? 0;
				const id = `${folderSelectIdPrefix}${folderPath}`;
				return {
					id,
					keyHint: null,
					label: (
						<FolderDropdownLabel
							folderPath={folderPath}
							indentation={indentation}
						/>
					),
					leftItem: selectedFolderId === id ? <Checkmark /> : null,
					onClick: () => {
						setValues((current) => ({
							...current,
							folder: {
								folderName: folder.name,
								parentName: folder.parent,
								stack: folder.stack,
							},
						}));
					},
					quickSwitcherLabel: folderPath,
					subMenu: null,
					type: 'item',
					value: id,
					disabled: folder.stack === null,
				};
			}),
		];
	}, [
		compositionSortOrder,
		folders,
		selectedFolderId,
		setValues,
		values.folder.folderName,
	]);

	const onWidthChanged = useCallback(
		(newValue: string) => {
			setValues((current) => ({
				...current,
				size: {height: current.size.height, width: Number(newValue)},
			}));
		},
		[setValues],
	);
	const onWidthDirectlyChanged = useCallback(
		(newWidth: number) => {
			setValues((current) => ({
				...current,
				size: {height: current.size.height, width: newWidth},
			}));
		},
		[setValues],
	);
	const onHeightChanged = useCallback(
		(newValue: string) => {
			setValues((current) => ({
				...current,
				size: {height: Number(newValue), width: current.size.width},
			}));
		},
		[setValues],
	);
	const onHeightDirectlyChanged = useCallback(
		(newHeight: number) => {
			setValues((current) => ({
				...current,
				size: {height: newHeight, width: current.size.width},
			}));
		},
		[setValues],
	);
	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			setValues((current) => ({...current, id: event.target.value}));
		},
		[setValues],
	);
	const onTextFpsChange = useCallback(
		(newFps: string) => {
			setValues((current) => ({...current, fps: Number(newFps)}));
		},
		[setValues],
	);
	const onFpsChange = useCallback(
		(newFps: number) => {
			setValues((current) => ({...current, fps: newFps}));
		},
		[setValues],
	);
	const setDurationInFrames: Dispatch<SetStateAction<number>> = useCallback(
		(update) => {
			setValues((current) => ({
				...current,
				durationInFrames:
					typeof update === 'function'
						? update(current.durationInFrames)
						: update,
			}));
		},
		[setValues],
	);

	return (
		<>
			<div style={optionRow}>
				<div style={label}>Folder</div>
				<div style={rightRow}>
					<Combobox
						values={folderValues}
						selectedId={selectedFolderId}
						style={folderSelectStyle}
						title="Folder"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>ID</div>
				<div style={rightRow}>
					<InputAndValidationContainer>
						<RemotionInput
							ref={inputRef}
							value={values.id}
							onChange={onNameChange}
							type="text"
							autoFocus
							placeholder="Composition ID"
							status="ok"
							rightAlign
						/>
						{nameValidationMessage ? (
							<>
								<Spacing y={1} block />
								<ValidationMessage
									align="flex-start"
									message={nameValidationMessage}
									type="error"
								/>
							</>
						) : null}
					</InputAndValidationContainer>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Width</div>
				<div style={rightRow}>
					<InputAndValidationContainer>
						<InputDragger
							aria-label="Width"
							type="number"
							value={values.size.width}
							placeholder="Width"
							onTextChange={onWidthChanged}
							name="width"
							step={2}
							min={2}
							required
							status="ok"
							formatter={(width) => `${width}px`}
							max={100000000}
							onValueChange={onWidthDirectlyChanged}
							rightAlign={false}
						/>
						{widthValidationMessage ? (
							<>
								<Spacing y={1} block />
								<ValidationMessage
									align="flex-start"
									message={widthValidationMessage}
									type="error"
								/>
							</>
						) : null}
					</InputAndValidationContainer>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Height</div>
				<div style={rightRow}>
					<InputAndValidationContainer>
						<InputDragger
							aria-label="Height"
							type="number"
							value={values.size.height}
							onTextChange={onHeightChanged}
							placeholder="Height"
							name="height"
							step={2}
							required
							formatter={(height) => `${height}px`}
							min={2}
							status="ok"
							max={100000000}
							onValueChange={onHeightDirectlyChanged}
							rightAlign={false}
						/>
						{heightValidationMessage ? (
							<>
								<Spacing y={1} block />
								<ValidationMessage
									align="flex-start"
									message={heightValidationMessage}
									type="error"
								/>
							</>
						) : null}
					</InputAndValidationContainer>
				</div>
			</div>
			<NewCompDuration
				durationInFrames={values.durationInFrames}
				setDurationInFrames={setDurationInFrames}
			/>
			<div style={optionRow}>
				<div style={label}>FPS</div>
				<div style={rightRow}>
					<InputDragger
						aria-label="FPS"
						type="number"
						value={values.fps}
						onTextChange={onTextFpsChange}
						placeholder="Frame rate (fps)"
						name="fps"
						min={1}
						required
						status="ok"
						max={240}
						step={0.01}
						onValueChange={onFpsChange}
						rightAlign={false}
					/>
				</div>
			</div>
		</>
	);
};

const NewCompositionLoaded: React.FC<{
	readonly folderName: string | null;
	readonly parentName: string | null;
	readonly stack: string | null;
	readonly canvasCapture: CanvasCaptureImport | null;
}> = ({canvasCapture, folderName, parentName, stack}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const resolvedComposition = Internals.useResolvedVideoConfig(null);
	const initialComposition =
		resolvedComposition?.type === 'success' ||
		resolvedComposition?.type === 'success-and-refreshing'
			? resolvedComposition.result
			: null;
	const initialDimensions = getNewCompositionDefaults(
		initialComposition,
		canvasCapture?.durationInSeconds ?? null,
	);
	const [values, setValues] = useState<NewCompositionFormValues>(() => ({
		durationInFrames: initialDimensions.durationInFrames,
		folder: {folderName, parentName, stack},
		fps: initialDimensions.fps,
		id: getUniqueCompositionName(compositions),
		size: {
			height: initialDimensions.height,
			width: initialDimensions.width,
		},
	}));
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.select();
	}, []);

	const {
		codemod,
		createComposition,
		heightValidationMessage,
		nameValidationMessage,
		valid,
		widthValidationMessage,
	} = useCreateComposition({
		compositions,
		durationInFrames: values.durationInFrames,
		folderName: values.folder.folderName,
		newId: values.id,
		parentName: values.folder.parentName,
		selectedFrameRate: values.fps,
		size: values.size,
		canvasCapture:
			canvasCapture === null
				? null
				: {
						data: canvasCapture.data,
						videoFileName: canvasCapture.file.name,
						videoHeight: canvasCapture.height,
						videoWidth: canvasCapture.width,
					},
	});

	const createCanvasCaptureComposition = useCallback(
		async ({
			signal,
			symbolicatedStack,
		}: Parameters<typeof createComposition>[0]) => {
			if (canvasCapture !== null) {
				const existingFile = getStaticFiles().find(
					(file) => file.name === canvasCapture.file.name,
				);
				if (
					existingFile !== undefined &&
					existingFile.sizeInBytes !== canvasCapture.file.size
				) {
					throw new Error(
						`File with name ${canvasCapture.file.name} already exists and is different`,
					);
				}

				await installRequiredPackages([
					{name: '@remotion/media', version: null},
					{name: '@remotion/mac-cursors', version: null},
				]);
				if (existingFile === undefined) {
					await writeStaticFile({
						contents: await canvasCapture.file.arrayBuffer(),
						filePath: canvasCapture.file.name,
					});
				}
			}

			return createComposition({signal, symbolicatedStack});
		},
		[canvasCapture, createComposition],
	);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	return (
		<>
			<ModalHeader
				title={
					canvasCapture === null ? 'New composition' : 'Import Canvas Capture'
				}
			/>
			<form onSubmit={onSubmit}>
				<div style={content}>
					<NewCompositionFields
						heightValidationMessage={heightValidationMessage}
						inputRef={inputRef}
						nameValidationMessage={nameValidationMessage}
						setValues={setValues}
						values={values}
						widthValidationMessage={widthValidationMessage}
					/>
				</div>
				<ModalFooterContainer>
					<CodemodFooter
						loadingNotification={null}
						errorNotification="Could not create composition"
						genericSubmitLabel="Add to root file"
						submitLabel={({relativeRootPath}) => `Add to ${relativeRootPath}`}
						codemod={codemod}
						stack={values.folder.stack}
						valid={valid}
						onSuccess={null}
						applyCodemod={({signal, symbolicatedStack}) =>
							createCanvasCaptureComposition({
								signal,
								symbolicatedStack,
							})
						}
						applyCodemodForPreview={null}
						fallbackToRootFile
					/>
				</ModalFooterContainer>
			</form>
		</>
	);
};

export const NewComposition: React.FC<{
	readonly folderName: string | null;
	readonly parentName: string | null;
	readonly stack: string | null;
	readonly canvasCapture: CanvasCaptureImport | null;
}> = ({canvasCapture, folderName, parentName, stack}) => {
	return (
		<DismissableModal>
			<NewCompositionLoaded
				canvasCapture={canvasCapture}
				folderName={folderName}
				parentName={parentName}
				stack={stack}
			/>
		</DismissableModal>
	);
};
