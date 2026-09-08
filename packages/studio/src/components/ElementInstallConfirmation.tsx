import {StudioProtocolInternals} from '@remotion/studio-protocol';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';
import {Internals} from 'remotion';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	TRANSPARENT,
	WARNING_COLOR,
	WHITE,
	WHITE_ALPHA_12,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import {useCreateComposition} from '../helpers/use-create-composition';
import {validateCompositionName} from '../helpers/validate-new-comp-data';
import type {
	ElementInstallModalState,
	ElementInstallPlan,
} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {Button} from './Button';
import {prepareElementInstall} from './element-install-api';
import {insertElement} from './import-assets';
import {Flex, Row, Spacing} from './layout';
import {
	HORIZONTAL_SCROLLBAR_CLASSNAME,
	VERTICAL_SCROLLBAR_CLASSNAME,
} from './Menu/is-menu-item';
import {getPortal} from './Menu/portals';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {
	NewCompositionFields,
	type NewCompositionFormValues,
} from './NewComposition/NewComposition';
import {RemotionInput} from './NewComposition/RemInput';
import {
	ValidationMessage,
	WarningTriangle,
} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {RadioButton} from './RadioButton';
import {SegmentedControl} from './SegmentedControl';
import {
	hasResolvedStack,
	useResolvedStack,
} from './Timeline/use-resolved-stack';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 20,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
};

const dialogContent: React.CSSProperties = {
	...container,
	padding: 16,
	width: 'min(520px, calc(100vw - 40px))',
	maxHeight: 'min(720px, calc(100vh - 140px))',
	overflowY: 'auto',
};

const sectionStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
};

const sectionTitleStyle: React.CSSProperties = {
	margin: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 600,
	lineHeight: 1.5,
};

const metadataStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	margin: 0,
};

const metadataRowStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '120px minmax(0, 1fr)',
	alignItems: 'baseline',
	gap: 12,
};

const metadataTermStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.5,
};

const metadataDescriptionStyle: React.CSSProperties = {
	margin: 0,
	minWidth: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 400,
	lineHeight: 1.5,
	overflowWrap: 'anywhere',
};

const requestSourceStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	gap: 16,
	margin: 0,
};

const requestSourceDescriptionStyle: React.CSSProperties = {
	...metadataDescriptionStyle,
	color: LIGHT_TEXT,
	textAlign: 'right',
};

const unverifiedRequestSourceStyle: React.CSSProperties = {
	...requestSourceDescriptionStyle,
	color: WARNING_COLOR,
};

const codeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.5,
};

const overwriteStyle: React.CSSProperties = {
	margin: 0,
	color: WARNING_COLOR,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.5,
};

const dependencyListStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	margin: 0,
	padding: 0,
	listStyleType: 'none',
	textAlign: 'right',
	minWidth: 0,
};

const dependencyNameStyle: React.CSSProperties = {
	minWidth: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
	overflowWrap: 'anywhere',
};

const warningStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'flex-start',
	gap: 10,
	minWidth: 0,
};

const warningIconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	marginTop: 1,
	flexShrink: 0,
	fill: WARNING_COLOR,
};

const warningDescriptionStyle: React.CSSProperties = {
	margin: 0,
	minWidth: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 400,
	lineHeight: 1.5,
};

const browseElementsStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	fontWeight: 600,
	lineHeight: 'inherit',
};

const sourceDetailsStyle: React.CSSProperties = {
	paddingTop: 2,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
};

const sourceSummaryStyle: React.CSSProperties = {
	cursor: 'default',
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.5,
};

const sourceCodeContainerStyle: React.CSSProperties = {
	marginTop: 10,
	overflow: 'hidden',
	border: `1px solid ${WHITE_ALPHA_12}`,
	borderRadius: 6,
	backgroundColor: INPUT_BACKGROUND,
};

const sourceCodeBlockStyle: React.CSSProperties = {
	margin: 0,
	maxHeight: 240,
	overflow: 'auto',
	padding: 12,
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.5,
	whiteSpace: 'pre',
};

const sourceCodeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const destinationControlStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	columnGap: 16,
	rowGap: 10,
	flexWrap: 'wrap',
};

