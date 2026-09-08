import type {RenderJob} from '@remotion/studio-shared';
import {useCallback} from 'react';
import {CURRENT_COLOR} from '../../helpers/colors';
import {remotion_outputsBase} from '../../helpers/get-asset-metadata';
import {useCopyFeedback} from '../../helpers/use-copy-feedback';
import {CopyIcon} from '../../icons/copy';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';

const revealIconStyle: React.CSSProperties = {
	height: 12,
	color: CURRENT_COLOR,
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
	const {copied, markCopied} = useCopyFeedback();
	const renderCopyAction: RenderInlineAction = useCallback(
		(color) => {
			return <CopyIcon copied={copied} style={revealIconStyle} color={color} />;
		},
		[copied],
	);

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
				markCopied();
				showNotification('Copied to clipboard!', 1000);
			} catch (err) {
				showNotification(
					`Could not copy to clipboard: ${(err as Error).message}`,
					2000,
				);
			}
		},
		[job.outName, markCopied],
	);

	return (
		<InlineAction
			variant={null}
			title="Copy to clipboard"
			renderAction={renderCopyAction}
			onClick={onClick}
		/>
	);
};
