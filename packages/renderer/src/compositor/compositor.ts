import {spawn} from 'child_process';
import {truthy} from '../truthy';
import {getExecutablePath} from './get-executable-path';
import type {CliInput, ErrorPayload, TaskDonePayload} from './payloads';

export type Compositor = {
	finishCommands: () => void;
	executeCommand: (payload: Omit<CliInput, 'nonce'>) => Promise<void>;
	waitForDone: () => Promise<void>;
};

const compositorMap: Record<string, Compositor> = {};

export const spawnCompositorOrReuse = (renderId: string) => {
	if (!compositorMap[renderId]) {
		compositorMap[renderId] = startCompositor();
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

const startCompositor = (): Compositor => {
	const bin = getExecutablePath();

	const child = spawn(bin);

	const _stderrChunks: Buffer[] = [];
	const stdoutChunks: Buffer[] = [];

	child.stderr.on('data', (d) => {
		_stderrChunks.push(d);
	});
	child.stdout.on('data', (d) => {
		stdoutChunks.push(d);
	});

	let nonce = 0;

	return {
		waitForDone: () => {
			return new Promise((resolve, reject) => {
				child.on('exit', (code) => {
					console.log({code});
					if (code === 0) {
						resolve();
					} else {
						reject(Buffer.concat(_stderrChunks).toString('utf-8'));
					}
				});
			});
		},
		finishCommands: () => {
			child.stdin.write('EOF\n');
		},
		executeCommand: (payload) => {
			const actualPayload: CliInput = {
				...payload,
				nonce,
			};
			nonce++;
			return new Promise((resolve, reject) => {
				child.stdin.write(JSON.stringify(actualPayload) + '\n');

				const onStderr = (d: Buffer) => {
					const message = d.toString('utf-8');
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
						child.stderr.off('data', onStderr);
						child.stdout.off('data', onStdout);
					}
				};

				const onStdout = (d: Buffer) => {
					const str = d.toString('utf-8');
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
							child.stderr.off('data', onStderr);
							child.stdout.off('data', onStdout);
						}
					}
				};

				child.stderr.on('data', onStderr);
				child.stdout.on('data', onStdout);
			});
		},
	};
};
