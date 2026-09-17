import React, {useCallback, useContext} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BLACK_ALPHA_30,
	BLUE,
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	WHITE,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {SkillsIcon} from '../icons/skills';
import {CodingAgentButton} from './CodingAgentButton';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';
import {SkillSettingsRow} from './SkillsSettings';

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
	borderTop: BORDER_WHITE_ALPHA_12,
	marginTop: 10,
};
const skillError: React.CSSProperties = {marginTop: 10};

export const AgentPrompt: React.FC<{
	readonly availableText: string;
	readonly promptDetails: string;
	readonly skillId: string;
}> = ({availableText, promptDetails, skillId}) => {
	const {codingAgentInfo, remotionSkillsInfo, skillActionError} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const skill = remotionSkillsInfo?.skills.find(({name}) => name === skillId);
	const skillAvailable = Boolean(
		skill?.installedInProject || skill?.installedGlobally,
	);
	const canInstallSkill =
		!window.remotion_isReadOnlyStudio &&
		previewServerState.type === 'connected' &&
		remotionSkillsInfo !== null;
	const skillName = `/${skillId}`;
	const prompt = `${skillName}${promptDetails}`;
	const installCommand = 'npx remotion skills add';
	const hasCodingAgent =
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

	return (
		<>
			{skillAvailable ? null : (
				<>
					<div style={text}>Install the Agent Skill first:</div>
					{canInstallSkill && skill ? (
						<div
							aria-label="Remotion Agent Skills"
							role="list"
							style={skillRowContainer}
						>
							<SkillSettingsRow isLast={false} skill={skill} />
						</div>
					) : (
						<div style={commandField}>
							<pre style={code}>{installCommand}</pre>
							<InlineAction
								onClick={() => copy(installCommand, markInstallCopied)}
								renderAction={renderInstallCopy}
								style={copyAction}
								title="Copy command"
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
				<div style={text}>
					{skillAvailable
						? availableText
						: `Then ${availableText.toLowerCase()}`}
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
							fontWeight: 'inherit',
							lineHeight: 'inherit',
						}}
					>
						{skillName}
					</span>
					{promptDetails}
				</pre>
				<InlineAction
					onClick={() => copy(prompt, markPromptCopied)}
					renderAction={renderPromptCopy}
					style={copyAction}
					title="Copy prompt"
					variant={null}
				/>
			</div>
		</>
	);
};
