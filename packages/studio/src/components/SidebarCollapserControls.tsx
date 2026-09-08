import React, {useCallback, useContext, useEffect} from 'react';
import {
	BORDER_CURRENT_COLOR,
	CURRENT_COLOR,
	TRANSPARENT,
} from '../helpers/colors';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {useKeyboardShortcutLabel} from '../helpers/use-keyboard-shortcut-label';
import {SidebarContext} from '../state/sidebar';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {useResponsiveSidebarStatus} from './TopPanel';

const style: React.CSSProperties = {
	width: 16,
	height: 16,
	minWidth: 16,
	border: BORDER_CURRENT_COLOR,
	borderRadius: 3,
	color: CURRENT_COLOR,
	position: 'relative',
};

export const SidebarCollapserControl: React.FC<{
	readonly side: 'left' | 'right';
}> = ({side}) => {
	const {
		setSidebarCollapsedState,
		sidebarCollapsedStateRight,
		sidebarCollapsedDuringDrag,
	} = useContext(SidebarContext);
	const keybindings = useKeybinding();
	const leftSidebarStatus = useResponsiveSidebarStatus();

	const leftIcon = useCallback(
		(color: string): React.CSSProperties => {
			return {
				width: '35%',
				height: '100%',
				borderRight: '1px solid ' + color,
				background:
					leftSidebarStatus === 'expanded' &&
					sidebarCollapsedDuringDrag !== 'left'
						? color
						: TRANSPARENT,
			};
		},
		[leftSidebarStatus, sidebarCollapsedDuringDrag],
	);

	const rightIcon = useCallback(
		(color: string): React.CSSProperties => {
			return {
				width: '35%',
				height: '100%',
				right: 0,
				position: 'absolute',
				borderLeft: '1px solid ' + color,
				background:
					sidebarCollapsedStateRight === 'expanded' &&
					sidebarCollapsedDuringDrag !== 'right'
						? color
						: TRANSPARENT,
			};
		},
		[sidebarCollapsedStateRight, sidebarCollapsedDuringDrag],
	);

	const toggleLeft = useCallback(() => {
		setSidebarCollapsedState({
			left: (s) => {
				if (s === 'responsive') {
					return leftSidebarStatus === 'collapsed' ? 'expanded' : 'collapsed';
				}

				return s === 'collapsed' ? 'expanded' : 'collapsed';
			},
			right: null,
		});
	}, [leftSidebarStatus, setSidebarCollapsedState]);

	const toggleRight = useCallback(() => {
		setSidebarCollapsedState({
			right: (s) => (s === 'collapsed' ? 'expanded' : 'collapsed'),
			left: null,
		});
	}, [setSidebarCollapsedState]);

	const toggleBoth = useCallback(() => {
		if (sidebarCollapsedStateRight === leftSidebarStatus) {
			setSidebarCollapsedState({
				left: (s) => {
					if (s === 'responsive') {
						return leftSidebarStatus === 'collapsed' ? 'expanded' : 'collapsed';
					}

					return s === 'collapsed' ? 'expanded' : 'collapsed';
				},
				right: (s) => (s === 'collapsed' ? 'expanded' : 'collapsed'),
			});
		} else if (sidebarCollapsedStateRight === 'expanded') {
			toggleRight();
		} else if (leftSidebarStatus === 'expanded') {
			toggleLeft();
		}
	}, [
		leftSidebarStatus,
		setSidebarCollapsedState,
		sidebarCollapsedStateRight,
		toggleLeft,
		toggleRight,
	]);

	useEffect(() => {
		if (side === 'left') {
			const left = keybindings.registerKeybinding({
				event: 'keydown',
				action: 'toggleLeftSidebar',
				callback: toggleLeft,
				preventDefault: true,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			});

			const zen = keybindings.registerKeybinding({
				event: 'keydown',
				action: 'toggleBothSidebars',
				callback: toggleBoth,
				preventDefault: true,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			});

			return () => {
				left.unregister();
				zen.unregister();
			};
		}

		const right = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'toggleRightSidebar',
			callback: toggleRight,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			right.unregister();
		};
	}, [keybindings, side, toggleBoth, toggleLeft, toggleRight]);

	const leftShortcut = useKeyboardShortcutLabel('toggleLeftSidebar');
	const rightShortcut = useKeyboardShortcutLabel('toggleRightSidebar');
	const toggleLeftTooltip =
		areKeyboardShortcutsDisabled() || leftShortcut === ''
			? 'Toggle Left Sidebar'
			: `Toggle Left Sidebar (${leftShortcut})`;

	const toggleRightTooltip =
		areKeyboardShortcutsDisabled() || rightShortcut === ''
			? 'Toggle Right Sidebar'
			: `Toggle Right Sidebar (${rightShortcut})`;

	const colorStyle = useCallback((color: string): React.CSSProperties => {
		return {
			...style,
			color,
		};
	}, []);

	const toggleLeftAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<div
					data-sidebar-toggle="left"
					style={colorStyle(color)}
					title={toggleLeftTooltip}
				>
					<div style={leftIcon(color)} />
				</div>
			);
		},
		[colorStyle, leftIcon, toggleLeftTooltip],
	);

	const toggleRightAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<div
					data-sidebar-toggle="right"
					style={colorStyle(color)}
					title={toggleRightTooltip}
				>
					<div style={rightIcon(color)} />
				</div>
			);
		},
		[colorStyle, rightIcon, toggleRightTooltip],
	);

	if (side === 'left') {
		return (
			<InlineAction
				variant={null}
				onClick={toggleLeft}
				renderAction={toggleLeftAction}
				style={{marginRight: 4}}
			/>
		);
	}

	return (
		<InlineAction
			variant={null}
			onClick={toggleRight}
			renderAction={toggleRightAction}
		/>
	);
};
