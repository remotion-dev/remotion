import {spawn} from 'child_process';
import {dynamicLibraryPathOptions} from '../call-ffmpeg';
import {getExecutablePath} from './get-executable-path';
import {makeNonce} from './make-nonce';
import type {CompositorCommand, CompositorCommandSerialized} from './payloads';

export type Compositor = {
	finishCommands: () => void;
	executeCommand: <T extends keyof CompositorCommand>(
		type: T,
		payload: CompositorCommand[T]
	) => Promise<Buffer>;
	waitForDone: () => Promise<void>;
};

const compositorMap: Record<string, Compositor> = {};

export const spawnCompositorOrReuse = <T extends keyof CompositorCommand>({
	initiatePayload,
	renderId,
}: {
	initiatePayload: CompositorCommand[T];
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

type Waiter = {
	resolve: (data: Buffer) => void;
};

export const startCompositor = <T extends keyof CompositorCommand>(
	payload: CompositorCommand[T]
): Compositor => {
	const bin = getExecutablePath('compositor');
	const child = spawn(
		bin,
		[JSON.stringify(payload)],
		dynamicLibraryPathOptions()
	);
	const stderrChunks: Buffer[] = [];
	let outputBuffer = Buffer.from('');

	const separator = Buffer.from('remotion_buffer:');
	const waiters = new Map<string, Waiter>();

	const onMessage = (nonce: string, data: Buffer) => {
		if (waiters.has(nonce)) {
			(waiters.get(nonce) as Waiter).resolve(data);
			waiters.delete(nonce);
		}
	};

	const processInput = () => {
		let separatorIndex = outputBuffer.indexOf(separator);
		if (separatorIndex === -1) {
			return;
		}

		separatorIndex += separator.length;

		let nonceString = '';
		let lengthString = '';

		// Each message from Rust is prefixed with `remotion_buffer;{[nonce]}:{[length]}`
		// Let's read the buffer to extract the nonce, and if the full length is available,
		// we'll extract the data and pass it to the callback.

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			// 0x3b is the character ";"
			if (nextDigit === 0x3b) {
				separatorIndex++;
				break;
			}

			separatorIndex++;

			nonceString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			// 0x3a is the character ":"
			if (nextDigit === 0x3a) {
				break;
			}

			separatorIndex++;

			lengthString += String.fromCharCode(nextDigit);
		}

		const length = Number(lengthString);

		const dataLength = outputBuffer.length - separatorIndex - 1;
		if (dataLength < length) {
			return;
		}

		const data = outputBuffer.subarray(
			separatorIndex + 1,
			separatorIndex + 1 + Number(lengthString)
		);
		onMessage(nonceString, data);

		outputBuffer = outputBuffer.subarray(separatorIndex + separator.length);
		processInput();
	};

	child.stdout.on('data', (data) => {
		outputBuffer = Buffer.concat([outputBuffer, data]);
		processInput();
	});

	child.stderr.on('data', (data) => {
		console.log(data.toString('utf-8'));
	});

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
		finishCommands: () => {
			child.stdin.write('EOF\n');
		},

		executeCommand: <Type extends keyof CompositorCommand>(
			command: Type,
			params: CompositorCommand[Type]
		) => {
			return new Promise<Buffer>((resolve) => {
				const nonce = makeNonce();
				const composed: CompositorCommandSerialized<Type> = {
					type: command,
					params: {
						...params,
						nonce,
					},
				};
				// TODO: Should have a way to error out a single task
				child.stdin.write(JSON.stringify(composed) + '\n');
				waiters.set(nonce, {
					resolve: (data: Buffer) => {
						resolve(data);
					},
				});
			});
		},
	};
};
