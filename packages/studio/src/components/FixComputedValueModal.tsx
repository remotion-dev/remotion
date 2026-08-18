import type {DefaultCodingAgent} from '@remotion/renderer';
import React, {useCallback} from 'react';
import {
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {openInCodingAgent} from '../helpers/open-in-editor';
import {CaretDown} from '../icons/caret';
import {ClipboardIcon} from '../icons/clipboard';
import type {ModalState} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {CodingAgentIcon} from './CodingAgentIcon';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import type {ComboboxValue} from './NewComposition/ComboBox';
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

const splitButton: React.CSSProperties = {
	alignItems: 'center',
	borderRadius: 4,
	display: 'inline-flex',
	flexDirection: 'row',
	gap: 1,
	height: 24,
	overflow: 'hidden',
};

const mainButtonBase: React.CSSProperties = {
	alignItems: 'center',
	background: TRANSPARENT,
	border: 'none',
	borderRadius: '4px 0 0 4px',
	color: LIGHT_TEXT,
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	gap: 6,
	height: 24,
	padding: '0 9px',
	whiteSpace: 'nowrap',
};

const singleButton: React.CSSProperties = {
	borderRadius: 4,
};

const dropdownButton: React.CSSProperties = {
	borderRadius: '0 4px 4px 0',
	height: 24,
	width: 24,
};

const menuLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '16px',
};

type FixComputedValueModalState = Extract<
	ModalState,
	{type: 'fix-computed-value'}
>;

export const FixComputedValueModal: React.FC<{
	readonly state: FixComputedValueModalState;
}> = ({state}) => {
	const {codingAgentInfo} = useSettings();
	const {tabIndex} = useZIndex();
	const [hovered, setHovered] = React.useState(false);
	const prompt = `/remotion-interactivity ${state.context} make "${state.prop}" interactive`;
	const installCommand = 'npx remotion skills add';
	const installedCodingAgents = codingAgentInfo?.installedCodingAgents ?? [];
	const defaultCodingAgent =
		installedCodingAgents.find(
			(agent) => agent.id === codingAgentInfo?.defaultCodingAgent,
		) ?? installedCodingAgents[0];
	const alternativeCodingAgents = installedCodingAgents.filter(
		(agent) => agent.id !== defaultCodingAgent?.id,
	);

	const onCopyPrompt = useCallback(() => {
		copyText(prompt).catch((err) => {
			showNotification(`Could not copy: ${err.message}`, 2000);
		});
	}, [prompt]);

	const onCopyInstallCommand = useCallback(() => {
		copyText(installCommand).catch((err) => {
			showNotification(`Could not copy: ${err.message}`, 2000);
		});
	}, [installCommand]);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon color={color} style={copyIcon} />;
	}, []);

	const openWithCodingAgent = useCallback(
		async (codingAgentId: DefaultCodingAgent, codingAgentName: string) => {
			try {
				const response = await openInCodingAgent(
					codingAgentId,
					codingAgentId === 'copilot' ? null : prompt,
				);
				if (!response.success) {
					showNotification(`Could not open ${codingAgentName}`, 2000);
				}
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[prompt],
	);

	const agentMenuItems = React.useMemo((): ComboboxValue[] => {
		return alternativeCodingAgents.map((codingAgent) => ({
			id: `fix-computed-value-in-${codingAgent.id}`,
			keyHint: null,
			label: <span style={menuLabel}>{codingAgent.name}</span>,
			leftItem: <CodingAgentIcon codingAgentId={codingAgent.id} size={18} />,
			onClick: () => {
				openWithCodingAgent(codingAgent.id, codingAgent.nameWithType).catch(
					() => undefined,
				);
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: `coding-agent-${codingAgent.id}`,
		}));
	}, [alternativeCodingAgents, openWithCodingAgent]);

	const renderDropdownAction: RenderInlineAction = useCallback((color) => {
		return <CaretDown color={color} small />;
	}, []);

	const mainButtonStyle = React.useMemo((): React.CSSProperties => {
		return {
			...mainButtonBase,
			...(alternativeCodingAgents.length === 0 ? singleButton : null),
			background: getBackgroundFromHoverState({
				hovered,
				selected: false,
			}),
			color: hovered ? WHITE : LIGHT_TEXT,
		};
	}, [alternativeCodingAgents.length, hovered]);

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
								renderAction={renderCopyAction}
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
						renderAction={renderCopyAction}
						title="Copy prompt"
					/>
				</div>
			</div>
			{defaultCodingAgent ? (
				<ModalFooterContainer style={footer}>
					<div
						style={splitButton}
						onPointerEnter={() => setHovered(true)}
						onPointerLeave={() => setHovered(false)}
					>
						<button
							aria-label={`Open in ${defaultCodingAgent.nameWithType}`}
							onClick={() => {
								openWithCodingAgent(
									defaultCodingAgent.id,
									defaultCodingAgent.nameWithType,
								).catch(() => undefined);
							}}
							style={mainButtonStyle}
							tabIndex={tabIndex}
							title={`Open in ${defaultCodingAgent.nameWithType}`}
							type="button"
						>
							<CodingAgentIcon
								codingAgentId={defaultCodingAgent.id}
								size={18}
							/>
							Open in {defaultCodingAgent.name}
						</button>
						{alternativeCodingAgents.length > 0 ? (
							<InlineDropdown
								renderAction={renderDropdownAction}
								style={dropdownButton}
								title="Open in another coding agent"
								values={agentMenuItems}
								variant={null}
							/>
						) : null}
					</div>
				</ModalFooterContainer>
			) : null}
		</DismissableModal>
	);
};
