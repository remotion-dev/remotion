import React, {useCallback} from 'react';
import {BLACK_ALPHA_30, BLUE, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import {SkillsIcon} from '../icons/skills';
import type {ModalState} from '../state/modals';
import {CodingAgentButton} from './CodingAgentButton';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';

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

const footer: React.CSSProperties = {
	display: 'flex',
	flex: 'none',
	minWidth: 0,
	padding: '12px 16px',
	justifyContent: 'flex-end',
};

type FixComputedValueModalState = Extract<
	ModalState,
	{type: 'fix-computed-value'}
>;

export const FixComputedValueModal: React.FC<{
	readonly state: FixComputedValueModalState;
}> = ({state}) => {
	const {codingAgentInfo} = useSettings();
	const skillName = '/remotion-interactivity';
	const promptDetails = ` ${state.context} make "${state.prop}" interactive`;
	const prompt = `${skillName}${promptDetails}`;
	const installCommand = 'npx remotion skills add';
	const hasCodingAgent =
		(codingAgentInfo?.installedCodingAgents.length ?? 0) > 0;
	const {copied: promptCopied, markCopied: markPromptCopied} =
		useCopyFeedback();
	const {copied: installCommandCopied, markCopied: markInstallCommandCopied} =
		useCopyFeedback();

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
				{state.remotionInteractivitySkillAvailable ? null : (
					<>
						<div style={text}>First, install the Remotion Agent Skills:</div>
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
					</>
				)}
				<div
					style={{
						...text,
						marginTop: state.remotionInteractivitySkillAvailable ? 0 : 16,
					}}
				>
					{state.remotionInteractivitySkillAvailable
						? 'Paste this prompt into your coding agent to make this value editable in Studio:'
						: 'Then, paste this prompt into your coding agent:'}
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
			{hasCodingAgent ? (
				<ModalFooterContainer style={footer}>
					<CodingAgentButton
						label="Open in"
						prompt={prompt}
						size="compact"
						style={null}
					/>
				</ModalFooterContainer>
			) : null}
		</DismissableModal>
	);
};
