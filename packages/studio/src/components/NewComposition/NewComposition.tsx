import type * as Codemods from '@remotion/codemods';
import {CanvasInternals} from '@remotion/sdk';
import type {
	PrepareOpenTimelineImportRequest,
	PrepareOpenTimelineImportResponse,
} from '@remotion/studio-shared';
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
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {LIGHT_TEXT} from '../../helpers/colors';
import {getFolderId} from '../../helpers/get-folder-id';
import {getNativeFilePickerPosition} from '../../helpers/get-native-file-picker-position';
import {installRequiredPackages} from '../../helpers/install-required-package';
import {
	getNewCompositionNaming,
	getUniqueCompositionName,
	useCreateComposition,
} from '../../helpers/use-create-composition';
import {Checkmark} from '../../icons/Checkmark';
import {CollapsedFolderIcon} from '../../icons/folder';
import {FolderContext} from '../../state/folders';
import type {CanvasCaptureImport, ModalState} from '../../state/modals';
import {Button} from '../Button';
import {callApi} from '../call-api';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import type {ComboboxValue} from './ComboBox';
import {Combobox} from './ComboBox';
import {CompositionEditFooter} from './CompositionEditFooter';
import {CompositionIdField} from './CompositionIdField';
import {DismissableModal} from './DismissableModal';
import {getNewCompositionDefaults} from './get-new-composition-defaults';
import {getOpenTimelineFrameRate} from './get-open-timeline-frame-rate';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {InputDragger} from './InputDragger';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const {sortItemsByCommitOrder} = CanvasInternals;

type ClientTimelineGenerator = typeof Codemods.generateOpenTimelineComposition;

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const importDetailsStyle: React.CSSProperties = {
	paddingLeft: optionRow.paddingLeft,
	paddingRight: optionRow.paddingRight,
};

const fixedFrameRateStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1.5,
	padding: '4px 6px',
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
	readonly folderName: string | null;
}> = ({folderName, indentation}) => {
	return (
		<div style={folderLabelStyle}>
			<Spacing x={indentation * 1.5} />
			{folderName === null ? (
				<div style={folderIconStyle} />
			) : (
				<CollapsedFolderIcon color={LIGHT_TEXT} style={folderIconStyle} />
			)}
			<Spacing x={1} />
			<span style={folderLabelTextStyle}>{folderName ?? 'None'}</span>
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
	readonly fixedDuration: {durationInFrames: number | null} | null;
	readonly fixedFps: number | null;
	readonly compositionId: string;
	readonly heightValidationMessage: string | null;
	readonly inputRef: RefObject<HTMLInputElement | null>;
	readonly nameValidationMessage: string | null;
	readonly setValues: Dispatch<SetStateAction<NewCompositionFormValues>>;
	readonly values: NewCompositionFormValues;
	readonly widthValidationMessage: string | null;
}> = ({
	fixedDuration,
	fixedFps,
	compositionId,
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
				: sortItemsByCommitOrder(folders, (folder) => folder.order);
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
				label: <FolderDropdownLabel folderName={null} indentation={0} />,
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
							folderName={folder.name}
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
					quickSwitcherLabel: folder.name,
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
						aria-label="Folder"
					/>
				</div>
			</div>
			<CompositionIdField
				compositionId={compositionId}
				inputRef={inputRef}
				onChange={onNameChange}
				validationMessage={nameValidationMessage}
				value={values.id}
			/>
			<div style={optionRow}>
				<div style={label}>Width</div>
				<div style={rightRow}>
					<InputAndValidationContainer>
						<InputDragger
							onValueChangeCancel={null}
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
							onValueChangeCancel={null}
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
				durationInFrames={
					fixedDuration === null
						? values.durationInFrames
						: fixedDuration.durationInFrames
				}
				setDurationInFrames={
					fixedDuration === null ? setDurationInFrames : null
				}
			/>
			<div style={optionRow}>
				<div style={label}>FPS</div>
				<div style={rightRow}>
					{fixedFps === null ? (
						<InputDragger
							onValueChangeCancel={null}
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
					) : (
						<span style={fixedFrameRateStyle}>
							{Number(fixedFps.toFixed(3))}
						</span>
					)}
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
	readonly openTimeline: Extract<
		ModalState,
		{type: 'new-comp'}
	>['openTimeline'];
}> = ({canvasCapture, folderName, parentName, stack, openTimeline}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const nativeFilePicker =
		!isBrowserStudio && window.remotion_supportsNativeFilePicker;
	const [mediaDirectory, setMediaDirectory] = useState(
		openTimeline?.mediaDirectory ?? '',
	);
	const [pickingMediaDirectory, setPickingMediaDirectory] = useState(false);
	const mediaPickerController = useRef<AbortController | null>(null);
	useEffect(() => () => mediaPickerController.current?.abort(), []);
	const onLocateMedia = useCallback(async () => {
		const controller = new AbortController();
		mediaPickerController.current = controller;
		setPickingMediaDirectory(true);
		try {
			const selected = await callApi(
				'/api/pick-open-timeline',
				{
					type: 'media-directory',
					initialDirectory: mediaDirectory || null,
					position: getNativeFilePickerPosition(),
				},
				controller.signal,
			);
			if (selected?.type === 'media-directory' && !controller.signal.aborted) {
				setMediaDirectory(selected.mediaDirectory);
			}
		} catch (error) {
			if (!controller.signal.aborted) {
				showNotification(
					`Could not locate media: ${(error as Error).message}`,
					5000,
				);
			}
		} finally {
			mediaPickerController.current = null;
			setPickingMediaDirectory(false);
		}
	}, [mediaDirectory]);
	const [serverImport, setServerImport] = useState<{
		request: PrepareOpenTimelineImportRequest;
		response: PrepareOpenTimelineImportResponse | null;
		error: string | null;
	} | null>(null);
	const importedFrameRate = useMemo(
		() =>
			openTimeline === null
				? null
				: getOpenTimelineFrameRate(openTimeline.contents),
		[openTimeline],
	);
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
		fps: importedFrameRate ?? initialDimensions.fps,
		id: getUniqueCompositionName(
			compositions,
			openTimeline?.name.replace(/\.otio$/i, '') ?? null,
		),
		size: {
			height: initialDimensions.height,
			width: initialDimensions.width,
		},
	}));
	const frameRate = importedFrameRate ?? values.fps;
	const inputRef = useRef<HTMLInputElement>(null);
	const [generateClientTimeline, setGenerateClientTimeline] =
		useState<ClientTimelineGenerator | null>(null);
	const [clientImportError, setClientImportError] = useState<string | null>(
		null,
	);
	const shouldLoadClientTimeline = isBrowserStudio && openTimeline !== null;
	useEffect(() => {
		if (!shouldLoadClientTimeline) return;
		let active = true;
		setClientImportError(null);
		import('@remotion/codemods')
			.then(({generateOpenTimelineComposition}) => {
				if (active) {
					setGenerateClientTimeline(() => generateOpenTimelineComposition);
				}
			})
			.catch((error: unknown) => {
				if (active) {
					setClientImportError(
						error instanceof Error ? error.message : String(error),
					);
				}
			});
		return () => {
			active = false;
		};
	}, [shouldLoadClientTimeline]);
	const clientTimelineResult = useMemo(() => {
		if (
			openTimeline === null ||
			!isBrowserStudio ||
			generateClientTimeline === null
		)
			return null;
		return generateClientTimeline({
			timeline: openTimeline.contents,
			componentName: getNewCompositionNaming(values.id, compositions)
				.componentName,
			width: values.size.width,
			height: values.size.height,
			fps: frameRate,
		});
	}, [
		compositions,
		generateClientTimeline,
		isBrowserStudio,
		openTimeline,
		frameRate,
		values.id,
		values.size.height,
		values.size.width,
	]);
	const importRequest = useMemo((): PrepareOpenTimelineImportRequest | null => {
		if (
			openTimeline === null ||
			isBrowserStudio ||
			previewServerState.type !== 'connected'
		)
			return null;
		return {
			contents: openTimeline.contents,
			mediaDirectory: mediaDirectory || null,
			componentName: getNewCompositionNaming(values.id, compositions)
				.componentName,
			fps: frameRate,
			width: values.size.width,
			height: values.size.height,
		};
	}, [
		compositions,
		frameRate,
		isBrowserStudio,
		mediaDirectory,
		openTimeline,
		previewServerState.type,
		values.id,
		values.size.height,
		values.size.width,
	]);
	useEffect(() => {
		if (importRequest === null) return;
		const controller = new AbortController();
		callApi(
			'/api/prepare-open-timeline-import',
			importRequest,
			controller.signal,
		)
			.then((response) => {
				if (!controller.signal.aborted)
					setServerImport({request: importRequest, response, error: null});
			})
			.catch((error: Error) => {
				if (!controller.signal.aborted)
					setServerImport({
						request: importRequest,
						response: null,
						error: error.message,
					});
			});
		return () => controller.abort();
	}, [importRequest]);
	const currentServerImport =
		serverImport?.request === importRequest ? serverImport : null;
	const timelineResult = isBrowserStudio
		? clientTimelineResult
		: (currentServerImport?.response ?? null);
	const openTimelineOptions = useMemo(
		() =>
			openTimeline === null
				? null
				: {
						contents: openTimeline.contents,
						mediaDirectory: mediaDirectory || null,
					},
		[mediaDirectory, openTimeline],
	);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.select();
	}, []);

	const {
		compositionId,
		createComposition,
		heightValidationMessage,
		nameValidationMessage,
		valid,
		widthValidationMessage,
	} = useCreateComposition({
		asset: null,
		openTimeline: openTimelineOptions,
		compositions,
		durationInFrames:
			timelineResult?.metadata?.durationInFrames ?? values.durationInFrames,
		folderName: values.folder.folderName,
		newId: values.id,
		parentName: values.folder.parentName,
		selectedFrameRate: frameRate,
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

	const onCreateComposition = useCallback(
		async ({
			signal,
			symbolicatedStack,
		}: Parameters<typeof createComposition>[0]) => {
			if (openTimeline !== null) {
				if (timelineResult === null || timelineResult.source === null) {
					throw new Error(
						'Resolve the timeline import errors before importing.',
					);
				}

				if (timelineResult.source.includes("from '@remotion/media'")) {
					await installRequiredPackages([
						{name: '@remotion/media', version: null},
					]);
				}
			}

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
		[canvasCapture, createComposition, openTimeline, timelineResult],
	);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	return (
		<>
			<ModalHeader
				title={
					openTimeline !== null
						? 'Import OpenTimeline'
						: canvasCapture === null
							? 'New composition'
							: 'Import Canvas Capture'
				}
			/>
			<form onSubmit={onSubmit}>
				<div style={content}>
					<NewCompositionFields
						fixedFps={importedFrameRate}
						fixedDuration={
							openTimeline === null
								? null
								: {
										durationInFrames:
											timelineResult?.metadata?.durationInFrames ?? null,
									}
						}
						compositionId={compositionId}
						heightValidationMessage={heightValidationMessage}
						inputRef={inputRef}
						nameValidationMessage={nameValidationMessage}
						setValues={setValues}
						values={values}
						widthValidationMessage={widthValidationMessage}
					/>
					{openTimeline !== null && !isBrowserStudio ? (
						<>
							{!nativeFilePicker && serverImport?.response?.hasRelativeMedia ? (
								<div style={optionRow}>
									<div style={label}>Media folder</div>
									<div style={rightRow}>
										<div style={folderSelectStyle}>
											<RemotionInput
												aria-label="Media folder"
												value={mediaDirectory}
												onChange={(event) =>
													setMediaDirectory(event.target.value)
												}
												placeholder="Project folder"
												status="ok"
												rightAlign={false}
											/>
										</div>
									</div>
								</div>
							) : null}
							<div style={importDetailsStyle}>
								{currentServerImport === null ? (
									<p style={{fontSize: 13, color: LIGHT_TEXT}}>
										Checking media...
									</p>
								) : currentServerImport.error ? (
									<ValidationMessage
										align="flex-start"
										type="error"
										message={currentServerImport.error}
									/>
								) : currentServerImport.response?.source ? (
									<p style={{fontSize: 13, color: LIGHT_TEXT}}>
										{currentServerImport.response.filesToCopy === 0
											? 'Referenced media is already available.'
											: `${currentServerImport.response.filesToCopy} media ${currentServerImport.response.filesToCopy === 1 ? 'file' : 'files'} will be copied into the public folder.`}
									</p>
								) : null}
							</div>
						</>
					) : null}
					{shouldLoadClientTimeline && generateClientTimeline === null ? (
						<div style={importDetailsStyle}>
							{clientImportError === null ? (
								<p style={{fontSize: 13, color: LIGHT_TEXT}}>
									Loading timeline importer...
								</p>
							) : (
								<ValidationMessage
									align="flex-start"
									type="error"
									message={clientImportError}
								/>
							)}
						</div>
					) : null}
					{timelineResult !== null ? (
						<div style={importDetailsStyle}>
							{importedFrameRate === null &&
							timelineResult.metadata !== null ? (
								<ValidationMessage
									align="flex-start"
									type="warning"
									message="No single timeline frame rate was found. Choose FPS for this import."
								/>
							) : null}
							{isBrowserStudio ? (
								<p style={{fontSize: 13, color: LIGHT_TEXT}}>
									Use media already in the public folder or online. Import local
									files using a Studio with a server.
								</p>
							) : null}
							<div
								className={VERTICAL_SCROLLBAR_CLASSNAME}
								style={{maxHeight: 160, overflowY: 'auto'}}
							>
								{timelineResult.diagnostics
									.filter((diagnostic) => diagnostic.severity !== 'info')
									.map((diagnostic) => (
										<ValidationMessage
											key={`${diagnostic.path}:${diagnostic.code}:${diagnostic.message}`}
											align="flex-start"
											type={
												diagnostic.severity === 'error' ? 'error' : 'warning'
											}
											message={`${diagnostic.path}: ${diagnostic.message}`}
										/>
									))}
							</div>
							{nativeFilePicker &&
							timelineResult.diagnostics.some(
								(diagnostic) => diagnostic.code === 'media-resolver-failed',
							) ? (
								<div style={{marginTop: 8}}>
									<Button
										onClick={onLocateMedia}
										disabled={
											pickingMediaDirectory ||
											previewServerState.type !== 'connected'
										}
									>
										{pickingMediaDirectory
											? 'Locating media...'
											: 'Locate media...'}
									</Button>
								</div>
							) : null}
						</div>
					) : null}
				</div>
				<ModalFooterContainer>
					<CompositionEditFooter
						loadingNotification={
							openTimeline === null ? null : 'Importing timeline...'
						}
						errorNotification="Could not create composition"
						genericSubmitLabel="Add to root file"
						submitLabel={({relativeRootPath}) => `Add to ${relativeRootPath}`}
						stack={values.folder.stack}
						valid={
							valid &&
							(openTimeline === null ||
								(timelineResult !== null && timelineResult.source !== null))
						}
						onSuccess={null}
						applyEdit={({signal, symbolicatedStack}) =>
							onCreateComposition({
								signal,
								symbolicatedStack,
							})
						}
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
	readonly openTimeline: Extract<
		ModalState,
		{type: 'new-comp'}
	>['openTimeline'];
}> = ({canvasCapture, folderName, parentName, stack, openTimeline}) => {
	return (
		<DismissableModal>
			<NewCompositionLoaded
				openTimeline={openTimeline}
				canvasCapture={canvasCapture}
				folderName={folderName}
				parentName={parentName}
				stack={stack}
			/>
		</DismissableModal>
	);
};
