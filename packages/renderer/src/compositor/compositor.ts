import {spawn} from 'child_process';
import {dynamicLibraryPathOptions} from '../call-ffmpeg';
import {getExecutablePath} from './get-executable-path';
import type {CliInputCommand, CompositorCommand} from './payloads';

export type Compositor = {
	finishCommands: () => void;
	executeCommand: (payload: CompositorCommand) => Promise<void>;
	waitForDone: () => Promise<void>;
};

const compositorMap: Record<string, Compositor> = {};

export const spawnCompositorOrReuse = ({
	initiatePayload,
	renderId,
}: {
	initiatePayload: CliInputCommand;
	renderId: string;
}) => {
	if (!compositorMap[renderId]) {
		compositorMap[renderId] = startCompositor(initiatePayload);
	}

	return compositorMap[renderId];
};

export const releaseCompositorWithId = (renderId: string) => {
	if (compositorMap[renderId]) {
		compositorMap[renderId].finishCommands();
	}
};

export const waitForCompositorWithIdToQuit = (renderId: string) => {
	if (!compositorMap[renderId]) {
		throw new TypeError('No compositor with that id');
	}

	return compositorMap[renderId].waitForDone();
};

export const startCompositor = (payload: CliInputCommand) => {
	const bin = getExecutablePath('compositor');
	const child = spawn(bin, dynamicLibraryPathOptions());
	const stderrChunks: Buffer[] = [];

	child.stdin.write(JSON.stringify(payload));

	return {
		waitForDone: () => {
			return new Promise<void>((resolve, reject) => {
				child.on('close', (code) => {
					if (code === 0) {
						resolve();
					} else {
						reject(Buffer.concat(stderrChunks).toString('utf-8'));
					}
				});
			});
		},
	};
};
