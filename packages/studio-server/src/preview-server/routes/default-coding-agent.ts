import type {
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse,
	OpenInCodingAgentRequest,
	OpenInCodingAgentResponse,
} from '@remotion/studio-shared';
import {
	getAvailableCodingAgents,
	getRunningCodingAgents,
	launchCodingAgent,
} from '../../helpers/coding-agent-registry';
import {getAvailableGitClients} from '../../helpers/git-client-registry';
import {getAvailableTerminals} from '../../helpers/terminal-registry';
import type {ApiHandler} from '../api-types';

export const getDefaultCodingAgentInfoHandler: ApiHandler<
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse
> = async ({getDefaultCodingAgent, input}) => {
	const installedCodingAgents = await getAvailableCodingAgents();
	const runningCodingAgents = await getRunningCodingAgents(
		installedCodingAgents,
	);
	const installedTerminals = await getAvailableTerminals();
	const installedGitClients = await getAvailableGitClients();
	const recentlyUsedCodingAgents = input.recentlyUsedCodingAgents ?? [];
	return {
		defaultCodingAgent: getDefaultCodingAgent(),
		installedCodingAgents: [...installedCodingAgents]
			.sort((a, b) => {
				const runningDifference =
					Number(runningCodingAgents.includes(b.id)) -
					Number(runningCodingAgents.includes(a.id));
				if (runningDifference !== 0 || !runningCodingAgents.includes(a.id)) {
					return runningDifference;
				}

				const aIndex = recentlyUsedCodingAgents.indexOf(a.id);
				const bIndex = recentlyUsedCodingAgents.indexOf(b.id);
				return (
					(aIndex === -1 ? recentlyUsedCodingAgents.length : aIndex) -
					(bIndex === -1 ? recentlyUsedCodingAgents.length : bIndex)
				);
			})
			.map(({id, name, nameWithType}) => ({
				id,
				name,
				nameWithType,
			})),
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
