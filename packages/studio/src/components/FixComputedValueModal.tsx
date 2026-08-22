import type {DefaultCodingAgent} from '@remotion/renderer';
import React, {useCallback} from 'react';
import {LIGHT_TEXT, SELECTED_BACKGROUND, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {openInCodingAgent} from '../helpers/open-in-editor';
import {CaretDown} from '../icons/caret';
import {ClipboardIcon} from '../icons/clipboard';
import type {ModalState} from '../state/modals';
import {CodingAgentIcon} from './CodingAgentIcon';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {DismissableModal} from './NewComposition/DismissableModal';
import {showNotification} from './Notifications/NotificationCenter';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';
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

const mainSegmentStyle: React.CSSProperties = {
	gap: 6,
	padding: '0 9px',
};

const dropdownSegmentStyle: React.CSSProperties = {
	padding: 0,
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

	const segments = React.useMemo((): SegmentedButtonSegment[] => {
		if (!defaultCodingAgent) {
			return [];
		}

		return [
			{
				ariaLabel: `Open in ${defaultCodingAgent.nameWithType}`,
				buttonId: null,
				disabled: false,
				idleColor: LIGHT_TEXT,
				onClick: () => {
					openWithCodingAgent(
						defaultCodingAgent.id,
						defaultCodingAgent.nameWithType,
					).catch(() => undefined);
				},
				onPointerDown: null,
				renderContent: () => (
					<>
						<CodingAgentIcon codingAgentId={defaultCodingAgent.id} size={18} />
						Open in {defaultCodingAgent.name}
					</>
				),
				segmentId: 'default-coding-agent',
				style: mainSegmentStyle,
				title: `Open in ${defaultCodingAgent.nameWithType}`,
				type: 'action',
			},
			...(alternativeCodingAgents.length > 0
				? [
						{
							ariaLabel: 'Open in another coding agent',
							buttonId: null,
							disabled: false,
							idleColor: LIGHT_TEXT,
							leaveLeftSpace: true,
							onOpenChange: null,
							renderContent: (color: string) => (
								<CaretDown color={color} small />
							),
							segmentId: 'another-coding-agent',
							selectedId: null,
							style: dropdownSegmentStyle,
							title: 'Open in another coding agent',
							type: 'menu' as const,
							values: agentMenuItems,
						},
					]
				: []),
		];
	}, [
		agentMenuItems,
		alternativeCodingAgents.length,
		defaultCodingAgent,
		openWithCodingAgent,
	]);

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
					<SegmentedButton segments={segments} style={null} title={null} />
				</ModalFooterContainer>
			) : null}
		</DismissableModal>
	);
};
