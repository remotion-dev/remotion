import type {DefaultCodingAgent} from '@remotion/renderer';
import React, {useCallback, useMemo} from 'react';
import {openInCodingAgent} from '../helpers/open-in-editor';
import {AppLaunchButton} from './AppLaunchButton';
import {CodingAgentIcon} from './CodingAgentIcon';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';
import {useConfigureDefaultApps} from './use-configure-default-apps';

const menuLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '16px',
};

export const CodingAgentButton: React.FC<{
	readonly label: 'Fix with' | 'Open in';
	readonly prompt: string;
	readonly size: 'compact' | 'default';
	readonly style: React.CSSProperties | null;
}> = ({label, prompt, size, style}) => {
	const {codingAgentInfo} = useSettings();
	const configureDefaultApps = useConfigureDefaultApps();
	const installedCodingAgents = codingAgentInfo?.installedCodingAgents ?? [];
	const defaultCodingAgent =
		installedCodingAgents.find(
			(agent) => agent.id === codingAgentInfo?.defaultCodingAgent,
		) ?? installedCodingAgents[0];
	const alternativeCodingAgents = installedCodingAgents.filter(
		(agent) => agent.id !== defaultCodingAgent?.id,
	);

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

	const agentMenuItems = useMemo((): ComboboxValue[] => {
		return alternativeCodingAgents.map((codingAgent) => ({
			id: `open-in-${codingAgent.id}`,
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

	if (!defaultCodingAgent) {
		return null;
	}

	return (
		<AppLaunchButton
			actionButtonId={null}
			ariaLabel={`${label} ${defaultCodingAgent.nameWithType}`}
			disabled={false}
			menuAriaLabel={`${label} another coding agent`}
			menuButtonId={null}
			menuItems={agentMenuItems}
			onConfigureApps={configureDefaultApps}
			onClick={() => {
				openWithCodingAgent(
					defaultCodingAgent.id,
					defaultCodingAgent.nameWithType,
				).catch(() => undefined);
			}}
			size={size}
			style={style}
			title={`${label} ${defaultCodingAgent.nameWithType}`}
		>
			<CodingAgentIcon
				codingAgentId={defaultCodingAgent.id}
				size={size === 'default' ? 14 : 18}
			/>
			{label} {defaultCodingAgent.name}
		</AppLaunchButton>
	);
};
