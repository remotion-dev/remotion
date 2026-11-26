import {copyContextForAgents} from '../../helpers/copy-text';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';

export const getCopyContextForAgentsMenuItem = ({
	contextForAgents,
}: {
	// Pass a function to only resolve the context once the item is clicked.
	readonly contextForAgents: string | null | (() => Promise<string | null>);
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

			copyContextForAgents(
				typeof contextForAgents === 'string'
					? contextForAgents
					: contextForAgents(),
			).catch((err) => {
				showNotification(
					`Could not copy to clipboard: ${(err as Error).message}`,
					2000,
				);
			});
		},
		quickSwitcherLabel: null,
		subMenu: null,
		value: 'copy-context-for-agents',
	};
};
