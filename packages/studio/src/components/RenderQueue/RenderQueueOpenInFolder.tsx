import React, {useCallback, useMemo} from 'react';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {CURRENT_COLOR} from '../../helpers/colors';
import {getRenderOutputSrc} from '../../helpers/get-asset-metadata';
import {ExpandedFolderIconSolid} from '../../icons/folder';
import {ActionTooltip} from '../ActionTooltip';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from './actions';
import type {AnyRenderJob} from './context';

export const openRenderOutputInFileExplorer = (job: AnyRenderJob) => {
	return openInFileExplorer({directory: job.outName}).catch(() => {
		if (job.type === 'sequence') {
			showNotification('Could not open folder on the Studio server.', 3000);
			return;
		}

		showNotification(
			'Could not open folder on the Studio server, downloading the file instead.',
			3000,
		);
		const a = document.createElement('a');
		a.href = getRenderOutputSrc(job.outName);
		a.download = job.outName.split(/[/\\]/).at(-1) ?? job.outName;
		a.click();
	});
};

export const RenderQueueOpenInFinderItem: React.FC<{
	readonly job: AnyRenderJob;
}> = ({job}) => {
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			openRenderOutputInFileExplorer(job);
		},
		[job],
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
		<ActionTooltip
			label="Open in Folder"
			shortcut={null}
			delay={800}
			dismissOnClick
		>
			<InlineAction
				aria-label="Open in Folder"
				renderAction={renderAction}
				onClick={onClick}
				variant={null}
			/>
		</ActionTooltip>
	);
};
