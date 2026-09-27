import {useContext, useMemo} from 'react';
import {SidebarContext} from '../state/sidebar';
import {useMobileLayout} from './mobile-layout';
import {useBreakpoint} from './use-breakpoint';

export const useResponsiveSidebarStatus = (): 'collapsed' | 'expanded' => {
	const {sidebarCollapsedStateLeft} = useContext(SidebarContext);
	const isMobileLayout = useMobileLayout();
	const responsiveLeftStatus = useBreakpoint(1200) ? 'collapsed' : 'expanded';

	return useMemo((): 'expanded' | 'collapsed' => {
		if (isMobileLayout) {
			return 'collapsed';
		}

		if (sidebarCollapsedStateLeft === 'collapsed') {
			return 'collapsed';
		}

		if (sidebarCollapsedStateLeft === 'expanded') {
			return 'expanded';
		}

		return responsiveLeftStatus;
	}, [isMobileLayout, responsiveLeftStatus, sidebarCollapsedStateLeft]);
};
