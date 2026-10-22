import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {e2eEntryPoint, exampleDir, remotionBin} from './constants.mts';

test('WebMCP records React Scan and controls the Studio lifecycle', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const portServer = createServer();
	await new Promise<void>((resolve) =>
		portServer.listen(0, '127.0.0.1', resolve),
	);
	const address = portServer.address();
	if (!address || typeof address === 'string') throw new Error('No test port');
	await new Promise<void>((resolve) => portServer.close(() => resolve()));
	const studioUrl = `http://localhost:${address.port}`;
	const studio = spawn(
		remotionBin,
		[
			'studio',
			e2eEntryPoint,
			'--port',
			String(address.port),
			'--no-open',
			'--force-new',
		],
		{
			cwd: exampleDir,
			env: {
				...process.env,
				REMOTION_REACT_SCAN_ENTRY_POINT: path.resolve(
					exampleDir,
					'../.monorepo/react-scan/client.ts',
				),
			},
			stdio: 'pipe',
		},
	);
	let logs = '';
	studio.stdout.on('data', (data: Buffer) => {
		logs += data.toString();
	});
	studio.stderr.on('data', (data: Buffer) => {
		logs += data.toString();
	});
	const exited = new Promise<number | null>((resolve) =>
		studio.once('exit', resolve),
	);
	try {
		await expect.poll(() => logs, {timeout: 60000}).toContain('Built in');
		await page.addInitScript(() => {
			type Tool = {
				name: string;
				annotations: {readOnlyHint: boolean};
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
		});
		await page.goto(studioUrl);
		const runTool = async (
			name: string,
			input: Record<string, unknown> = {},
		) => {
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
			return page.evaluate(
				async ({input, name: toolName}) => {
					const tool = (
						window as typeof window & {
							__remotion_webmcp_tools: Map<
								string,
								{
									annotations: {readOnlyHint: boolean};
									execute: (input: Record<string, unknown>) => Promise<unknown>;
								}
							>;
						}
					).__remotion_webmcp_tools.get(toolName);
					if (!tool) throw new Error('Tool not registered');
					return {
						readOnly: tool.annotations.readOnlyHint,
						result: await tool.execute(input),
					};
				},
				{input, name},
			);
		};
		expect(await runTool('start_react_scan_recording')).toMatchObject({
			readOnly: false,
			result: {recording: true},
		});
		await runTool('select_composition', {
			compositionName: 'AnimatedBarChart',
		});
		await runTool('select_composition', {
			compositionName: 'schema-test',
		});
		await page.waitForTimeout(100);
		const stoppedRecording = await runTool('stop_react_scan_recording');
		expect(stoppedRecording).toMatchObject({
			readOnly: false,
			result: {recording: false},
		});
		expect(
			(stoppedRecording.result as {eventCount: number}).eventCount,
		).toBeGreaterThan(0);
		const recording = await runTool('get_react_scan_recording');
		expect(recording.readOnly).toBe(true);
		expect(
			(recording.result as {summary: {commitCount: number}}).summary
				.commitCount,
		).toBeGreaterThan(0);
		expect(
			(recording.result as {events: Array<{kind: string}>}).events.some(
				(event) => event.kind === 'commit',
			),
		).toBe(true);
		expect(await runTool('restart_studio')).toEqual({
			readOnly: false,
			result: {},
		});
		await expect.poll(() => logs).toContain('Restarting server...');
		await expect
			.poll(() => logs.split('Built in').length, {timeout: 60000})
			.toBeGreaterThanOrEqual(3);
		await page.reload();
		expect(await runTool('shut_down_studio')).toEqual({
			readOnly: false,
			result: {},
		});
		expect(await exited).toBe(0);
		expect(logs).toContain('Shutting down Studio...');
	} finally {
		if (studio.exitCode === null) studio.kill('SIGTERM');
		await exited;
	}
});
