import type {
	PrepareOpenTimelineImportRequest,
	PrepareOpenTimelineImportResponse,
} from '@remotion/studio-shared';
import {prepareOpenTimelineImport} from '../../codemods/prepare-open-timeline-import';
import type {ApiHandler} from '../api-types';

export const prepareOpenTimelineImportHandler: ApiHandler<
	PrepareOpenTimelineImportRequest,
	PrepareOpenTimelineImportResponse
> = async ({input, publicDir, remotionRoot, binariesDirectory}) => {
	const {result, copies, hasRelativeMedia} = await prepareOpenTimelineImport({
		request: input,
		publicDir,
		remotionRoot,
		binariesDirectory,
	});
	return {
		source: result.source,
		metadata: result.metadata,
		diagnostics: result.diagnostics,
		filesToCopy: copies.length,
		hasRelativeMedia,
	};
};
