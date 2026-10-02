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
			const pendingContext =
				typeof contextForAgents === 'function'
					? contextForAgents()
					: Promise.resolve(contextForAgents);

			// Passing a pending Blob keeps the write tied to the click, which
			// browsers require even if the context is resolved afterwards.
			navigator.clipboard
				.write([
					new ClipboardItem({
						'text/plain': pendingContext.then((context) => {
							if (!context) {
								throw new Error('No source location found');
							}

							return new Blob([context], {type: 'text/plain'});
						}),
					}),
				])
				.catch((err) => {
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
