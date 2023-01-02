import {spawn} from 'child_process';
import {getExecutablePath} from './get-executable-path';
import type {CliInput, ErrorPayload, TaskDonePayload} from './payloads';

export type Compositor = {
	finishCommands: () => void;
	executeCommand: (payload: Omit<CliInput, 'nonce'>) => Promise<void>;
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
		delete compositorMap[renderId];
		console.log('RELEASED');
	}
};

const startCompositor = (): Compositor => {
	const bin = getExecutablePath();

	const child = spawn(bin);

	child.on('exit', () => {
		console.log('CLOSED');
	});

	let nonce = 0;

	return {
		finishCommands: () => {
			child.stdin.end();
		},
		executeCommand: (payload) => {
			const actualPayload: CliInput = {
				...payload,
				nonce,
			};
			nonce++;
			return new Promise((resolve, reject) => {
				child.stdin.write(JSON.stringify(actualPayload) + '\n');
				const stderrChunks: Buffer[] = [];

				const onStderr = (d: Buffer) => {
					stderrChunks.push(d);
					const message = Buffer.concat(stderrChunks).toString('utf-8');
					console.log(message);

					const parsed = JSON.parse(message) as ErrorPayload;

					const err = new Error(parsed.error);
					err.stack = parsed.error + '\n' + parsed.backtrace;

					reject(err);
					child.stderr.off('data', onStderr);
					child.stdout.off('data', onStdout);
				};

				const onStdout = (d: Buffer) => {
					const str = d.toString('utf-8');
					let parsed: TaskDonePayload | null = null;
					try {
						parsed = JSON.parse(str) as TaskDonePayload;
					} catch (e) {
						console.log(str);
					}

					if (parsed && parsed.nonce === actualPayload.nonce) {
						resolve();
						child.stderr.off('data', onStderr);
						child.stdout.off('data', onStdout);
					}
				};

				child.stderr.on('data', onStderr);
				child.stdout.on('data', onStdout);
			});
		},
	};
};
