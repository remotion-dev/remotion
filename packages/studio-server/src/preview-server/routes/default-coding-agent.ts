import type {
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse,
	OpenInCodingAgentRequest,
	OpenInCodingAgentResponse,
} from '@remotion/studio-shared';
import {getAppDiscovery} from '../../helpers/app-discovery';
import {
	getAvailableCodingAgents,
	launchCodingAgent,
} from '../../helpers/coding-agent-registry';
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
		recentlyUsedIds: input.recentlyUsedIds ?? null,
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

export const openInCodingAgentHandler: ApiHandler<
	OpenInCodingAgentRequest,
	OpenInCodingAgentResponse
> = async ({input, logLevel, remotionRoot}) => {
	const codingAgent = (await getAvailableCodingAgents()).find(
		(agent) => agent.id === input.codingAgentId,
	);
	if (!codingAgent) {
		return {success: false};
	}

	return {
		success: await launchCodingAgent({
			codingAgent,
			projectPath: remotionRoot,
			logLevel,
			prompt: input.prompt,
		}),
	};
};
