import React, {useCallback} from 'react';
import {LIGHT_TEXT, SELECTED_BACKGROUND, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import type {ModalState} from '../state/modals';
import {CodingAgentButton} from './CodingAgentButton';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	overflow: 'hidden',
};

const container: React.CSSProperties = {
	padding: '12px 16px 18px',
};

const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const commandField: React.CSSProperties = {
	alignItems: 'center',
	background: SELECTED_BACKGROUND,
	borderRadius: 6,
	boxSizing: 'border-box',
	display: 'flex',
	marginTop: 10,
	padding: '8px 8px 8px 10px',
	width: '100%',
};

const code: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
	minWidth: 0,
	overflowX: 'auto',
	whiteSpace: 'pre-wrap',
};

const copyIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

const footer: React.CSSProperties = {
	display: 'flex',
	flex: 'none',
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
	const prompt = `/remotion-interactivity ${state.context} make "${state.prop}" interactive`;
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
					<pre style={code}>{prompt}</pre>
					<InlineAction
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
