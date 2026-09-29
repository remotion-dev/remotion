import React, {useCallback, useContext, useEffect} from 'react';
import {
	BORDER_CURRENT_COLOR,
	CURRENT_COLOR,
	TRANSPARENT,
	WHITE_ALPHA_80,
} from '../helpers/colors';
import {useBreakpoint} from '../helpers/use-breakpoint';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {
	SIDEBAR_RESPONSIVE_BREAKPOINT,
	useResponsiveSidebarStatus,
} from '../helpers/use-responsive-sidebar-status';
import {SidebarContext} from '../state/sidebar';
import {ActionTooltip} from './ActionTooltip';
import {ContextMenu} from './ContextMenu';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getSidebarMenuItems} from './sidebar-menu-items';

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
		rightSidebarTemporaryExpansion,
		setRightSidebarTemporaryExpansion,
		setSidebarCollapsedState,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
		sidebarCollapsedDuringDrag,
	} = useContext(SidebarContext);
	const keybindings = useKeybinding();
	const isNarrowLayout = useBreakpoint(SIDEBAR_RESPONSIVE_BREAKPOINT);
	const leftSidebarStatus = useResponsiveSidebarStatus('left');
	const rightSidebarStatus = useResponsiveSidebarStatus('right');

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
					rightSidebarStatus === 'expanded' &&
					sidebarCollapsedDuringDrag !== 'right'
						? color
						: TRANSPARENT,
			};
		},
		[rightSidebarStatus, sidebarCollapsedDuringDrag],
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
		if (
			isNarrowLayout &&
			rightSidebarTemporaryExpansion &&
			sidebarCollapsedStateRight === 'responsive'
		) {
			setRightSidebarTemporaryExpansion(false);
			return;
		}

		setSidebarCollapsedState({
			right: (s) => {
				if (s === 'responsive') {
					return rightSidebarStatus === 'collapsed' ? 'expanded' : 'collapsed';
				}

				return s === 'collapsed' ? 'expanded' : 'collapsed';
			},
			left: null,
		});
	}, [
		isNarrowLayout,
		rightSidebarStatus,
		rightSidebarTemporaryExpansion,
		setRightSidebarTemporaryExpansion,
		setSidebarCollapsedState,
		sidebarCollapsedStateRight,
	]);

	const toggleBoth = useCallback(() => {
		if (rightSidebarStatus === leftSidebarStatus) {
			const closeTemporaryRightSidebar =
				isNarrowLayout &&
				rightSidebarTemporaryExpansion &&
				sidebarCollapsedStateRight === 'responsive';
			if (closeTemporaryRightSidebar) {
				setRightSidebarTemporaryExpansion(false);
			}

			setSidebarCollapsedState({
				left: (s) => {
					if (s === 'responsive') {
						return leftSidebarStatus === 'collapsed' ? 'expanded' : 'collapsed';
					}

					return s === 'collapsed' ? 'expanded' : 'collapsed';
				},
				right: closeTemporaryRightSidebar
					? null
					: (s) => {
							if (s === 'responsive') {
								return rightSidebarStatus === 'collapsed'
									? 'expanded'
									: 'collapsed';
							}

							return s === 'collapsed' ? 'expanded' : 'collapsed';
						},
			});
		} else if (rightSidebarStatus === 'expanded') {
			toggleRight();
		} else if (leftSidebarStatus === 'expanded') {
			toggleLeft();
		}
	}, [
		isNarrowLayout,
		leftSidebarStatus,
		rightSidebarStatus,
		rightSidebarTemporaryExpansion,
		setRightSidebarTemporaryExpansion,
		setSidebarCollapsedState,
		sidebarCollapsedStateRight,
		toggleLeft,
		toggleRight,
	]);

	const getSidebarContextMenuItems = useCallback(() => {
		return getSidebarMenuItems({
			side,
			state:
				side === 'left'
					? sidebarCollapsedStateLeft
					: sidebarCollapsedStateRight,
			onStateChange: (state) => {
				setSidebarCollapsedState({
					left: side === 'left' ? state : null,
					right: side === 'right' ? state : null,
				});
			},
		});
	}, [
		setSidebarCollapsedState,
		side,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
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

	const action = side === 'left' ? 'toggleLeftSidebar' : 'toggleRightSidebar';
	const shortcut = useKeyboardShortcutLabel(action);
	const ariaShortcut = useKeyboardShortcutAriaKeyShortcuts(action);
	const shortcutsDisabled = areKeyboardShortcutsDisabled();
	const expanded =
		(side === 'left' ? leftSidebarStatus : rightSidebarStatus) === 'expanded' &&
		sidebarCollapsedDuringDrag !== side;
	const label = `${expanded ? 'Collapse' : 'Expand'} ${side} sidebar`;

	const colorStyle = useCallback((color: string): React.CSSProperties => {
		return {
			...style,
			color,
		};
	}, []);

	const toggleLeftAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<div data-sidebar-toggle="left" style={colorStyle(color)}>
					<div style={leftIcon(color)} />
				</div>
			);
		},
		[colorStyle, leftIcon],
	);

	const toggleRightAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<div data-sidebar-toggle="right" style={colorStyle(color)}>
					<div style={rightIcon(color)} />
				</div>
			);
		},
		[colorStyle, rightIcon],
	);

	const control = (
		<ActionTooltip
			label={label}
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick
		>
			<InlineAction
				variant={null}
				onClick={side === 'left' ? toggleLeft : toggleRight}
				renderAction={side === 'left' ? toggleLeftAction : toggleRightAction}
				unhoveredColor={WHITE_ALPHA_80}
				style={side === 'left' ? {marginRight: 4} : undefined}
				aria-label={label}
				aria-expanded={expanded}
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaShortcut || undefined
				}
			/>
		</ActionTooltip>
	);

	return (
		<ContextMenu
			getItems={getSidebarContextMenuItems}
			style={{display: 'flex'}}
		>
			{control}
		</ContextMenu>
	);
};
