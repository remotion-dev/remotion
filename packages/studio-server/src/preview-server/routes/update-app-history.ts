import type {UpdateAppHistoryRequest} from '@remotion/studio-shared';
import {getRecentlyUsedApps} from '../../helpers/recently-used-apps';
import type {ApiHandler} from '../api-types';

export const updateAppHistoryHandler: ApiHandler<
	UpdateAppHistoryRequest,
	undefined
> = async ({input, remotionRoot}) => {
	await Promise.all([
		getRecentlyUsedApps({
			remotionRoot,
			type: 'editor',
			recentlyUsedIds: input.editor.recentlyUsedIds,
		}),
		getRecentlyUsedApps({
			remotionRoot,
			type: 'coding-agent',
			recentlyUsedIds: input.codingAgent.recentlyUsedIds,
		}),
	]);
};
