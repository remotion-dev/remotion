import type {
	OpenInTerminalRequest,
	OpenInTerminalResponse,
} from '@remotion/studio-shared';
import {
	getAvailableTerminals,
	launchTerminal,
} from '../../helpers/terminal-registry';
import type {ApiHandler} from '../api-types';

export const openInTerminalHandler: ApiHandler<
	OpenInTerminalRequest,
	OpenInTerminalResponse
> = async ({input, remotionRoot}) => {
	const terminal = (await getAvailableTerminals()).find(
		({id}) => id === input.terminalId,
	);
	if (!terminal) {
		return {success: false};
	}

	await launchTerminal({
		allowedDirectory: remotionRoot,
		directory: input.directory,
		terminal,
	});
	return {success: true};
};
