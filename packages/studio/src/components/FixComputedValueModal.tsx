import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {resolveFileSource} from '../error-overlay/react-overlay/effects/resolve-file-source';
import {OpenInEditor} from '../error-overlay/remotion-overlay/OpenInEditor';
import {StackElement} from '../error-overlay/remotion-overlay/StackFrame';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BLACK_ALPHA_30,
	BLUE,
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	WHITE,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {findOriginalPositionInFileAtProperty} from '../helpers/open-in-editor';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {SkillsIcon} from '../icons/skills';
import type {ModalState} from '../state/modals';
import {CodingAgentButton} from './CodingAgentButton';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';
import {SkillSettingsRow} from './SkillsSettings';
import {useEditorOpening} from './use-default-editor-info';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	width: getMaxModalWidth(560),
	maxHeight: getMaxModalHeight(800),
	minWidth: 0,
	overflow: 'hidden',
};

const container: React.CSSProperties = {
	padding: 16,
	minHeight: 0,
	overflowY: 'auto',
};

const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const commandField: React.CSSProperties = {
	alignItems: 'flex-start',
	background: BLACK_ALPHA_30,
	borderRadius: 6,
	boxSizing: 'border-box',
	display: 'flex',
	gap: 8,
	marginTop: 10,
	padding: '8px 8px 8px 10px',
	width: '100%',
};

const code: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
	minWidth: 0,
	overflowWrap: 'anywhere',
	whiteSpace: 'pre-wrap',
};

const copyAction: React.CSSProperties = {
	flexShrink: 0,
};

const skillsIcon: React.CSSProperties = {
	display: 'inline-block',
	height: 18,
	width: 18,
	marginRight: 6,
	verticalAlign: 'middle',
};

const copyIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

const agentPromptHeader: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 12,
	justifyContent: 'space-between',
};

const sourcePreviewContainer: React.CSSProperties = {
	marginBottom: 16,
	marginTop: 4,
};

const sourcePreviewStatus: React.CSSProperties = {
	...text,
	marginBottom: 16,
	marginTop: 10,
};

const skillRowContainer: React.CSSProperties = {
	borderTop: BORDER_WHITE_ALPHA_12,
	marginTop: 10,
};

const skillError: React.CSSProperties = {
	marginTop: 10,
};

type FixComputedValueModalState = Extract<
	ModalState,
	{type: 'fix-computed-value'}
>;

type SourcePreviewState =
	| {
			type: 'loading';
	  }
	| {
			type: 'loaded';
			stack: SymbolicatedStackFrame;
	  }
	| {
			type: 'error';
			message: string;
	  };

