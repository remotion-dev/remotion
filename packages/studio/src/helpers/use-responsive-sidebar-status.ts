import {useContext, useMemo} from 'react';
import {SidebarContext} from '../state/sidebar';
import {useMobileLayout} from './mobile-layout';
import {useBreakpoint} from './use-breakpoint';

export const useResponsiveSidebarStatus = (
	side: 'left' | 'right',
): 'collapsed' | 'expanded' => {
	const {sidebarCollapsedStateLeft, sidebarCollapsedStateRight} =
		useContext(SidebarContext);
	const isMobileLayout = useMobileLayout();
	const responsiveStatus = useBreakpoint(1200) ? 'collapsed' : 'expanded';
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

		if (isMobileLayout) {
			return 'collapsed';
		}

		return responsiveStatus;
	}, [collapsedState, isMobileLayout, responsiveStatus, side]);
};
