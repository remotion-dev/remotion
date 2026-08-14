import type {
	OpenInGitClientRequest,
	OpenInGitClientResponse,
} from '@remotion/studio-shared';
import {
	getAvailableGitClients,
	launchGitClient,
} from '../../helpers/git-client-registry';
import type {ApiHandler} from '../api-types';

export const openInGitClientHandler: ApiHandler<
	OpenInGitClientRequest,
	OpenInGitClientResponse
> = async ({input, remotionRoot}) => {
	const gitClient = (await getAvailableGitClients()).find(
		({id}) => id === input.gitClientId,
	);
	if (!gitClient) {
		return {success: false};
	}

	await launchGitClient({gitClient, remotionRoot});
	return {success: true};
};
