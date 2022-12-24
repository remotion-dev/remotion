import type {ApiHandler} from '../api-types';
import type {OpenInFileExplorerRequest} from '../render-queue/job';
import {openDirectoryInFinder} from '../render-queue/open-directory-in-finder';

export const handleOpenInFileExplorer: ApiHandler<
	OpenInFileExplorerRequest,
	void
> = ({input: {directory}}) => {
	// TODO: Disallow opening file that is not in Remotion CWD
	return openDirectoryInFinder(directory);
};
