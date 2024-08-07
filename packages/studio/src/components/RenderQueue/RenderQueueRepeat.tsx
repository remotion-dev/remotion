import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {useMobileLayout} from '../../helpers/mobile-layout';
import {makeRetryPayload} from '../../helpers/retry-payload';
import {ModalsContext} from '../../state/modals';
import {SidebarContext} from '../../state/sidebar';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';

export const RenderQueueRepeatItem: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const isMobileLayout = useMobileLayout();
	const {setSidebarCollapsedState} = useContext(SidebarContext);

	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			const retryPayload = makeRetryPayload(job);
			setSelectedModal(retryPayload);
			if (isMobileLayout) {
				setSidebarCollapsedState({left: 'collapsed', right: 'collapsed'});
			}
		},
		[isMobileLayout, job, setSelectedModal, setSidebarCollapsedState],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 12,
			color: 'currentColor',
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<svg style={icon} viewBox="0 0 512 512">
					<path
						fill={color}
						d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"
					/>
				</svg>
			);
		},
		[icon],
	);

	return <InlineAction onClick={onClick} renderAction={renderAction} />;
};
