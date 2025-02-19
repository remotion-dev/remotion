import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useMemo} from 'react';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
import {cancelRenderJob} from './actions';

export const RenderQueueCancelButton: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			cancelRenderJob(job).catch((err) => {
				showNotification(`Could not cancel job: ${err.message}`, 2000);
			});
		},
		[job],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 14,
			color: 'currentColor',
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<svg
					style={icon}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
				>
					<path
						fill={color}
						d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256z"
					/>
				</svg>
			);
		},
		[icon],
	);

	return <InlineAction renderAction={renderAction} onClick={onClick} />;
};
