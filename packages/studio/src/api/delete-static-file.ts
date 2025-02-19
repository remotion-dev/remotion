import type {DeleteStaticFileResponse} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';

export const deleteStaticFile = async (
	relativePath: string,
): Promise<DeleteStaticFileResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('deleteStaticFile() is only available in the Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('deleteStaticFile() is not available in Read-Only Studio');
	}

	if (relativePath.startsWith(window.remotion_staticBase)) {
		relativePath = relativePath.substring(
			window.remotion_staticBase.length + 1,
		);
	}

	const res = await callApi('/api/delete-static-file', {relativePath});
	return res;
};

export {DeleteStaticFileResponse};
