import {openDirectoryInFinder} from '../../helpers/open-directory-in-finder';
import type {ApiHandler} from '../api-types';
import type {OpenInFileExplorerRequest} from '../job';

export const handleOpenInFileExplorer: ApiHandler<
	OpenInFileExplorerRequest,
	void
> = ({input: {directory}, remotionRoot}) => {
	return openDirectoryInFinder(directory, remotionRoot);
};
