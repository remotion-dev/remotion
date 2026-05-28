import {Sandbox} from '@vercel/sandbox';
import type {RenderProgress} from './types';

const PROGRESS_FILE = '/vercel/sandbox/progress.json';

const isStoppedOrExpiredSandboxError = (error: unknown) => {
	if (typeof error === 'object' && error !== null && 'code' in error) {
		return error.code === 'sandbox_stopped';
	}

	if (!(error instanceof Error)) {
		return false;
	}

	return (
		error.message.includes('sandbox_stopped') ||
		error.message.includes('Sandbox has stopped execution') ||
		error.message.includes('no longer available')
	);
};

const getCommandError = async (
	command: Awaited<ReturnType<Sandbox['getCommand']>>,
) => {
	const stderr = await command.stderr().catch(() => '');
	const stdout = await command.stdout().catch(() => '');
	const output = [stderr, stdout].filter(Boolean).join(' ');

	return output || `Render command exited with code ${command.exitCode}.`;
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
		if (isStoppedOrExpiredSandboxError(err)) {
			return {stage: 'expired'};
		}

		return {
			stage: 'error',
			message: (err as Error).message,
			overallProgress: 1,
		};
	}

	let buffer: Buffer | null;
	try {
		buffer = await sandbox.readFileToBuffer({path: PROGRESS_FILE});
	} catch (err) {
		if (isStoppedOrExpiredSandboxError(err)) {
			return {stage: 'expired'};
		}

		return {
			stage: 'error',
			message: (err as Error).message,
			overallProgress: 1,
		};
	}

	if (!buffer) {
		if (command.exitCode === null) {
			return {stage: 'starting', overallProgress: 0};
		}

		const message = await getCommandError(command);
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
		return {stage: 'error', message, overallProgress: 1};
	}

	return progress;
}
