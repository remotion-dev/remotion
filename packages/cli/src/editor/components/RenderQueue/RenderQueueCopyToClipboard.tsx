import {useCallback} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {ClipboardIcon} from '../../icons/clipboard';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {
	notificationCenter,
	sendErrorNotification,
} from '../Notifications/NotificationCenter';
import {copyToClipboard} from './actions';

const revealIconStyle: React.CSSProperties = {
	height: 12,
	color: 'currentColor',
};

export const supportsCopyingToClipboard = (job: RenderJob) => {
	if (job.status !== 'done') {
		return false;
	}

	if (job.type !== 'still') {
		return false;
	}

	if (job.imageFormat === 'png') {
		return true;
	}

	if (job.imageFormat === 'jpeg') {
		return true;
	}

	return false;
};

export const RenderQueueCopyToClipboard: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon style={revealIconStyle} color={color} />;
	}, []);

	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			copyToClipboard({outName: job.outName})
				.catch((err) => {
					sendErrorNotification(`Could not copy to clipboard: ${err.message}`);
				})
				.then(() => {
					notificationCenter.current?.addNotification({
						content: 'Copied to clipboard',
						created: Date.now(),
						duration: 1000,
						id: String(Math.random()),
					});
				});
		},
		[job.outName],
	);

	return (
		<InlineAction
			title="Copy to clipboard"
			renderAction={renderCopyAction}
			onClick={onClick}
		/>
	);
};
