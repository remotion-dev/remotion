import {readFileSync, writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {exampleDir, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('cancels downloading AI jobs, starts the next job, and allows retrying and clearing them', async ({
	page,
}) => {
	test.setTimeout(120_000);
	page.setDefaultTimeout(10_000);
	const packageJsonPath = path.join(exampleDir, 'package.json');
	const packageJsonBefore = readFileSync(packageJsonPath, 'utf8');
	const downloads: string[] = [];
	const abortedDownloads: string[] = [];
	// Serve model metadata, but keep weights streaming until cancellation. This
	// exercises the real package downloads without downloading or running models.
	const modelServer = createServer((request, response) => {
		const url = request.url ?? '';
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
		if (url.includes('.onnx')) {
			response.setHeader('Content-Length', 1_000_000);
			response.setHeader('Content-Type', 'application/octet-stream');
			if (request.method === 'HEAD') {
				response.end();
				return;
			}

			downloads.push(url);
			response.write(Buffer.alloc(1024));
			response.once('close', () => abortedDownloads.push(url));
			return;
		}

		response.setHeader('Content-Type', 'application/json');
		response.end(
			JSON.stringify({
				model_type: url.includes('whisper') ? 'whisper' : 'modnet',
			}),
		);
	});
	await new Promise<void>((resolve) =>
		modelServer.listen(0, '127.0.0.1', resolve),
	);
	const address = modelServer.address();
	if (!address || typeof address === 'string') throw new Error('No model port');
	try {
		const packageJson = JSON.parse(packageJsonBefore);
		packageJson.dependencies['@remotion/whisper-webgpu'] = 'workspace:*';
		packageJson.dependencies['@remotion/video-matting'] = 'workspace:*';
		writeFileSync(packageJsonPath, JSON.stringify(packageJson));
		await startStudio();
		await page.route('https://remotion.media/models/**', (route) => {
			return route.fulfill({
				status: 302,
				headers: {
					'Access-Control-Allow-Origin': '*',
					Location: `http://127.0.0.1:${address.port}${new URL(route.request().url()).pathname}`,
				},
			});
		});
		await page.addInitScript(() => {
			// Only the capability probe needs a GPU: cancellation happens while the
			// real model downloader is waiting for the remote weights.
			Object.defineProperty(navigator, 'gpu', {
				value: {requestAdapter: async () => ({features: new Set()})},
			});
			type Tool = {
				name: string;
				execute: (input: Record<string, unknown>) => Promise<unknown>;
			};
			const tools = new Map<string, Tool>();
			Object.defineProperty(window, '__remotion_webmcp_tools', {value: tools});
			Object.defineProperty(document, 'modelContext', {
				value: {
					registerTool: (tool: Tool, options: {signal: AbortSignal}) => {
						tools.set(tool.name, tool);
						options.signal.addEventListener('abort', () => {
							if (tools.get(tool.name) === tool) tools.delete(tool.name);
						});
						return Promise.resolve();
					},
				},
			});
			localStorage.setItem('remotion.sidebarRightCollapsing', 'expanded');
		});
		await page.goto(STUDIO_URL);
		await page.getByText('Jobs', {exact: true}).click();
		const enqueue = async (name: string, model: string) => {
			await expect
				.poll(() =>
					page.evaluate((toolName) => {
						return (
							window as typeof window & {
								__remotion_webmcp_tools: Map<string, unknown>;
							}
						).__remotion_webmcp_tools.has(toolName);
					}, name),
				)
				.toBe(true);
			const result = await page.evaluate(
				async ({name: toolName, model: modelName}) => {
					const tool = (
						window as typeof window & {
							__remotion_webmcp_tools: Map<
								string,
								{execute: (input: Record<string, unknown>) => Promise<unknown>}
							>;
						}
					).__remotion_webmcp_tools.get(toolName);
					if (!tool) throw new Error('Tool not registered');
					return tool.execute({assetPath: 'framer.webm', model: modelName});
				},
				{name, model},
			);
			expect(result, JSON.stringify(result)).toMatchObject({success: true});
			return page.locator(
				`[data-render-queue-item="${(result as {jobId: string}).jobId}"]`,
			);
		};

		const transcription = await enqueue('transcribe_asset', 'tiny.en');
		await expect(
			transcription.getByText('Downloading tiny.en 0%'),
		).toBeVisible();
		await expect.poll(() => downloads).toHaveLength(1);
		const matting = await enqueue('separate_video_layers', 'modnet');
		await expect(matting.getByText('Queued for video matting')).toBeVisible();

		await transcription
			.getByRole('button', {name: 'Cancel transcription'})
			.click();
		await expect(transcription.getByText('Cancelled')).toBeVisible();
		await expect.poll(() => abortedDownloads).toHaveLength(1);
		await expect(matting.getByText('Downloading modnet 0%')).toBeVisible();
		await expect.poll(() => downloads).toHaveLength(2);
		await matting.getByRole('button', {name: 'Cancel video matting'}).click();
		await expect(matting.getByText('Cancelled')).toBeVisible();
		await expect.poll(() => abortedDownloads).toHaveLength(2);

		await transcription.getByRole('button', {name: 'Retry'}).click();
		await expect(
			page.getByText('Transcribe framer.webm', {exact: true}),
		).toBeVisible();
		await page.keyboard.press('Escape');
		await matting.getByRole('button', {name: 'Retry'}).click();
		await expect(
			page.getByText('Track matting framer.webm', {exact: true}),
		).toBeVisible();
		await page.keyboard.press('Escape');
		for (const job of [transcription, matting]) {
			await job.getByRole('button', {name: 'Clear', exact: true}).click();
		}

		await expect(
			page.getByText(
				'Renders, transcriptions and video matting jobs will show up here.',
			),
		).toBeVisible();
	} finally {
		writeFileSync(packageJsonPath, packageJsonBefore);
		await stopStudio();
		modelServer.closeAllConnections();
		await new Promise<void>((resolve) => modelServer.close(() => resolve()));
	}
});
