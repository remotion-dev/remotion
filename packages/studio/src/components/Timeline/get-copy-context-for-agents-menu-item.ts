import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';

export const getCopyContextForAgentsMenuItem = ({
	contextForAgents,
}: {
	readonly contextForAgents: string | null;
}): ComboboxValue => {
	return {
		type: 'item',
		id: 'copy-context-for-agents',
		keyHint: null,
		label: 'Copy context for agents',
		leftItem: null,
		disabled: !contextForAgents,
		onClick: () => {
			if (!contextForAgents) {
				return;
			}

			navigator.clipboard.writeText(contextForAgents).catch((err) => {
				showNotification(
					`Could not copy to clipboard: ${(err as Error).message}`,
					1000,
				);
			});
		},
		quickSwitcherLabel: null,
		subMenu: null,
		value: 'copy-context-for-agents',
	};
};
