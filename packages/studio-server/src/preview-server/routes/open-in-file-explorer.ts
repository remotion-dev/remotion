import type {OpenInFileExplorerRequest} from '@remotion/studio-shared';
import {openDirectoryInFinder} from '../../open-directory-in-finder';
import type {ApiHandler} from '../api-types';

export const handleOpenInFileExplorer: ApiHandler<
	OpenInFileExplorerRequest,
	void
> = ({input: {directory}, remotionRoot}) => {
	return openDirectoryInFinder(directory, remotionRoot);
};
