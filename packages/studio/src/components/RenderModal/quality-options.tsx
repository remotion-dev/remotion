import type {WebRendererQuality} from '@remotion/web-renderer';
import {Checkmark} from '../../icons/Checkmark';
import type {ComboboxValue} from '../NewComposition/ComboBox';

const QUALITY_OPTIONS: {value: WebRendererQuality; label: string}[] = [
	{value: 'very-low', label: 'Very Low'},
	{value: 'low', label: 'Low'},
	{value: 'medium', label: 'Medium'},
	{value: 'high', label: 'High'},
	{value: 'very-high', label: 'Very High'},
];

export const getQualityOptions = (
	selectedQuality: WebRendererQuality,
	setQuality: (quality: WebRendererQuality) => void,
): ComboboxValue[] => {
	return QUALITY_OPTIONS.map(({value, label}) => ({
		label,
		onClick: () => setQuality(value),
		leftItem: selectedQuality === value ? <Checkmark /> : null,
		id: value,
		keyHint: null,
		quickSwitcherLabel: null,
		subMenu: null,
		type: 'item' as const,
		value,
	}));
};
