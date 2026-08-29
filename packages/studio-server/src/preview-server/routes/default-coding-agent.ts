import type {
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse,
	OpenInCodingAgentRequest,
	OpenInCodingAgentResponse,
} from '@remotion/studio-shared';
import {
	getAvailableCodingAgents,
	launchCodingAgent,
} from '../../helpers/coding-agent-registry';
import {getAvailableGitClients} from '../../helpers/git-client-registry';
import {getAvailableTerminals} from '../../helpers/terminal-registry';
import type {ApiHandler} from '../api-types';

export const getDefaultCodingAgentInfoHandler: ApiHandler<
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse
> = async ({getDefaultCodingAgent}) => {
	const installedCodingAgents = await getAvailableCodingAgents();
	const installedTerminals = await getAvailableTerminals();
	const installedGitClients = await getAvailableGitClients();
	return {
		defaultCodingAgent: getDefaultCodingAgent(),
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
