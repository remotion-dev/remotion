import type {
	GetDefaultEditorInfoRequest,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {getEditorInfo} from '../../helpers/app-discovery';
import {getRecentlyUsedApps} from '../../helpers/recently-used-apps';
import type {ApiHandler} from '../api-types';

export const getDefaultEditorInfoHandler: ApiHandler<
	GetDefaultEditorInfoRequest,
	GetDefaultEditorInfoResponse
> = async ({getDefaultEditor, input, remotionRoot}) => {
	await getRecentlyUsedApps({
		remotionRoot,
		type: 'editor',
		recentlyUsedIds: input.recentlyUsedIds,
	});
	return getEditorInfo(getDefaultEditor());
};
