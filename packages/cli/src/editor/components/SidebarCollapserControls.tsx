import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {SidebarContext} from '../state/sidebar';
import {InlineAction} from './InlineAction';
import {Row} from './layout';
import {useResponsiveSidebarStatus} from './TopPanel';

const style: React.CSSProperties = {
	width: 16,
	height: 16,
	border: '1px solid white',
	borderRadius: 3,
	position: 'relative',
};

// TODO: Handle flickering when bars get toggled
export const SidebarCollapserControls: React.FC<{}> = () => {
	const {
		setSidebarCollapsedStateLeft,
		setSidebarCollapsedStateRight,
		sidebarCollapsedStateRight,
	} = useContext(SidebarContext);
	const keybindings = useKeybinding();
	const leftSidebarStatus = useResponsiveSidebarStatus();
	const leftIcon: React.CSSProperties = useMemo(() => {
		return {
			width: '35%',
			height: '100%',
			borderRight: '1px solid white',
			background: leftSidebarStatus === 'expanded' ? 'white' : 'transparent',
		};
	}, [leftSidebarStatus]);

	const rightIcon: React.CSSProperties = useMemo(() => {
		return {
			width: '35%',
			height: '100%',
			right: 0,
			position: 'absolute',
			borderLeft: '1px solid white',
			background:
				sidebarCollapsedStateRight === 'expanded' ? 'white' : 'transparent',
		};
	}, [sidebarCollapsedStateRight]);

	// TODO: Make KeyboardShortcutExplainer scrollable
	const toggleLeft = useCallback(() => {
		setSidebarCollapsedStateLeft((s) => {
			if (s === 'responsive') {
				return leftSidebarStatus === 'collapsed' ? 'expanded' : 'collapsed';
			}

			return s === 'collapsed' ? 'expanded' : 'collapsed';
		});
	}, [leftSidebarStatus, setSidebarCollapsedStateLeft]);

	const toggleRight = useCallback(() => {
		setSidebarCollapsedStateRight((s) =>
			s === 'collapsed' ? 'expanded' : 'collapsed'
		);
	}, [setSidebarCollapsedStateRight]);

	const toggleBoth = useCallback(() => {
		if (sidebarCollapsedStateRight === leftSidebarStatus) {
			toggleLeft();
			toggleRight();
		} else if (sidebarCollapsedStateRight === 'expanded') {
			toggleRight();
		} else if (leftSidebarStatus === 'expanded') {
			toggleLeft();
		}
	}, [leftSidebarStatus, sidebarCollapsedStateRight, toggleLeft, toggleRight]);

	useEffect(() => {
		const left = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'b',
			commandCtrlKey: true,
			callback: toggleLeft,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});

		const right = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'j',
			commandCtrlKey: true,
			callback: toggleRight,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});

		const zen = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'g',
			commandCtrlKey: true,
			callback: toggleBoth,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});

		return () => {
			left.unregister();
			right.unregister();
			zen.unregister();
		};
	}, [keybindings, toggleBoth, toggleLeft, toggleRight]);

	return (
		<Row>
			<InlineAction onClick={toggleLeft}>
				<div style={style} title="toggle left (cmd/ctrl + b)">
					<div style={leftIcon} />
				</div>
			</InlineAction>
			<InlineAction onClick={toggleRight}>
				<div style={style} title="toggle right (cmd/ctrl + j)">
					<div style={rightIcon} />
				</div>
			</InlineAction>
		</Row>
	);
};
