import {StudioProtocolInternals} from '@remotion/studio-protocol';
import type {
	ElementInstallExpectedFileState,
	ElementInstallRequest,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useRef, useState} from 'react';
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
import {useCreateComposition} from '../helpers/use-create-composition';
import {validateCompositionName} from '../helpers/validate-new-comp-data';
import {Button} from './Button';
import {insertElement} from './import-assets';
import {Flex, Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {RemotionInput} from './NewComposition/RemInput';
import {
	ValidationMessage,
	WarningTriangle,
} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 20,
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
};

const dialogContent: React.CSSProperties = {
	...container,
	padding: 16,
	width: 'min(640px, calc(100vw - 40px))',
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
	color: WHITE,
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
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 400,
	lineHeight: 1.5,
	overflowWrap: 'anywhere',
};

const unverifiedSourceStyle: React.CSSProperties = {
	...metadataDescriptionStyle,
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
};

const dependencyRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: 16,
	minWidth: 0,
};

const dependencyNameStyle: React.CSSProperties = {
	minWidth: 0,
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.5,
	overflowWrap: 'anywhere',
};

const dependencyInstallStatusStyle: React.CSSProperties = {
	flexShrink: 0,
	color: WARNING_COLOR,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.5,
};

const dependencyInstalledStatusStyle: React.CSSProperties = {
	...dependencyInstallStatusStyle,
	color: LIGHT_TEXT,
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
	cursor: 'pointer',
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.5,
};

const sourceCodeBlockStyle: React.CSSProperties = {
	marginTop: 10,
	marginBottom: 0,
	maxHeight: 240,
	overflow: 'auto',
	padding: 12,
	border: `1px solid ${WHITE_ALPHA_12}`,
	borderRadius: 6,
	backgroundColor: INPUT_BACKGROUND,
	color: WHITE,
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
	gap: 16,
};

const destinationOptionsStyle: React.CSSProperties = {
	display: 'flex',
	overflow: 'hidden',
	border: `1px solid ${WHITE_ALPHA_12}`,
	borderRadius: 4,
};

const destinationOptionStyle: React.CSSProperties = {
	appearance: 'none',
	border: 0,
	cursor: 'default',
	fontFamily: 'sans-serif',
	fontSize: 11,
	fontWeight: 400,
	lineHeight: 1.5,
	padding: '2px 7px',
};

const getDestinationOptionStyle = ({
	disabled,
	selected,
}: {
	readonly disabled: boolean;
	readonly selected: boolean;
}): React.CSSProperties => ({
	...destinationOptionStyle,
	opacity: disabled ? 0.5 : 1,
	...hoverableStyle({
		idleBackground: selected ? INPUT_BACKGROUND : TRANSPARENT,
		hoverBackground: selected ? INPUT_BACKGROUND : TRANSPARENT,
		idleColor: selected ? WHITE : LIGHT_TEXT,
		hoverColor: disabled ? LIGHT_TEXT : WHITE,
	}),
});

const idInputStyle: React.CSSProperties = {
	maxWidth: 320,
};

const footerStyle: React.CSSProperties = {
	minWidth: 0,
};

const cancelStyle: React.CSSProperties = {
	minWidth: 90,
};

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

type ElementInstallPlan = {
	readonly filePath: string;
	readonly expectedFileState: ElementInstallExpectedFileState;
};

type CurrentCompositionMetadata = {
	readonly durationInFrames: number;
	readonly fps: number;
	readonly height: number;
	readonly width: number;
};

