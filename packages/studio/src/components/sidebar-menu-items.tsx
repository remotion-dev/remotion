import {Checkmark} from '../icons/Checkmark';
import type {SidebarCollapsedState} from '../state/sidebar';
import type {ComboboxValue} from './NewComposition/ComboBox';

export const getSidebarMenuItems = ({
	side,
	state,
	onStateChange,
}: {
	side: 'left' | 'right';
	state: SidebarCollapsedState;
	onStateChange: (state: SidebarCollapsedState) => void;
}): ComboboxValue[] => {
	return [
		{
			id: `${side}-sidebar-responsive`,
			keyHint: null,
			label: 'Responsive',
			leftItem: state === 'responsive' ? <Checkmark /> : null,
			onClick: () => {
				onStateChange('responsive');
			},
			subMenu: null,
			type: 'item',
			value: 'responsive',
			quickSwitcherLabel: null,
		},
		{
			id: side === 'left' ? 'left-sidebar-expanded' : 'sidebar-expanded',
			keyHint: null,
			label: 'Expanded',
			leftItem: state === 'expanded' ? <Checkmark /> : null,
			onClick: () => {
				onStateChange('expanded');
			},
			subMenu: null,
			type: 'item',
			value: 'expanded',
			quickSwitcherLabel: 'Expand',
		},
		{
			id: `${side}-sidebar-collapsed`,
			keyHint: null,
			label: 'Collapsed',
			leftItem: state === 'collapsed' ? <Checkmark /> : null,
			onClick: () => {
				onStateChange('collapsed');
			},
			subMenu: null,
			type: 'item',
			value: 'collapsed',
			quickSwitcherLabel: 'Collapse',
		},
	];
};
