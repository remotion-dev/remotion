import type {ApiHandler} from '../api-types';
import {copyStillToClipBoard} from '../render-queue/copy-still-to-clipboard';
import type {CopyStillToClipboardRequest} from '../render-queue/job';

export const handleCopyStillToClipboard: ApiHandler<
	CopyStillToClipboardRequest,
	void
> = ({input: {directory}}) => {
	return copyStillToClipBoard(directory);
};
