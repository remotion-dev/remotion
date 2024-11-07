import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useMemo} from 'react';
import {ExpandedFolderIconSolid} from '../../icons/folder';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from './actions';

export const RenderQueueOpenInFinderItem: React.FC<{
	readonly job: RenderJob;
}> = ({job}) => {
	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			openInFileExplorer({directory: job.outName}).catch((err) => {
				showNotification(`Could not open file: ${err.message}`, 2000);
			});
		},
		[job.outName],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 12,
			color: 'currentColor',
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return <ExpandedFolderIconSolid style={icon} color={color} />;
		},
		[icon],
	);

	return <InlineAction renderAction={renderAction} onClick={onClick} />;
};
