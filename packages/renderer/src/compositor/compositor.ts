import {spawn} from 'child_process';
import {truthy} from '../truthy';
import {getExecutablePath} from './get-executable-path';
import type {
	CompositorCommand,
	CompositorInitiatePayload,
	ErrorPayload,
	TaskDonePayload,
} from './payloads';

export type Compositor = {
	finishCommands: () => void;
	executeCommand: (payload: Omit<CompositorCommand, 'nonce'>) => Promise<void>;
	waitForDone: () => Promise<void>;
};

const compositorMap: Record<string, Compositor> = {};

export const spawnCompositorOrReuse = ({
	initiatePayload,
	renderId,
}: {
	initiatePayload: CompositorInitiatePayload;
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

const startCompositor = (
	compositorInitiatePayload: CompositorInitiatePayload
): Compositor => {
	const bin = getExecutablePath();

	const child = spawn(`${bin}`, [JSON.stringify(compositorInitiatePayload)]);

	const stderrChunks: Buffer[] = [];

	let stdoutListeners: ((d: string) => void)[] = [];
	let stderrListeners: ((d: string) => void)[] = [];

	child.stderr.on('data', (d) => {
		stderrChunks.push(d);
		const str = d.toString('utf-8');
		stderrListeners.forEach((s) => s(str));
	});
	child.stdout.on('data', (d) => {
		const str = d.toString('utf-8');
		stdoutListeners.forEach((s) => s(str));
	});

	let nonce = 0;

	return {
		waitForDone: () => {
			return new Promise((resolve, reject) => {
				child.on('exit', (code) => {
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
		executeCommand: (payload) => {
			const actualPayload: CompositorCommand = {
				...payload,
				nonce,
			};
			nonce++;
			return new Promise((resolve, reject) => {
				child.stdin.write(JSON.stringify(actualPayload) + '\n');

				const onStderr = (message: string) => {
					let parsed: ErrorPayload | null = null;
					try {
						const content = JSON.parse(message) as ErrorPayload;
						if (content.msg_type === 'error') {
							parsed = content;
						}
					} catch (error) {
						// TODO: Obviously bad, does not handle panics
						console.log('Rust debug err:', message);
					}

					if (parsed) {
						const err = new Error(parsed.error);
						err.stack = parsed.error + '\n' + parsed.backtrace;

						reject(err);
						stdoutListeners = stdoutListeners.filter((s) => s !== onStdout);
						stderrListeners = stderrListeners.filter((s) => s !== onStderr);
					}
				};

				const onStdout = (str: string) => {
					const lineSplit = str.split('\n');
					for (const line of lineSplit.filter(truthy)) {
						let parsed: TaskDonePayload | null = null;
						try {
							const p = JSON.parse(line) as TaskDonePayload;
							if (p.msg_type === 'finish') {
								parsed = p;
							}
						} catch (e) {}

						if (parsed && parsed.nonce === actualPayload.nonce) {
							resolve();
							stdoutListeners = stdoutListeners.filter((s) => s !== onStdout);
							stderrListeners = stderrListeners.filter((s) => s !== onStderr);
						}
					}
				};

				stdoutListeners.push(onStdout);
				stderrListeners.push(onStderr);
			});
		},
	};
};
