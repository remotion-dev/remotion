export type CommandResult = {
	command: string[];
	cwd: string;
	exitCode: number;
	stdout: string;
	stderr: string;
	durationMs: number;
};

export type CommandOutput = {
	chunk: string;
	stream: 'stderr' | 'stdout';
};

const collectStream = async ({
	onOutput,
	stream,
	streamName,
}: {
	onOutput?: (output: CommandOutput) => void;
	stream: ReadableStream<Uint8Array>;
	streamName: CommandOutput['stream'];
}) => {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let output = '';

	while (true) {
		const {done, value} = await reader.read();

		if (done) {
			break;
		}

		const chunk = decoder.decode(value, {stream: true});
		output += chunk;
		onOutput?.({chunk, stream: streamName});
	}

	const finalChunk = decoder.decode();
	if (finalChunk) {
		output += finalChunk;
		onOutput?.({chunk: finalChunk, stream: streamName});
	}

	return output;
};

export const runCommand = async ({
	command,
	cwd,
	env,
	onOutput,
	timeoutMs,
}: {
	command: string[];
	cwd: string;
	env?: Record<string, string | undefined>;
	onOutput?: (output: CommandOutput) => void;
	timeoutMs?: number;
}): Promise<CommandResult> => {
	const startedAt = Date.now();
	const subprocess = Bun.spawn(command, {
		cwd,
		env: {...process.env, ...env},
		stdout: 'pipe',
		stderr: 'pipe',
	});
	const timeout = timeoutMs
		? setTimeout(() => {
				subprocess.kill();
			}, timeoutMs)
		: null;

	const [stdout, stderr, exitCode] = await Promise.all([
		collectStream({
			onOutput,
			stream: subprocess.stdout,
			streamName: 'stdout',
		}),
		collectStream({
			onOutput,
			stream: subprocess.stderr,
			streamName: 'stderr',
		}),
		subprocess.exited,
	]);
	if (timeout) {
		clearTimeout(timeout);
	}

	return {
		command,
		cwd,
		exitCode,
		stdout,
		stderr,
		durationMs: Date.now() - startedAt,
	};
};

export const commandToString = (command: string[]) =>
	command
		.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
		.join(' ');
