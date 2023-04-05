import React, {useCallback, useContext, useMemo} from 'react';
import {SidebarContext} from '../state/sidebar';
import {InlineAction} from './InlineAction';
import {Row} from './layout';
import {useActualSidebarStatus} from './TopPanel';

const style: React.CSSProperties = {
	width: 16,
	height: 16,
	border: '1px solid white',
	borderRadius: 3,
	position: 'relative',
};

export const SidebarCollapserControls: React.FC<{}> = () => {
	const {
		setSidebarCollapsedStateLeft,
		setSidebarCollapsedStateRight,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
	} = useContext(SidebarContext);

	const responsiveSidebarStatus = useActualSidebarStatus();

	const leftIcon: React.CSSProperties = useMemo(() => {
		const icon = {
			width: '35%',
			height: '100%',
			borderRight: '1px solid white',
		};

		if (sidebarCollapsedStateLeft === 'responsive') {
			return {
				...icon,
				background:
					responsiveSidebarStatus[0] === 'expanded' ? 'white' : 'transparent',
			};
		}

		return {
			...icon,
			background:
				sidebarCollapsedStateLeft === 'expanded' ? 'white' : 'transparent',
		};
	}, [responsiveSidebarStatus, sidebarCollapsedStateLeft]);

	const rightIcon: React.CSSProperties = useMemo(() => {
		const icon: React.CSSProperties = {
			width: '35%',
			height: '100%',
			right: 0,
			position: 'absolute',
			borderLeft: '1px solid white',
		};
		if (sidebarCollapsedStateRight === 'responsive') {
			return {
				...icon,
				background:
					responsiveSidebarStatus[1] === 'expanded' ? 'white' : 'transparent',
			};
		}

		return {
			...icon,
			background:
				sidebarCollapsedStateRight === 'expanded' ? 'white' : 'transparent',
		};
	}, [responsiveSidebarStatus, sidebarCollapsedStateRight]);

	// TODO: What if left sidebar is in "responsive" mode?
	const toggleLeft = useCallback(() => {
		setSidebarCollapsedStateLeft((s) =>
			s === 'collapsed' ? 'expanded' : 'collapsed'
		);
	}, [setSidebarCollapsedStateLeft]);

	// TODO: Don't have "responsive state for right sidebar"
	const toggleRight = useCallback(() => {
		setSidebarCollapsedStateRight((s) =>
			s === 'collapsed' ? 'expanded' : 'collapsed'
		);
	}, [setSidebarCollapsedStateRight]);

	return (
		<Row>
			<InlineAction onClick={toggleLeft}>
				<div style={style}>
					<div style={leftIcon} />
				</div>
			</InlineAction>
			<InlineAction onClick={toggleRight}>
				<div style={style}>
					<div style={rightIcon} />
				</div>
			</InlineAction>
		</Row>
	);
};