export const FixComputedValueModal: React.FC<{
	readonly state: FixComputedValueModalState;
}> = ({state}) => {
	const {codingAgentInfo, remotionSkillsInfo, skillActionError} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canOpenInEditor, defaultEditorId, defaultEditorName} =
		useEditorOpening(previewServerState.type === 'connected');
	const [sourcePreview, setSourcePreview] = useState<SourcePreviewState>({
		type: 'loading',
	});
	const skillName = '/remotion-interactivity';
	const skillId = 'remotion-interactivity';
	const remotionInteractivitySkillAvailable =
		remotionSkillsInfo?.remotionInteractivitySkillAvailable ?? false;
	const interactivitySkill =
		remotionSkillsInfo?.skills.find((skill) => skill.name === skillId) ?? null;
	const canInstallSkill =
		!window.remotion_isReadOnlyStudio &&
		previewServerState.type === 'connected' &&
		remotionSkillsInfo !== null;
	const promptLocation =
		sourcePreview.type === 'loaded'
			? `${sourcePreview.stack.originalFileName}:${sourcePreview.stack.originalLineNumber}:${sourcePreview.stack.originalColumnNumber}`
			: `${state.location.source}:${state.location.line}:${state.location.column}`;
	const promptDetails = ` ${promptLocation} make "${state.prop}" interactive`;
	const prompt = `${skillName}${promptDetails}`;
	const installCommand = 'npx remotion skills add';
	const hasCodingAgent =
		(codingAgentInfo?.installedCodingAgents.length ?? 0) > 0;
	const canOpenSourceInEditor =
		sourcePreview.type === 'loaded' &&
		canOpenInEditor &&
		defaultEditorId !== null &&
		defaultEditorName !== null;
	const {copied: promptCopied, markCopied: markPromptCopied} =
		useCopyFeedback();
	const {copied: installCommandCopied, markCopied: markInstallCommandCopied} =
		useCopyFeedback();

	useEffect(() => {
		let cancelled = false;
		setSourcePreview({type: 'loading'});

		findOriginalPositionInFileAtProperty({
			originalPosition: state.location,
			property: state.prop.split('.').at(-1) ?? state.prop,
		})
			.then((position) => {
				return resolveFileSource(
					{
						columnNumber: position.column,
						fileName: position.source,
						lineNumber: position.line,
						message: `Computed value "${state.prop}"`,
					},
					1,
				);
			})
			.then((stack) => {
				if (!cancelled) {
					setSourcePreview({type: 'loaded', stack});
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setSourcePreview({
						type: 'error',
						message: err instanceof Error ? err.message : String(err),
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [state.location, state.prop]);

	const onCopyPrompt = useCallback(() => {
		copyText(prompt)
			.then(markPromptCopied)
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [markPromptCopied, prompt]);

	const onCopyInstallCommand = useCallback(() => {
		copyText(installCommand)
			.then(markInstallCommandCopied)
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [installCommand, markInstallCommandCopied]);

	const renderPromptCopyAction: RenderInlineAction = useCallback(
		(color) => {
			return <CopyIcon copied={promptCopied} color={color} style={copyIcon} />;
		},
		[promptCopied],
	);
	const renderInstallCommandCopyAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<CopyIcon
					copied={installCommandCopied}
					color={color}
					style={copyIcon}
				/>
			);
		},
		[installCommandCopied],
	);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title="Fix computed value" />
			<div style={container}>
				<div style={text}>
					This value cannot be interactively edited because it is computed:
				</div>
				{sourcePreview.type === 'loaded' ? (
					<div style={sourcePreviewContainer}>
						<StackElement
							collapsible={false}
							defaultFunctionName={null}
							editorId={canOpenInEditor ? defaultEditorId : null}
							fontSize={13}
							headerAction={
								canOpenSourceInEditor ? (
									<OpenInEditor
										canHaveKeyboardShortcuts={false}
										editorId={defaultEditorId}
										editorName={defaultEditorName}
										size="compact"
										stack={sourcePreview.stack}
									/>
								) : null
							}
							horizontalSpacing={0}
							isFirst
							lineNumberWidth={
								String(
									Math.max(
										0,
										...(sourcePreview.stack.originalScriptCode ?? []).map(
											(line) => line.lineNumber,
										),
									),
								).length
							}
							s={sourcePreview.stack}
						/>
					</div>
				) : (
					<div style={sourcePreviewStatus}>
						{sourcePreview.type === 'loading'
							? 'Loading code preview...'
							: `Could not load code preview: ${sourcePreview.message}`}
					</div>
				)}
				{remotionInteractivitySkillAvailable ? null : (
					<div style={text}>You can ask an agent to restructure the code.</div>
				)}
				{remotionInteractivitySkillAvailable ? null : (
					<>
						<div style={text}>Install the Agent Skill first:</div>
						{canInstallSkill && interactivitySkill ? (
							<div
								aria-label="Remotion Agent Skills"
								role="list"
								style={skillRowContainer}
							>
								<SkillSettingsRow isLast={false} skill={interactivitySkill} />
							</div>
						) : (
							<div style={commandField}>
								<pre style={code}>{installCommand}</pre>
								<InlineAction
									style={copyAction}
									variant={null}
									onClick={onCopyInstallCommand}
									renderAction={renderInstallCommandCopyAction}
									title="Copy command"
								/>
							</div>
						)}
						{skillActionError ? (
							<div style={skillError}>
								<ValidationMessage
									align="flex-start"
									message={skillActionError}
									type="error"
								/>
							</div>
						) : null}
					</>
				)}
				<div
					style={{
						...agentPromptHeader,
						marginTop: remotionInteractivitySkillAvailable ? 0 : 16,
					}}
				>
					<div>
						{remotionInteractivitySkillAvailable ? (
							<>
								<div style={text}>
									You can ask an agent to restructure the code.
								</div>
								<div style={text}>
									Use this prompt to make this value editable:
								</div>
							</>
						) : (
							<div style={text}>
								Then use this prompt to make the value editable:
							</div>
						)}
					</div>
					{hasCodingAgent ? (
						<CodingAgentButton
							label="Open in"
							prompt={prompt}
							size="compact"
							style={null}
						/>
					) : null}
				</div>
				<div style={commandField}>
					<pre style={code}>
						<SkillsIcon color={BLUE} style={skillsIcon} aria-hidden />
						<span
							style={{
								color: BLUE,
								fontFamily: 'inherit',
								fontSize: 'inherit',
								lineHeight: 'inherit',
							}}
						>
							{skillName}
						</span>
						{promptDetails}
					</pre>
					<InlineAction
						style={copyAction}
						variant={null}
						onClick={onCopyPrompt}
						renderAction={renderPromptCopyAction}
						title="Copy prompt"
					/>
				</div>
			</div>
		</DismissableModal>
	);
};