export const ElementInstallConfirmation: React.FC<{
	readonly currentCompositionMetadata: CurrentCompositionMetadata | null;
	readonly currentPlan: ElementInstallPlan | null;
	readonly dependenciesToReview: string[];
	readonly missingPackages: string[];
	readonly newPlan: ElementInstallPlan;
	readonly onClose: () => void;
	readonly request: ElementInstallRequest;
	readonly sourceIsUnverified: boolean;
	readonly sourceLabel: string;
	readonly symbolicatedStack: SymbolicatedStackFrame | null;
	readonly usesBrowserDependencyResolution: boolean;
}> = ({
	currentCompositionMetadata,
	currentPlan,
	dependenciesToReview,
	missingPackages,
	newPlan,
	onClose,
	request,
	sourceIsUnverified,
	sourceLabel,
	symbolicatedStack,
	usesBrowserDependencyResolution,
}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const [mode, setMode] = useState<'current-composition' | 'new-composition'>(
		currentPlan === null ? 'new-composition' : 'current-composition',
	);
	const [submitting, setSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [newId, setNewId] = useState(() => {
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

		return candidate;
	});

	const durationInFrames =
		request.element.durationInFrames ??
		currentCompositionMetadata?.durationInFrames ??
		150;
	const fps = currentCompositionMetadata?.fps ?? 30;
	const size =
		request.element.dimensions ??
		(currentCompositionMetadata === null
			? {width: 1920, height: 1080}
			: {
					width: currentCompositionMetadata.width,
					height: currentCompositionMetadata.height,
				});
	const nameValidationMessage = validateCompositionName(newId, compositions);
	const selectedPlan =
		mode === 'current-composition' ? (currentPlan ?? newPlan) : newPlan;

	const {createComposition} = useCreateComposition({
		canvasCapture: null,
		compositions,
		durationInFrames,
		folderName: null,
		newId,
		parentName: null,
		selectedFrameRate: fps,
		size,
	});

	const canSubmit =
		!submitting &&
		(mode === 'current-composition' ||
			(nameValidationMessage === null && symbolicatedStack !== null));

	const submit = useCallback(async () => {
		if (!canSubmit) {
			return;
		}

		setSubmitting(true);
		if (mode === 'new-composition') {
			const created = await createComposition({
				signal: new AbortController().signal,
				symbolicatedStack,
			});
			if (!created.success) {
				showNotification(
					`Could not create composition: ${created.reason}`,
					4000,
				);
				setSubmitting(false);
				return;
			}

			await insertElement({
				compositionFile: request.compositionFile,
				compositionId: newId,
				element: request.element,
				expectedFileState: newPlan.expectedFileState,
				from: null,
				overwriteExisting: newPlan.expectedFileState.exists,
				position: null,
			});
			onClose();
			return;
		}

		if (currentPlan === null) {
			setSubmitting(false);
			return;
		}

		await insertElement({
			compositionFile: request.compositionFile,
			compositionId: request.compositionId,
			element: request.element,
			expectedFileState: currentPlan.expectedFileState,
			from: request.from,
			overwriteExisting: currentPlan.expectedFileState.exists,
			position: request.position,
		});
		onClose();
	}, [
		canSubmit,
		createComposition,
		currentPlan,
		mode,
		newId,
		newPlan.expectedFileState,
		onClose,
		request,
		symbolicatedStack,
	]);

	const cancel = useCallback(() => {
		if (!submitting) {
			onClose();
		}
	}, [onClose, submitting]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			submit();
		},
		[submit],
	);

	return createPortal(
		<ModalContainer onOutsideClick={cancel} onEscape={cancel}>
			<ModalHeader title="Install Element" onClose={cancel} />
			<form onSubmit={onSubmit}>
				<div style={dialogContent}>
					<div style={destinationControlStyle}>
						<div style={sectionTitleStyle}>Add to</div>
						<div
							aria-label="Installation destination"
							role="group"
							style={destinationOptionsStyle}
						>
							<button
								aria-pressed={mode === 'current-composition'}
								className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
								disabled={currentPlan === null}
								onClick={() => setMode('current-composition')}
								style={getDestinationOptionStyle({
									disabled: currentPlan === null,
									selected: mode === 'current-composition',
								})}
								type="button"
							>
								Current composition
							</button>
							<button
								aria-pressed={mode === 'new-composition'}
								className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
								onClick={() => {
									setMode('new-composition');
									requestAnimationFrame(() => inputRef.current?.select());
								}}
								style={{
									...getDestinationOptionStyle({
										disabled: false,
										selected: mode === 'new-composition',
									}),
									borderLeft: `1px solid ${WHITE_ALPHA_12}`,
								}}
								type="button"
							>
								New composition
							</button>
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
						<section style={sectionStyle} aria-labelledby="new-composition-id">
							<label id="new-composition-id" style={sectionTitleStyle}>
								Composition ID
							</label>
							<div style={idInputStyle}>
								<RemotionInput
									ref={inputRef}
									aria-labelledby="new-composition-id"
									autoFocus
									onChange={(event) => setNewId(event.target.value)}
									rightAlign={false}
									status={nameValidationMessage === null ? 'ok' : 'error'}
									type="text"
									value={newId}
								/>
								{nameValidationMessage === null ? null : (
									<ValidationMessage
										align="flex-start"
										message={nameValidationMessage}
										type="error"
									/>
								)}
								{symbolicatedStack === null ? (
									<ValidationMessage
										align="flex-start"
										message="Could not determine where the new composition should be created."
										type="error"
									/>
								) : null}
							</div>
						</section>
					) : null}

					<dl style={metadataStyle} aria-label="Installation details">
						<div style={metadataRowStyle}>
							<dt style={metadataTermStyle}>Element</dt>
							<dd style={metadataDescriptionStyle}>
								{request.element.displayName}
							</dd>
						</div>
						<div style={metadataRowStyle}>
							<dt style={metadataTermStyle}>Request source</dt>
							<dd
								style={
									sourceIsUnverified
										? unverifiedSourceStyle
										: metadataDescriptionStyle
								}
							>
								{sourceLabel}
							</dd>
						</div>
						<div style={metadataRowStyle}>
							<dt style={metadataTermStyle}>Composition</dt>
							<dd style={metadataDescriptionStyle}>
								<code style={codeStyle}>
									{mode === 'current-composition'
										? request.compositionId
										: newId}
								</code>
							</dd>
						</div>
						<div style={metadataRowStyle}>
							<dt style={metadataTermStyle}>Destination</dt>
							<dd style={metadataDescriptionStyle}>
								<code style={codeStyle}>{selectedPlan.filePath}</code>
							</dd>
						</div>
						{selectedPlan.expectedFileState.exists ? (
							<div style={metadataRowStyle}>
								<dt style={metadataTermStyle}>File change</dt>
								<dd style={overwriteStyle}>Replace existing source file</dd>
							</div>
						) : null}
					</dl>

					{dependenciesToReview.length > 0 ? (
						<section
							style={sectionStyle}
							aria-labelledby="element-install-dependencies"
						>
							<h3 id="element-install-dependencies" style={sectionTitleStyle}>
								Dependencies
							</h3>
							<ul style={dependencyListStyle} role="list">
								{dependenciesToReview.map((packageName) => {
									const willInstall = missingPackages.includes(packageName);
									return (
										<li key={packageName} style={dependencyRowStyle}>
											<div style={dependencyNameStyle}>{packageName}</div>
											<div
												style={
													willInstall
														? dependencyInstallStatusStyle
														: dependencyInstalledStatusStyle
												}
											>
												{willInstall ? 'Will be installed' : 'Installed'}
											</div>
										</li>
									);
								})}
							</ul>
						</section>
					) : null}

					<div style={warningStyle}>
						<WarningTriangle style={warningIconStyle} />
						<p style={warningDescriptionStyle}>
							This adds executable source code to your project.
							{usesBrowserDependencyResolution
								? null
								: ' Package lifecycle scripts may also run during installation, with access to your files and the network.'}
						</p>
					</div>

					<details style={sourceDetailsStyle}>
						<summary style={sourceSummaryStyle}>Source code</summary>
						<pre style={sourceCodeBlockStyle}>
							<code style={sourceCodeStyle}>
								{makeSourceControlsVisible(request.element.sourceCode)}
							</code>
						</pre>
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
							{submitting ? 'Installing…' : 'Install'}
							<ShortcutHint keyToPress="↵" cmdOrCtrl={false} />
						</ModalButton>
					</Row>
				</ModalFooterContainer>
			</form>
		</ModalContainer>,
		document.body,
	);
};
