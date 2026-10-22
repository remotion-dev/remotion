import {useContext, useMemo} from 'react';
import {SidebarContext} from '../state/sidebar';
import {useMobileLayout} from './mobile-layout';
import {useBreakpoint} from './use-breakpoint';

export const SIDEBAR_RESPONSIVE_BREAKPOINTS = {
	left: 1000,
	right: 800,
};

export const useResponsiveSidebarStatus = (
	side: 'left' | 'right',
): 'collapsed' | 'expanded' => {
	const {
		rightSidebarTemporaryExpansion,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
	} = useContext(SidebarContext);
	const isMobileLayout = useMobileLayout();
	const responsiveStatus = useBreakpoint(SIDEBAR_RESPONSIVE_BREAKPOINTS[side])
		? 'collapsed'
		: 'expanded';
	const collapsedState =
		side === 'left' ? sidebarCollapsedStateLeft : sidebarCollapsedStateRight;

	return useMemo((): 'expanded' | 'collapsed' => {
		if (side === 'left' && isMobileLayout) {
			return 'collapsed';
		}

		if (collapsedState === 'collapsed') {
			return 'collapsed';
		}

		if (collapsedState === 'expanded') {
			return 'expanded';
		}

		if (side === 'right' && rightSidebarTemporaryExpansion) {
			return 'expanded';
		}

		if (isMobileLayout) {
			return 'collapsed';
		}

		return responsiveStatus;
	}, [
		collapsedState,
		isMobileLayout,
		responsiveStatus,
		rightSidebarTemporaryExpansion,
		side,
	]);
};
