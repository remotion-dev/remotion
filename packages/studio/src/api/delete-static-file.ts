import type {DeleteStaticFileResponse} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

export const deleteStaticFile = async (
	relativePath: string,
): Promise<DeleteStaticFileResponse> => {
	if (relativePath.startsWith(window.remotion_staticBase)) {
		relativePath = relativePath.substring(
			window.remotion_staticBase.length + 1,
		);
	}

	const res = await callApi('/api/delete-static-file', {relativePath});
	return res;
};

export {DeleteStaticFileResponse};
