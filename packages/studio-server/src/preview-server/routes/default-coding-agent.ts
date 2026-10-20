import type {
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse,
} from '@remotion/studio-shared';
import {getAppDiscovery} from '../../helpers/app-discovery';
import {getAvailableGitClients} from '../../helpers/git-client-registry';
import {getRecentlyUsedApps} from '../../helpers/recently-used-apps';
import {getAvailableTerminals} from '../../helpers/terminal-registry';
import type {ApiHandler} from '../api-types';

export const getDefaultCodingAgentInfoHandler: ApiHandler<
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse
> = async ({getDefaultCodingAgent, input, remotionRoot}) => {
	await getRecentlyUsedApps({
		remotionRoot,
		type: 'coding-agent',
		recentlyUsedIds: input.recentlyUsedIds,
	});
	const {installedCodingAgents, runningCodingAgents} = await getAppDiscovery();
	const installedTerminals = await getAvailableTerminals();
	const installedGitClients = await getAvailableGitClients();
	return {
		defaultCodingAgent: getDefaultCodingAgent(),
		runningCodingAgents,
		installedCodingAgents: installedCodingAgents.map(
			({id, name, nameWithType}) => ({
				id,
				name,
				nameWithType,
			}),
		),
		installedTerminals: installedTerminals.map(({id, name}) => ({id, name})),
		installedGitClients: installedGitClients.map(({id, name}) => ({id, name})),
	};
};
