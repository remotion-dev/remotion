import React, {useCallback, useContext, useEffect} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
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
	SIDEBAR_RESPONSIVE_BREAKPOINTS,
	useResponsiveSidebarStatus,
} from '../helpers/use-responsive-sidebar-status';
import {SidebarContext} from '../state/sidebar';
import {ActionTooltip} from './ActionTooltip';
import {ContextMenu} from './ContextMenu';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getSidebarMenuItems} from './sidebar-menu-items';

const style: React.CSSProperties = {
	display: 'block',
	width: 16,
	height: 16,
	minWidth: 16,
};

export const SidebarCollapserControl: React.FC<{
	readonly side: 'left' | 'right';
}> = ({side}) => {
	const {
		leftSidebarOverlayOpen,
		setLeftSidebarOverlayOpen,
		rightSidebarTemporaryExpansion,
		setRightSidebarTemporaryExpansion,
		setSidebarCollapsedState,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
		sidebarCollapsedDuringDrag,
	} = useContext(SidebarContext);
	const keybindings = useKeybinding();
	const isNarrowLayout = useBreakpoint(SIDEBAR_RESPONSIVE_BREAKPOINTS.right);
	const mobileLayout = useMobileLayout();
	const responsiveLeftSidebarStatus = useResponsiveSidebarStatus('left');
	const leftSidebarStatus = leftSidebarOverlayOpen
		? 'expanded'
		: responsiveLeftSidebarStatus;
	const rightSidebarStatus = useResponsiveSidebarStatus('right');

	const toggleLeft = useCallback(() => {
		if (mobileLayout || leftSidebarOverlayOpen) {
			setLeftSidebarOverlayOpen((open) => !open);
			return;
		}

		setSidebarCollapsedState({
			left: (s) => {
				if (s === 'responsive') {
					return leftSidebarStatus === 'collapsed' ? 'expanded' : 'collapsed';
				}

				return s === 'collapsed' ? 'expanded' : 'collapsed';
			},
			right: null,
		});
	}, [
		leftSidebarOverlayOpen,
		leftSidebarStatus,
		mobileLayout,
		setLeftSidebarOverlayOpen,
		setSidebarCollapsedState,
	]);

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
		if (mobileLayout || leftSidebarOverlayOpen) {
			if (leftSidebarStatus === rightSidebarStatus) {
				toggleLeft();
				toggleRight();
			} else if (rightSidebarStatus === 'expanded') {
				toggleRight();
			} else {
				toggleLeft();
			}

			return;
		}

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
		leftSidebarOverlayOpen,
		leftSidebarStatus,
		mobileLayout,
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
	const label =
		side === 'left' && (mobileLayout || leftSidebarOverlayOpen)
			? `${expanded ? 'Close' : 'Open'} compositions`
			: `${expanded ? 'Collapse' : 'Expand'} ${side} sidebar`;

	const renderSidebarIcon: RenderInlineAction = useCallback(
		(color) => {
			const dividerX = side === 'left' ? 5.5 : 10.5;
			return (
				<svg
					data-sidebar-toggle={side}
					style={style}
					viewBox="0 0 16 16"
					aria-hidden="true"
				>
					{expanded ? (
						<path
							fill={color}
							d={
								side === 'left'
									? 'M3 .5H5.5V15.5H3A2.5 2.5 0 0 1 .5 13V3A2.5 2.5 0 0 1 3 .5Z'
									: 'M10.5 .5H13A2.5 2.5 0 0 1 15.5 3V13A2.5 2.5 0 0 1 13 15.5H10.5Z'
							}
						/>
					) : null}
					<rect
						x={0.5}
						y={0.5}
						width={15}
						height={15}
						rx={2.5}
						fill="none"
						stroke={color}
						strokeWidth={1}
					/>
					<path
						d={`M${dividerX} .5V15.5`}
						fill="none"
						stroke={color}
						strokeWidth={1}
					/>
				</svg>
			);
		},
		[expanded, side],
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
				renderAction={renderSidebarIcon}
				unhoveredColor={LIGHT_TEXT}
				style={side === 'left' ? {marginRight: 4} : undefined}
				aria-label={label}
				aria-expanded={expanded}
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaShortcut || undefined
				}
			/>
		</ActionTooltip>
	);

	if (side === 'left' && (mobileLayout || leftSidebarOverlayOpen)) {
		return control;
	}

	return (
		<ContextMenu
			getItems={getSidebarContextMenuItems}
			style={{display: 'flex'}}
		>
			{control}
		</ContextMenu>
	);
};
