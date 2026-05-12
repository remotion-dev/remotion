import type {Sandbox} from '@vercel/sandbox';
import {script as renderStillScript} from './generated/render-still-script';
import {script as renderVideoScript} from './generated/render-video-script';
import {script as uploadBlobScript} from './generated/upload-blob-script';
import {createDisposableSandbox} from './internals/disposable';
import {installBrowser} from './internals/install-browser';
import {installJsDependencies} from './internals/install-js-dependencies';
import {installSystemDependencies} from './internals/install-system-dependencies';
import {patchCompositor} from './internals/patch-compositor';
import type {CreateSandboxOnProgress, VercelSandbox} from './types';

type CreateSandboxResources = NonNullable<
	NonNullable<Parameters<typeof Sandbox.create>[0]>['resources']
>;

export const SANDBOX_CREATING_TIMEOUT = 5 * 60 * 1000;

export async function createSandbox({
	onProgress,
	resources = {vcpus: 4},
	timeoutInMilliseconds = SANDBOX_CREATING_TIMEOUT,
}: {
	onProgress?: CreateSandboxOnProgress;
	resources?: CreateSandboxResources;
	timeoutInMilliseconds?: number;
} = {}): Promise<VercelSandbox> {
	const report = async (progress: number, message: string) => {
		await onProgress?.({progress, message});
	};

	const sandbox = await createDisposableSandbox({
		runtime: 'node24',
		resources,
		timeout: timeoutInMilliseconds,
	});

	// Preparation has 2 stages with weights:
	// - System dependencies: 75%
	// - Downloading browser: 25%
	const WEIGHT_SYS_DEPS = 0.75;
	const WEIGHT_BROWSER = 0.25;

	await report(0, 'Installing system dependencies...');

	// Stage 1: Install system dependencies (75%)
	await installSystemDependencies({
		sandbox,
		onProgress: async (stageProgress: number) => {
			await report(
				stageProgress * WEIGHT_SYS_DEPS,
				'Installing system dependencies...',
			);
		},
	});

	await report(WEIGHT_SYS_DEPS, 'Installing JS dependencies...');

	// Install renderer and blob SDK
	await installJsDependencies({sandbox});

	// Patch compositor binary for glibc 2.34 compatibility (Amazon Linux 2023)
	await patchCompositor({sandbox});

	// Stage 2: Download browser (25%)
	await report(WEIGHT_SYS_DEPS, 'Downloading browser...');
	await installBrowser({
		sandbox,
		onProgress: async (browserProgress: number) => {
			await report(
				WEIGHT_SYS_DEPS + browserProgress * WEIGHT_BROWSER,
				'Downloading browser...',
			);
		},
	});

	// Write package.json and scripts so they're ready to use
	await sandbox.writeFiles([
		{
			path: 'package.json',
			content: Buffer.from(JSON.stringify({type: 'module'})),
		},
		{
			path: 'render-video.mjs',
			content: Buffer.from(renderVideoScript),
		},
		{
			path: 'render-still.mjs',
			content: Buffer.from(renderStillScript),
		},
		{
			path: 'upload-blob.mjs',
			content: Buffer.from(uploadBlobScript),
		},
	]);

	await report(1, 'Sandbox ready');

	return sandbox;
}