const footerStyle: React.CSSProperties = {
	minWidth: 0,
};

const cancelStyle: React.CSSProperties = {
	minWidth: 90,
};

const elementInstallTitleId = 'remotion-element-install-title';

const makeSourceControlsVisible = (sourceCode: string) => {
	return sourceCode.replace(
		/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,
		(character) => {
			return `\\u${character.codePointAt(0)?.toString(16).padStart(4, '0')}`;
		},
	);
};

export const ElementLibraryAddConfirmation: React.FC<{
	readonly displayName: string | null;
	readonly origin: string;
	readonly url: string;
}> = ({displayName, origin, url}) => {
	return (
		<div style={container}>
			<dl style={metadataStyle} aria-label="Catalog details">
				{displayName === null ? null : (
					<div style={metadataRowStyle}>
						<dt style={metadataTermStyle}>Display name</dt>
						<dd style={metadataDescriptionStyle}>{displayName}</dd>
					</div>
				)}
				<div style={metadataRowStyle}>
					<dt style={metadataTermStyle}>Request source</dt>
					<dd style={metadataDescriptionStyle}>{origin}</dd>
				</div>
				<div style={metadataRowStyle}>
					<dt style={metadataTermStyle}>Catalog URL</dt>
					<dd style={metadataDescriptionStyle}>
						<code style={codeStyle}>{url}</code>
					</dd>
				</div>
			</dl>

			<div style={warningStyle}>
				<WarningTriangle style={warningIconStyle} />
				<p style={warningDescriptionStyle}>
					This adds the catalog to{' '}
					<strong style={browseElementsStyle}>Browse Elements</strong> when
					nothing is selected on the canvas. It is saved in{' '}
					<code style={codeStyle}>remotion.config.ts</code>.
				</p>
			</div>
		</div>
	);
};

type PreparedElementInstallation = {
	basePlan: ElementInstallPlan;
	name: string;
	refresh: number;
	plan: ElementInstallPlan & {filePath: string};
};

type NewCompositionPlanState =
	| {
			readonly type: 'loading';
			readonly folderStack: string;
	  }
	| {
			readonly type: 'ready';
			readonly folderStack: string | null;
			readonly plan: ElementInstallPlan;
	  }
	| {
			readonly type: 'error';
			readonly folderStack: string;
			readonly reason: string;
	  };

