import type {RenderJob} from '@remotion/studio-shared';
import {useCallback} from 'react';
import {remotion_outputsBase} from '../../helpers/get-asset-metadata';
import {ClipboardIcon} from '../../icons/clipboard';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';

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
		async (e) => {
			e.stopPropagation();
			try {
				const src = `${remotion_outputsBase}/${job.outName}`;

				const content = await fetch(src);
				const contentType = content.headers.get('content-type');
				if (!contentType) {
					throw new Error('Expected content-type header');
				}

				const blob = await content.blob();

				await navigator.clipboard.write([
					new ClipboardItem({
						[contentType]: blob,
					}),
				]);
				showNotification('Copied to clipboard!', 1000);
			} catch (err) {
				showNotification(
					`Could not copy to clipboard: ${(err as Error).message}`,
					2000,
				);
			}
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
