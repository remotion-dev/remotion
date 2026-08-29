import React, {useCallback, useMemo} from 'react';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {CURRENT_COLOR} from '../../helpers/colors';
import {ExpandedFolderIconSolid} from '../../icons/folder';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from './actions';
import type {AnyRenderJob} from './context';

export const RenderQueueOpenInFinderItem: React.FC<{
	readonly job: AnyRenderJob;
}> = ({job}) => {
	const isBrowserStudio = getBrowserStudioOperations() !== null;
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
			color: CURRENT_COLOR,
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return <ExpandedFolderIconSolid style={icon} color={color} />;
		},
		[icon],
	);

	return isBrowserStudio ? null : (
		<InlineAction
			renderAction={renderAction}
			onClick={onClick}
			variant={null}
		/>
	);
};
