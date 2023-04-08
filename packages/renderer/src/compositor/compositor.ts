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

export const startCompositor = (payload: CliInputCommand): Compositor => {
	const bin = getExecutablePath('compositor');
	const child = spawn(
		bin,
		[JSON.stringify(payload)],
		dynamicLibraryPathOptions()
	);
	const stderrChunks: Buffer[] = [];

	child.stdout.on('data', (data) => {
		console.log(data.toString('utf-8'));
	});
	child.stderr.on('data', (data) => {
		console.log(data.toString('utf-8'));
	});

	return {
		waitForDone: () => {
			return new Promise<void>((resolve, reject) => {
				child.on('close', (code, s) => {
					console.log({code, s});
					if (code === 0) {
						resolve();
					} else {
						reject(Buffer.concat(stderrChunks).toString('utf-8'));
					}
				});
			});
		},
		finishCommands: () => {
			child.stdin.write('EOF\n');
		},

		executeCommand: (command: CompositorCommand) => {
			child.stdin.write(JSON.stringify(command) + '\n');
			return Promise.resolve();
		},
	};
};