export const ElementInstallConfirmation: React.FC<{
	readonly state: ElementInstallModalState;
}> = ({state}) => {
	const {
		currentPlan,
		missingPackages,
		newPlan,
		onClose,
		request,
		sourceIsUnverified,
		sourceLabel,
	} = state;
	const config = Internals.useUnsafeVideoConfig();
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const currentCompositionMetadata =
		config === null ||
		canvasContent?.type !== 'composition' ||
		canvasContent.compositionId !== request.compositionId
			? null
			: {
					durationInFrames: config.durationInFrames,
					fps: config.fps,
					height: config.height,
					width: config.width,
				};
	const {currentZIndex} = useZIndex();
	const [mode, setMode] = useState<'current-composition' | 'new-composition'>(
		currentPlan === null || request.source.type === 'browser-studio-link'
			? 'new-composition'
			: 'current-composition',
	);
	const [submitting, setSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [newCompositionValues, setNewCompositionValues] =
		useState<NewCompositionFormValues>(() => {
			const elementComponentName =
				StudioProtocolInternals.getElementComponentNameFromSourceCode(
					request.element.sourceCode,
				) ?? 'Element';
			const baseName = `${elementComponentName}Composition`;
			let candidate = baseName;
			let suffix = 2;
			while (validateCompositionName(candidate, compositions) !== null) {
				candidate = `${baseName}${suffix}`;
				suffix++;
			}

			const size =
				request.element.dimensions ??
				(currentCompositionMetadata === null
					? {width: 1920, height: 1080}
					: {
							width: currentCompositionMetadata.width,
							height: currentCompositionMetadata.height,
						});

			return {
				durationInFrames:
					request.element.durationInFrames ??
					currentCompositionMetadata?.durationInFrames ??
					150,
				folder: {folderName: null, parentName: null, stack: null},
				fps: currentCompositionMetadata?.fps ?? 30,
				id: candidate,
				size,
			};
		});
	const selectedFolderStack = newCompositionValues.folder.stack;
	const resolvedFolderLocation = useResolvedStack(selectedFolderStack);
	const folderSymbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedFolderLocation),
		[resolvedFolderLocation],
	);
	const folderCompositionFile =
		folderSymbolicatedStack?.originalFileName ?? null;
	const [newCompositionPlanState, setNewCompositionPlanState] =
		useState<NewCompositionPlanState>({
			folderStack: null,
			type: 'ready',
			plan: newPlan,
		});

	useEffect(() => {
		if (selectedFolderStack === null) {
			setNewCompositionPlanState({
				folderStack: null,
				type: 'ready',
				plan: newPlan,
			});
			return;
		}

		if (!hasResolvedStack(selectedFolderStack)) {
			setNewCompositionPlanState({
				folderStack: selectedFolderStack,
				type: 'loading',
			});
			return;
		}

		if (folderCompositionFile === null) {
			setNewCompositionPlanState({
				folderStack: selectedFolderStack,
				type: 'error',
				reason:
					'Could not determine where the new composition should be created.',
			});
			return;
		}

		let canceled = false;
		setNewCompositionPlanState({
			folderStack: selectedFolderStack,
			type: 'loading',
		});
		prepareElementInstall({
			installationName: null,
			destination: {
				type: 'new-composition',
				compositionFile: folderCompositionFile,
			},
			element: request.element,
		})
			.then((result) => {
				if (canceled) {
					return;
				}

				setNewCompositionPlanState(
					result.success
						? {
								folderStack: selectedFolderStack,
								type: 'ready',
								plan: result.plan,
							}
						: {
								folderStack: selectedFolderStack,
								type: 'error',
								reason: result.reason,
							},
				);
			})
			.catch((error) => {
				if (!canceled) {
					setNewCompositionPlanState({
						folderStack: selectedFolderStack,
						type: 'error',
						reason: error instanceof Error ? error.message : String(error),
					});
				}
			});

		return () => {
			canceled = true;
		};
	}, [folderCompositionFile, newPlan, request.element, selectedFolderStack]);

	const {
		createComposition,
		heightValidationMessage,
		nameValidationMessage,
		valid: newCompositionValuesAreValid,
		widthValidationMessage,
	} = useCreateComposition({
		canvasCapture: null,
		compositions,
		durationInFrames: newCompositionValues.durationInFrames,
		folderName: newCompositionValues.folder.folderName,
		newId: newCompositionValues.id,
		parentName: newCompositionValues.folder.parentName,
		selectedFrameRate: newCompositionValues.fps,
		size: newCompositionValues.size,
	});
	const activeNewCompositionPlanState =
		newCompositionPlanState.folderStack === selectedFolderStack
			? newCompositionPlanState
			: null;
	const selectedNewCompositionPlan =
		activeNewCompositionPlanState?.type === 'ready'
			? activeNewCompositionPlanState.plan
			: null;
	const selectedPlan =
		mode === 'current-composition' ? currentPlan : selectedNewCompositionPlan;
	const elementBaseName = request.element.slug.split('/').at(-1) ?? '';
	const [refreshPlan, setRefreshPlan] = useState(0);
	const [input, setInput] = useState<{
		basePlan: ElementInstallPlan | null;
		baseName: string;
		refresh: number;
		name: string | null;
		overwritePlan: ElementInstallPlan | null;
	}>({
		basePlan: selectedPlan,
		baseName: elementBaseName,
		refresh: refreshPlan,
		name: null,
		overwritePlan: null,
	});
	if (
		input.basePlan !== selectedPlan ||
		input.baseName !== elementBaseName ||
		input.refresh !== refreshPlan
	) {
		setInput({
			basePlan: selectedPlan,
			baseName: elementBaseName,
			refresh: refreshPlan,
			name: null,
			overwritePlan: null,
		});
	}

	const requestedName = input.name;
	const [preparation, setPreparation] = useState<{
		basePlan: ElementInstallPlan;
		refresh: number;
		requestedName: string | null;
		installation: PreparedElementInstallation | null;
		error: string | null;
	} | null>(null);
	const currentPreparation =
		preparation?.basePlan === selectedPlan &&
		preparation?.refresh === refreshPlan &&
		preparation?.requestedName === requestedName
			? preparation
			: null;
	const preparedInstallation = currentPreparation?.installation ?? null;
	const planError = currentPreparation?.error ?? null;
	const installationName =
		requestedName ?? preparedInstallation?.name ?? elementBaseName;
	const [existingInstallation, setExistingInstallation] =
		useState<PreparedElementInstallation | null>(null);
	const existingDestination =
		existingInstallation?.basePlan === selectedPlan &&
		existingInstallation?.refresh === refreshPlan
			? existingInstallation
			: null;
	const overwriteExisting =
		existingDestination !== null &&
		input.overwritePlan === existingDestination.plan;
	const activePlan = overwriteExisting
		? existingDestination.plan
		: (preparedInstallation?.plan ?? null);
	const [createdComposition, setCreatedComposition] = useState<string | null>(
		null,
	);
	const creationKey = JSON.stringify(newCompositionValues);
	const compositionAlreadyCreated = createdComposition === creationKey;

	useEffect(() => {
		if (selectedPlan === null) {
			return;
		}

		let canceled = false;
		(async () => {
			let candidate = requestedName ?? elementBaseName;
			let copyNumber = 1;
			while (true) {
				const result = await prepareElementInstall({
					installationName: candidate,
					destination:
						mode === 'current-composition'
							? {
									type: 'current-composition',
									compositionFile: request.compositionFile,
									compositionId: request.compositionId,
								}
							: {
									type: 'new-composition',
									compositionFile: selectedPlan.compositionFile,
								},
					element: request.element,
				});
				if (canceled) return;
				if (!result.success) throw new Error(result.reason);

				const prepared = {
					basePlan: selectedPlan,
					name: candidate,
					refresh: refreshPlan,
					plan: result.plan,
				};
				if (result.plan.expectedFileState.exists) {
					setExistingInstallation((previous) =>
						previous?.basePlan === selectedPlan &&
						previous.refresh === refreshPlan
							? previous
							: prepared,
					);
					if (requestedName === null) {
						candidate = `${elementBaseName}-copy${copyNumber === 1 ? '' : `-${copyNumber}`}`;
						copyNumber++;
						continue;
					}
				}

				setPreparation({
					basePlan: selectedPlan,
					refresh: refreshPlan,
					requestedName,
					installation: prepared,
					error: null,
				});
				return;
			}
		})().catch((error) => {
			if (!canceled) {
				setPreparation({
					basePlan: selectedPlan,
					refresh: refreshPlan,
					requestedName,
					installation: null,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		});
		return () => {
			canceled = true;
		};
	}, [
		elementBaseName,
		requestedName,
		mode,
		refreshPlan,
		request,
		selectedPlan,
	]);

	const installationNameError =
		installationName.length > 0
			? (planError ??
				(requestedName !== null && activePlan?.expectedFileState.exists
					? 'Name already taken.'
					: null))
			: null;
	const folderTargetIsReady =
		selectedFolderStack === null ||
		(hasResolvedStack(selectedFolderStack) && folderCompositionFile !== null);
	const title = `Install ${request.element.displayName}${request.element.displayName.endsWith(' Element') ? '' : ' Element'}`;
	const canSubmit =
		!submitting &&
		(overwriteExisting ||
			(planError === null &&
				StudioProtocolInternals.makeElementFileNameFromSlug(
					installationName,
				) === `${installationName}.element.tsx` &&
				(activePlan !== null
					? !activePlan.expectedFileState.exists
					: requestedName !== null))) &&
		(mode === 'current-composition'
			? currentPlan !== null
			: (newCompositionValuesAreValid || compositionAlreadyCreated) &&
				folderTargetIsReady &&
				selectedNewCompositionPlan !== null);

	const submit = useCallback(async () => {
		if (!canSubmit || selectedPlan === null) {
			return;
		}

		setSubmitting(true);
		if (mode === 'new-composition' && !compositionAlreadyCreated) {
			const created = await createComposition({
				signal: new AbortController().signal,
				symbolicatedStack:
					selectedFolderStack === null ? null : folderSymbolicatedStack,
			});
			if (!created.success) {
				showNotification(
					`Could not create composition: ${created.reason}`,
					4000,
				);
				setSubmitting(false);
				return;
			}

			setCreatedComposition(creationKey);
		}

		const installed = await insertElement({
			installationName: overwriteExisting
				? (existingDestination?.name ?? installationName)
				: installationName,
			compositionFile:
				mode === 'new-composition'
					? selectedPlan.compositionFile
					: request.compositionFile,
			compositionId:
				mode === 'new-composition'
					? newCompositionValues.id
					: request.compositionId,
			element: request.element,
			// The insert operation revalidates this even if the name preflight is pending.
			expectedFileState: activePlan?.expectedFileState ?? {exists: false},
			from: mode === 'new-composition' ? null : request.from,
			overwriteExisting,
			position: mode === 'new-composition' ? null : request.position,
		});
		if (installed) onClose();
		else {
			setSubmitting(false);
			setRefreshPlan((value) => value + 1);
		}
	}, [
		activePlan,
		existingDestination,
		compositionAlreadyCreated,
		creationKey,
		installationName,
		overwriteExisting,
		canSubmit,
		createComposition,
		folderSymbolicatedStack,
		mode,
		newCompositionValues.id,
		onClose,
		request,
		selectedFolderStack,
		selectedPlan,
	]);

	const cancel = useCallback(() => {
		if (!submitting) {
			onClose();
		}
	}, [onClose, submitting]);

	const destinationOptions = useMemo(
		() => [
			{
				key: 'current-composition',
				label: 'Current composition',
				selected: mode === 'current-composition',
				onClick:
					currentPlan === null ? null : () => setMode('current-composition'),
			},
			{
				key: 'new-composition',
				label: 'New composition',
				selected: mode === 'new-composition',
				onClick: () => {
					setMode('new-composition');
					requestAnimationFrame(() => inputRef.current?.select());
				},
			},
		],
		[currentPlan, mode],
	);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			submit();
		},
		[submit],
	);

	return createPortal(
		<ModalContainer
			ariaLabelledBy={elementInstallTitleId}
			onOutsideClick={cancel}
			onEscape={cancel}
		>
			<div id={elementInstallTitleId}>
				<ModalHeader title={title} onClose={cancel} />
			</div>
			<form onSubmit={onSubmit}>
				<div style={dialogContent} className={VERTICAL_SCROLLBAR_CLASSNAME}>
					<dl style={requestSourceStyle} aria-label="Request source">
						<dt style={sectionTitleStyle}>From</dt>
						<dd
							style={
								sourceIsUnverified
									? unverifiedRequestSourceStyle
									: requestSourceDescriptionStyle
							}
						>
							{sourceLabel}
						</dd>
					</dl>

					{activePlan ? (
						<dl style={requestSourceStyle}>
							<dt style={sectionTitleStyle}>Destination</dt>
							<dd style={requestSourceDescriptionStyle}>
								{activePlan.filePath}
							</dd>
						</dl>
					) : null}

					<div style={destinationControlStyle}>
						<div style={sectionTitleStyle}>Add to</div>
						<div aria-label="Add to" role="group" style={{marginLeft: 'auto'}}>
							<SegmentedControl
								items={destinationOptions}
								needsWrapping={false}
								size="medium"
							/>
						</div>
					</div>

					{currentPlan === null ? (
						<div style={warningStyle} role="status">
							<WarningTriangle style={warningIconStyle} />
							<p style={warningDescriptionStyle}>
								Studio could not find a safe place in “{request.compositionId}”
								to insert the Element. Install it into a new composition
								instead.
							</p>
						</div>
					) : null}

					{mode === 'new-composition' ? (
						<section
							style={{...sectionStyle, marginInline: -16}}
							aria-label="New composition settings"
						>
							<NewCompositionFields
								heightValidationMessage={heightValidationMessage}
								inputRef={inputRef}
								nameValidationMessage={
									compositionAlreadyCreated ? null : nameValidationMessage
								}
								setValues={setNewCompositionValues}
								values={newCompositionValues}
								widthValidationMessage={widthValidationMessage}
							/>
							{activeNewCompositionPlanState?.type === 'error' ? (
								<ValidationMessage
									align="flex-start"
									message={activeNewCompositionPlanState.reason}
									type="error"
								/>
							) : null}
						</section>
					) : null}

					<section style={sectionStyle} aria-label="Element implementation">
						{existingDestination ? (
							<div
								role="radiogroup"
								aria-label="Existing Element file"
								style={sectionStyle}
							>
								<RadioButton
									checked={!overwriteExisting}
									disabled={submitting}
									onClick={() =>
										setInput((previous) => ({...previous, overwritePlan: null}))
									}
								>
									Create a copy
								</RadioButton>
								{!overwriteExisting ? (
									<div
										style={{
											...sectionStyle,
											paddingLeft: 28,
											maxWidth: 320,
											minWidth: 0,
										}}
									>
										<RemotionInput
											rightAlign={false}
											status={installationNameError ? 'error' : 'ok'}
											id="element-install-name"
											name="installationName"
											aria-label="Installation name"
											placeholder="New name"
											value={installationName}
											disabled={submitting}
											onChange={(event) => {
												const name = event.target.value;
												setInput((previous) => ({
													...previous,
													name,
													overwritePlan: null,
												}));
											}}
										/>
										{installationNameError ? (
											<ValidationMessage
												align="flex-start"
												message={installationNameError}
												type="error"
											/>
										) : null}
									</div>
								) : null}
								<div style={sectionStyle}>
									<RadioButton
										checked={overwriteExisting}
										disabled={submitting}
										onClick={() =>
											setInput((previous) => ({
												...previous,
												overwritePlan: existingDestination.plan,
											}))
										}
									>
										Replace existing
									</RadioButton>
									<p
										style={{
											...warningDescriptionStyle,
											paddingLeft: 28,
											overflowWrap: 'anywhere',
										}}
									>
										{existingDestination.plan.filePath}
									</p>
									{overwriteExisting ? (
										<p style={{...overwriteStyle, paddingLeft: 28}}>
											Overwrites customizations for all usages.
										</p>
									) : null}
								</div>
							</div>
						) : !activePlan && planError ? (
							<ValidationMessage
								align="flex-start"
								message={planError}
								type="error"
							/>
						) : null}
					</section>

					{missingPackages.length > 0 ? (
						<section
							style={requestSourceStyle}
							aria-labelledby="element-install-dependencies"
						>
							<h3 id="element-install-dependencies" style={sectionTitleStyle}>
								Packages to install
							</h3>
							<ul style={dependencyListStyle} role="list">
								{missingPackages.map((packageName) => (
									<li key={packageName} style={dependencyNameStyle}>
										{packageName}
									</li>
								))}
							</ul>
						</section>
					) : null}

					<div style={warningStyle}>
						<WarningTriangle style={warningIconStyle} />
						<p style={warningDescriptionStyle}>
							Installed code can access your files and network.
						</p>
					</div>

					<details style={sourceDetailsStyle}>
						<summary
							className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
							style={sourceSummaryStyle}
						>
							Source code
						</summary>
						<div style={sourceCodeContainerStyle}>
							<pre
								className={`${HORIZONTAL_SCROLLBAR_CLASSNAME} ${VERTICAL_SCROLLBAR_CLASSNAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
								style={sourceCodeBlockStyle}
							>
								<code style={sourceCodeStyle}>
									{makeSourceControlsVisible(request.element.sourceCode)}
								</code>
							</pre>
						</div>
					</details>
				</div>
				<ModalFooterContainer style={footerStyle}>
					<Row align="center">
						<Flex />
						<Button disabled={submitting} onClick={cancel} style={cancelStyle}>
							Cancel
						</Button>
						<Spacing x={1} />
						<ModalButton
							autoFocus={mode === 'current-composition'}
							disabled={!canSubmit}
							onClick={submit}
						>
							{submitting
								? 'Installing…'
								: overwriteExisting
									? 'Replace and insert'
									: 'Install'}
							<ShortcutHint keyToPress="↵" cmdOrCtrl={false} />
						</ModalButton>
					</Row>
				</ModalFooterContainer>
			</form>
		</ModalContainer>,
		getPortal(currentZIndex),
	);
};
