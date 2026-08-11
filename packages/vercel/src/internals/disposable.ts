import {Sandbox} from '@vercel/sandbox';
import type {VercelSandbox} from '../types';

export const createDisposableSandbox = async (
	options: Parameters<typeof Sandbox.create>[0],
): Promise<VercelSandbox> => {
	const sandbox = await Sandbox.create(options);
	return Object.assign(sandbox, {
		[Symbol.asyncDispose]: async () => {
			await sandbox.stop().catch(() => {});
		},
	});
};
