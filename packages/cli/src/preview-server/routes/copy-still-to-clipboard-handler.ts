import {RenderInternals} from '@remotion/renderer';
import path from 'path';
import type {ApiHandler} from '../api-types';
import type {CopyStillToClipboardRequest} from '../render-queue/job';

export const handleCopyStillToClipboard: ApiHandler<
	CopyStillToClipboardRequest,
	void
> = ({input: {outName}, remotionRoot}) => {
	const resolved = path.resolve(remotionRoot, outName);

	const relativeToProcessCwd = path.relative(remotionRoot, resolved);
	if (relativeToProcessCwd.startsWith('..')) {
		throw new Error(`Not allowed to open ${relativeToProcessCwd}`);
	}

	return RenderInternals.copyImageToClipboard(resolved, 'info');
};
