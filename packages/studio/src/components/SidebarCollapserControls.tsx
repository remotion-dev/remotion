import React, {useCallback, useContext, useEffect} from 'react';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {SidebarContext} from '../state/sidebar';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {useResponsiveSidebarStatus} from './TopPanel';

const style: React.CSSProperties = {
	width: 16,
	height: 16,
	minWidth: 16,
	border: '1px solid currentColor',
	borderRadius: 3,
	color: 'currentColor',
	position: 'relative',
};

export const SidebarCollapserControls: React.FC<{}> = () => {
	const {setSidebarCollapsedState, sidebarCollapsedStateRight} =
		useContext(SidebarContext);
	const keybindings = useKeybinding();
	const leftSidebarStatus = useResponsiveSidebarStatus();

	const leftIcon = useCallback(
		(color: string): React.CSSProperties => {
			return {
				width: '35%',
				height: '100%',
				borderRight: '1px solid ' + color,
				background: leftSidebarStatus === 'expanded' ? color : 'transparent',
			};
		},
		[leftSidebarStatus],
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
					sidebarCollapsedStateRight === 'expanded' ? color : 'transparent',
			};
		},
		[sidebarCollapsedStateRight],
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
		const left = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'b',
			commandCtrlKey: true,
			callback: toggleLeft,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const right = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'j',
			commandCtrlKey: true,
			callback: toggleRight,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const zen = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'g',
			commandCtrlKey: true,
			callback: toggleBoth,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			left.unregister();
			right.unregister();
			zen.unregister();
		};
	}, [keybindings, toggleBoth, toggleLeft, toggleRight]);

	const toggleLeftTooltip = areKeyboardShortcutsDisabled()
		? 'Toggle Left Sidebar'
		: `Toggle Left Sidebar (${cmdOrCtrlCharacter}+B)`;

	const toggleRightTooltip = areKeyboardShortcutsDisabled()
		? 'Toggle Right Sidebar'
		: `Toggle Right Sidebar (${cmdOrCtrlCharacter}+J)`;

	const colorStyle = useCallback((color: string): React.CSSProperties => {
		return {
			...style,
			color,
		};
	}, []);

	const toggleLeftAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<div style={colorStyle(color)} title={toggleLeftTooltip}>
					<div style={leftIcon(color)} />
				</div>
			);
		},
		[colorStyle, leftIcon, toggleLeftTooltip],
	);

	const toggleRightAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<div style={colorStyle(color)} title={toggleRightTooltip}>
					<div style={rightIcon(color)} />
				</div>
			);
		},
		[colorStyle, rightIcon, toggleRightTooltip],
	);

	return (
		<>
			<InlineAction onClick={toggleLeft} renderAction={toggleLeftAction} />
			<InlineAction onClick={toggleRight} renderAction={toggleRightAction} />
		</>
	);
};
