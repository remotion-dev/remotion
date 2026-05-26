import {Sandbox} from '@vercel/sandbox';
import type {RenderProgress} from './types';

const getCommandError = async (
	command: Awaited<ReturnType<Sandbox['getCommand']>>,
) => {
	const stderr = await command.stderr().catch(() => '');
	const stdout = await command.stdout().catch(() => '');
	const output = [stderr, stdout].filter(Boolean).join(' ');

	return output || `Render command exited with code ${command.exitCode}.`;
};

const stopSandboxOnTerminalProgress = async ({
	progress,
	sandbox,
}: {
	progress: RenderProgress;
	sandbox: Sandbox;
}) => {
	if (progress.stage === 'done' || progress.stage === 'error') {
		await sandbox.stop().catch(() => undefined);
	}
};

export async function getRenderProgress({
	sandboxId,
	cmdId,
}: {
	sandboxId: string;
	cmdId: string;
}): Promise<RenderProgress> {
	let sandbox: Sandbox;
	try {
		sandbox = await Sandbox.get({sandboxId});
	} catch {
		return {stage: 'expired'};
	}

	let command: Awaited<ReturnType<Sandbox['getCommand']>>;
	try {
		command = await sandbox.getCommand(cmdId);
	} catch (err) {
		return {
			stage: 'error',
			message: (err as Error).message,
			overallProgress: 1,
		};
	}

	const buffer = await sandbox.readFileToBuffer({path: 'progress.json'});

	if (!buffer) {
		if (command.exitCode === null) {
			return {stage: 'starting', overallProgress: 0};
		}

		const message = await getCommandError(command);
		await sandbox.stop().catch(() => undefined);
		return {stage: 'error', message, overallProgress: 1};
	}

	let progress: RenderProgress;
	try {
		progress = JSON.parse(buffer.toString('utf-8')) as RenderProgress;
	} catch {
		return {
			stage: 'error',
			message: 'Could not parse the render progress file.',
			overallProgress: 1,
		};
	}

	if (command.exitCode !== null && command.exitCode !== 0) {
		const message = await getCommandError(command);
		await sandbox.stop().catch(() => undefined);
		return {stage: 'error', message, overallProgress: 1};
	}

	await stopSandboxOnTerminalProgress({progress, sandbox});

	return progress;
}
