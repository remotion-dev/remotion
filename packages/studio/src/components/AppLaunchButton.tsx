import React, {useMemo} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {CaretDown} from '../icons/caret';
import {getConfigureDefaultAppsMenuItems} from './get-open-in-menu-items';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';

const compactMainSegmentStyle: React.CSSProperties = {
	fontFamily: 'inherit',
	gap: 6,
	padding: '0 9px',
};

const defaultMainSegmentStyle: React.CSSProperties = {
	...compactMainSegmentStyle,
	fontSize: 14,
	lineHeight: '21px',
};

const dropdownSegmentStyle: React.CSSProperties = {
	fontFamily: 'inherit',
	padding: 0,
	width: 20,
};

const dropdownIconStyle: React.CSSProperties = {
	display: 'flex',
	transform: 'translateY(-1px)',
};

export const AppLaunchButton: React.FC<{
	readonly actionButtonId: string | null;
	readonly ariaLabel: string;
	readonly children: React.ReactNode;
	readonly disabled: boolean;
	readonly menuAriaLabel: string;
	readonly menuButtonId: string | null;
	readonly menuItems: ComboboxValue[];
	readonly onConfigureApps: (() => void) | null;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly size: 'compact' | 'default';
	readonly style: React.CSSProperties | null;
	readonly title: string;
}> = ({
	actionButtonId,
	ariaLabel,
	children,
	disabled,
	menuAriaLabel,
	menuButtonId,
	menuItems,
	onConfigureApps,
	onClick,
	size,
	style,
	title,
}) => {
	const items = useMemo(() => {
		return [
			...menuItems,
			...getConfigureDefaultAppsMenuItems({
				hasPreviousItems: menuItems.length > 0,
				onConfigureApps,
			}),
		];
	}, [menuItems, onConfigureApps]);
	const segments = useMemo((): SegmentedButtonSegment[] => {
		return [
			{
				ariaLabel,
				buttonId: actionButtonId,
				disabled,
				idleColor: LIGHT_TEXT,
				onClick,
				onPointerDown: null,
				renderContent: () => children,
				segmentId: 'preferred-app',
				style:
					size === 'default'
						? defaultMainSegmentStyle
						: compactMainSegmentStyle,
				title,
				type: 'action',
			},
			...(items.length > 0
				? [
						{
							ariaLabel: menuAriaLabel,
							buttonId: menuButtonId,
							disabled: false,
							idleColor: LIGHT_TEXT,
							leaveLeftSpace: true,
							onOpenChange: null,
							renderContent: (color: string) => (
								<span style={dropdownIconStyle}>
									<CaretDown color={color} />
								</span>
							),
							segmentId: 'another-app',
							selectedId: null,
							style: dropdownSegmentStyle,
							title: menuAriaLabel,
							type: 'menu' as const,
							values: items,
						},
					]
				: []),
		];
	}, [
		actionButtonId,
		ariaLabel,
		children,
		disabled,
		items,
		menuAriaLabel,
		menuButtonId,
		onClick,
		size,
		title,
	]);

	return (
		<SegmentedButton
			segments={segments}
			style={{...(size === 'default' ? {height: 41} : null), ...style}}
			title={null}
		/>
	);
};
