import type {RenameStaticFileResponse} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';

export const renameStaticFile = ({
	oldRelativePath,
	newRelativePath,
}: {
	oldRelativePath: string;
	newRelativePath: string;
}): Promise<RenameStaticFileResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('renameStaticFile() is only available in the Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('renameStaticFile() is not available in Read-Only Studio');
	}

	return callApi('/api/rename-static-file', {
		oldRelativePath,
		newRelativePath,
	});
};

export {RenameStaticFileResponse};
