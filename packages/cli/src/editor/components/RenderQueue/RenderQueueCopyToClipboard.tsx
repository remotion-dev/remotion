import {useCallback} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {ClipboardIcon} from '../../icons/clipboard';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {sendErrorNotification} from '../Notifications/NotificationCenter';
import {copyToClipboard} from './actions';

const revealIconStyle: React.CSSProperties = {
	height: 12,
	color: 'currentColor',
};

export const RenderQueueCopyToClipboard: React.FC<{job: RenderJob}> = ({
	job,
}) => {
	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon style={revealIconStyle} color={color} />;
	}, []);

	const onClick = useCallback(() => {
		copyToClipboard({outName: job.outName}).catch((err) => {
			sendErrorNotification(`Could not copy to clipboard: ${err.message}`);
		});
	}, [job.outName]);

	return (
		<InlineAction
			title="Copy still"
			renderAction={renderCopyAction}
			onClick={onClick}
		/>
	);
};
