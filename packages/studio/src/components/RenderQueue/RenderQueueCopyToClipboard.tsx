import type {RenderJob} from '@remotion/studio-shared';
import {useCallback} from 'react';
import {ClipboardIcon} from '../../icons/clipboard';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
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
			copyToClipboard({
				outName: job.outName,
				binariesDirectory: job.binariesDirectory,
			})
				.catch((err) => {
					showNotification(`Could not copy to clipboard: ${err.message}`, 2000);
				})
				.then(() => {
					showNotification('Copied to clipboard', 1000);
				});
		},
		[job.binariesDirectory, job.outName],
	);

	return (
		<InlineAction
			title="Copy to clipboard"
			renderAction={renderCopyAction}
			onClick={onClick}
		/>
	);
};
