import React, {useCallback, useContext} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLACK_ALPHA_30, BLUE, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {getCodexAnnotation} from '../helpers/get-codex-annotation';
import {getSkillPrefix} from '../helpers/get-skill-prefix';
import {requestCodexAnnotation} from '../helpers/request-codex-annotation';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {SkillsIcon} from '../icons/skills';
import {CodingAgentButton} from './CodingAgentButton';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {ModalButton} from './ModalButton';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';
import {SkillSettingsRow} from './SkillsSettings';
import {useDownloadProject} from './use-download-project';

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
	fontWeight: 'normal',
	lineHeight: 1.5,
	margin: 0,
	minWidth: 0,
	overflowWrap: 'anywhere',
	whiteSpace: 'pre-wrap',
};

const copyAction: React.CSSProperties = {flexShrink: 0};
const copyIcon: React.CSSProperties = {flexShrink: 0, height: 12, width: 12};
const skillsIcon: React.CSSProperties = {
	display: 'inline-block',
	height: 18,
	marginRight: 6,
	verticalAlign: 'middle',
	width: 18,
};
const promptHeader: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 12,
	justifyContent: 'space-between',
};
const skillRowContainer: React.CSSProperties = {
	marginTop: 10,
};
const skillError: React.CSSProperties = {marginTop: 10};

export const AgentPrompt: React.FC<{
	readonly annotationTarget: React.RefObject<HTMLDivElement | null>;
	readonly actionLabel: string;
	readonly prompt: string;
	readonly skillId: string;
}> = ({annotationTarget, actionLabel, prompt: instruction, skillId}) => {
	const {codingAgentInfo, remotionSkillsInfo, skillActionError} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const canUseLocalActions =
		!isBrowserStudio &&
		!window.remotion_isReadOnlyStudio &&
		previewServerState.type === 'connected';
	const canAnnotate = canUseLocalActions && getCodexAnnotation() !== null;
	const downloadProject = useDownloadProject();
	const skill = remotionSkillsInfo?.skills.find(({name}) => name === skillId);
	const skillAvailable = Boolean(
		skill?.installedInProject || skill?.installedGlobally,
	);
	const canInstallSkill = canUseLocalActions && remotionSkillsInfo !== null;
	const skillName = `${getSkillPrefix()}${skillId}`;
	const prompt = skillAvailable ? `${skillName} ${instruction}` : instruction;
	const installCommand = 'npx remotion skills add';
	const hasCodingAgent =
		canUseLocalActions &&
		(codingAgentInfo?.installedCodingAgents.length ?? 0) > 0;
	const {copied: promptCopied, markCopied: markPromptCopied} =
		useCopyFeedback();
	const {copied: installCopied, markCopied: markInstallCopied} =
		useCopyFeedback();

	const copy = useCallback((value: string, markCopied: () => void) => {
		copyText(value)
			.then(markCopied)
			.catch((err) => showNotification(`Could not copy: ${err.message}`, 2000));
	}, []);
	const renderPromptCopy: RenderInlineAction = useCallback(
		(color) => (
			<CopyIcon copied={promptCopied} color={color} style={copyIcon} />
		),
		[promptCopied],
	);
	const renderInstallCopy: RenderInlineAction = useCallback(
		(color) => (
			<CopyIcon copied={installCopied} color={color} style={copyIcon} />
		),
		[installCopied],
	);
	const onSendToChatGPT = useCallback(() => {
		requestCodexAnnotation({
			target: annotationTarget.current,
			initialComment: prompt,
			metadata: {action: actionLabel},
		});
	}, [actionLabel, annotationTarget, prompt]);

	return (
		<>
			{isBrowserStudio ? (
				<div style={{...text, marginBottom: 16}}>
					Download the project to edit the code locally or use an agent.
					{downloadProject ? (
						<div style={{marginTop: 12}}>
							<ModalButton onClick={downloadProject}>
								Download project
							</ModalButton>
						</div>
					) : null}
				</div>
			) : !canUseLocalActions ? (
				<div style={{...text, marginBottom: 16}}>
					Open the project in a connected local Studio to edit the code or
					launch an agent.
				</div>
			) : null}
			{skillAvailable || !canUseLocalActions ? null : (
				<>
					<div style={text}>
						Install the Agent Skill for Remotion-specific guidance:
					</div>
					{canInstallSkill && skill ? (
						<div
							aria-label="Remotion Agent Skills"
							role="list"
							style={skillRowContainer}
						>
							<SkillSettingsRow skill={skill} />
						</div>
					) : (
						<div style={commandField}>
							<pre style={code}>{installCommand}</pre>
							<InlineAction
								onClick={() => copy(installCommand, markInstallCopied)}
								renderAction={renderInstallCopy}
								style={copyAction}
								aria-label="Copy command"
								variant={null}
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
			<div style={{...promptHeader, marginTop: skillAvailable ? 0 : 16}}>
				<div style={text}>Use this prompt with an agent:</div>
				{canAnnotate ? (
					<ModalButton size="compact" onClick={onSendToChatGPT}>
						Send to ChatGPT
					</ModalButton>
				) : hasCodingAgent ? (
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
					{skillAvailable ? (
						<>
							<SkillsIcon color={BLUE} style={skillsIcon} aria-hidden />
							<span
								style={{
									color: BLUE,
									fontFamily: 'inherit',
									fontSize: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
								}}
							>
								{skillName}
							</span>{' '}
						</>
					) : null}
					{instruction}
				</pre>
				<InlineAction
					onClick={() => copy(prompt, markPromptCopied)}
					renderAction={renderPromptCopy}
					style={copyAction}
					aria-label="Copy prompt"
					variant={null}
				/>
			</div>
		</>
	);
};
