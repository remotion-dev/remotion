import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useMemo} from 'react';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
import {removeRenderJob} from './actions';

export const RenderQueueRemoveItem: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			removeRenderJob(job)
				.then(() => {
					showNotification('Removed job', 2000);
				})
				.catch((err) => {
					showNotification(`Could not remove item: ${err.message}`, 2000);
				});
		},
		[job],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 16,
			color: 'currentColor',
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<svg
					style={icon}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 320 512"
				>
					<path
						fill={color}
						d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
					/>
				</svg>
			);
		},
		[icon],
	);

	return <InlineAction renderAction={renderAction} onClick={onClick} />;
};
