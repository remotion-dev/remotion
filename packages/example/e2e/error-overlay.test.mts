import fs from 'fs';
import {expect, test} from '@playwright/test';
import {errorOverlayE2eFile, STUDIO_URL} from './constants.mts';
import {readStudioLogs, stripAnsi} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

/**
 * Regression test for https://github.com/remotion-dev/remotion/issues/7447
 *
 * Removing the `radius: 24` argument from `blur({radius: 24})` causes the
 * `<Solid>` component to throw a `TypeError` during render. The studio's
 * `CompositionErrorBoundary` catches it and shows the error UI inside the
 * canvas area. Adding the argument back should dismiss the error once HMR
 * applies the fix — and removing it again should bring the error back.
 *
 * Before the fix, the error UI never dismissed without a full page reload:
 * `CompositionErrorBoundary` set `hasError: true` on catch, returned `null`
 * forever, and never reset that flag, so the boundary's children were never
 * re-rendered after the fix arrived.
 */
test.describe('error overlay dismissal', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('error overlay remains useful without symbolication and recovers across HMR cycles', async ({
		context,
		page,
	}) => {
		const originalContent = fs.readFileSync(errorOverlayE2eFile, 'utf-8');
		expect(originalContent).toContain('blur({radius: 24})');
		// Make sure the marker only appears once so the swap is unambiguous.
		expect(originalContent.split('blur({radius: 24})')).toHaveLength(2);

		const buggyContent = originalContent.replace(
			'blur({radius: 24})',
			'blur({})',
		);
		expect(buggyContent).not.toBe(originalContent);

		const errorMessage = page.getByText('"radius" must be a finite number');
		const openInEditorRequests: unknown[] = [];
		const openInCodingAgentRequests: unknown[] = [];
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: 'zed',
						installedEditors: [
							{id: 'zed', name: 'Zed', nameWithType: 'Zed'},
							{id: 'vscode', name: 'Code', nameWithType: 'VS Code'},
						],
					},
				},
			});
		});
		await page.route('**/api/default-coding-agent-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultCodingAgent: 'codex',
						installedCodingAgents: [
							{id: 'codex', name: 'Codex', nameWithType: 'Codex'},
							{
								id: 'claude-code',
								name: 'Claude',
								nameWithType: 'Claude Code',
							},
						],
						installedGitClients: [],
						installedTerminals: [],
					},
				},
			});
		});
		await page.route('**/api/open-in-coding-agent', async (route) => {
			openInCodingAgentRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});
		await page.route('**/api/open-in-editor', async (route) => {
			openInEditorRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		const writeAndWaitForRebuild = async (
			content: string,
			label: string,
		): Promise<void> => {
			const logCountBefore = readStudioLogs().length;
			fs.writeFileSync(errorOverlayE2eFile, content);
			await expect
				.poll(
					() => {
						const newLogs = readStudioLogs()
							.slice(logCountBefore)
							.map(stripAnsi);
						return newLogs.some((log) => log.includes('Built in'));
					},
					{
						message: `Expected webpack to rebuild after ${label}`,
						timeout: 30_000,
					},
				)
				.toBe(true);
		};

		await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
			origin: STUDIO_URL,
		});
		await page.addInitScript(() => {
			Object.defineProperty(window.navigator, 'platform', {value: 'Win32'});
			type RegisteredTool = {
				readonly name: string;
				readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
			};
			const tools = new Map<string, RegisteredTool>();
			Object.defineProperty(window, '__remotion_webmcp_tools', {
				value: tools,
			});
			Object.defineProperty(document, 'modelContext', {
				value: {
					registerTool: async (
						tool: RegisteredTool,
						options: {readonly signal: AbortSignal},
					) => {
						tools.set(tool.name, tool);
						options.signal.addEventListener('abort', () => {
							if (tools.get(tool.name) === tool) {
								tools.delete(tool.name);
							}
						});
					},
				},
			});
		});
		const getCurrentError = () => {
			return page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_current_error');
				return tool ? tool.execute() : 'not-registered';
			});
		};
		await page.goto(`${STUDIO_URL}/error-overlay-unsymbolicated-e2e`);
		await expect(page.getByText('Expected defaults').first()).toBeVisible({
			timeout: 15_000,
		});
		await expect(
			page.getByText('Could not symbolicate the stack trace: Failed to fetch'),
		).toBeVisible();
		await expect(page.getByRole('button', {name: 'Copy stack'})).toBeVisible();
		await expect(
			page.getByRole('button', {
				name: 'Search Issues Ctrl+G',
			}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {
				name: 'Ask on Discord Ctrl+D',
			}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Fix with Codex', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {
				name: 'Fix with another coding agent',
			}),
		).toBeVisible();
		for (const buttonName of [
			'Copy stack',
			'Search Issues Ctrl+G',
			'Ask on Discord Ctrl+D',
			'Fix with Codex',
		]) {
			const button = page.getByRole('button', {name: buttonName});
			await expect(button).toHaveCSS('border-style', 'none');
			await expect(button).toHaveCSS('cursor', 'default');
		}
		await expect(
			page.getByRole('button', {name: 'Retry', exact: true}),
		).toHaveCount(0);
		const errorMessageBounds = await page
			.getByText('Expected defaults', {exact: true})
			.first()
			.boundingBox();
		const fixWithAgentButton = page.getByRole('button', {
			name: 'Fix with Codex',
			exact: true,
		});
		const fixWithAgentButtonBounds = await fixWithAgentButton.boundingBox();
		const copyButton = page.getByRole('button', {name: 'Copy stack'});
		const copyButtonBounds = await copyButton.boundingBox();
		const fixWithAgentIconLeft = await fixWithAgentButton
			.locator('img')
			.evaluate((element) => element.getBoundingClientRect().left);
		const actionTypography = await Promise.all(
			[fixWithAgentButton, copyButton].map((button) =>
				button.evaluate((element) => {
					const style = window.getComputedStyle(element);
					return {fontFamily: style.fontFamily, fontSize: style.fontSize};
				}),
			),
		);
		if (!errorMessageBounds || !fixWithAgentButtonBounds || !copyButtonBounds) {
			throw new Error(
				'Expected the error message and action row to be visible',
			);
		}

		expect(actionTypography[0]).toEqual(actionTypography[1]);
		expect(
			Math.abs(fixWithAgentButtonBounds.y - copyButtonBounds.y),
		).toBeLessThan(1);
		expect(
			Math.abs(fixWithAgentButtonBounds.height - copyButtonBounds.height),
		).toBeLessThan(1);
		expect(Math.abs(fixWithAgentIconLeft - errorMessageBounds.x)).toBeLessThan(
			1,
		);
		expect(
			fixWithAgentButtonBounds.y -
				(errorMessageBounds.y + errorMessageBounds.height),
		).toBeLessThan(16);
		await page
			.getByRole('button', {name: 'Fix with Codex', exact: true})
			.click();
		await expect
			.poll(() => openInCodingAgentRequests)
			.toEqual([
				expect.objectContaining({
					codingAgentId: 'codex',
					prompt: expect.stringMatching(
						/TypeError: Expected defaults[\s\S]*webpack-internal:\/\/\/cannot-symbolicate\.js/,
					),
				}),
			]);

		const macPage = await context.newPage();
		await macPage.addInitScript(() => {
			Object.defineProperty(window.navigator, 'platform', {value: 'MacIntel'});
		});
		await macPage.goto(`${STUDIO_URL}/error-overlay-unsymbolicated-e2e`);
		await expect(
			macPage.getByRole('button', {name: 'Search Issues ⌘G'}),
		).toBeVisible();
		await expect(
			macPage.getByRole('button', {name: 'Ask on Discord ⌘D'}),
		).toBeVisible();
		await macPage.close();

		const rawStack = page.getByLabel('Unsymbolicated stack trace');
		await expect(rawStack).toContainText(
			'webpack-internal:///cannot-symbolicate.js',
		);
		await expect
			.poll(() =>
				page.evaluate(
					() =>
						document.documentElement.scrollWidth ===
						document.documentElement.clientWidth,
				),
			)
			.toBe(true);
		expect(
			await rawStack.evaluate(
				(element) => element.scrollWidth > element.clientWidth,
			),
		).toBe(true);
		await expect.poll(getCurrentError).toEqual({
			name: 'TypeError',
			message: 'Expected defaults',
			stack: expect.stringContaining(
				'webpack-internal:///cannot-symbolicate.js',
			),
			symbolicatedStackFrames: null,
		});

		await page.getByRole('button', {name: 'Copy stack'}).click();
		await expect(page.getByRole('button', {name: 'Copied!'})).toBeVisible();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
			'webpack-internal:///cannot-symbolicate.js',
		);

		await page.goto(`${STUDIO_URL}/error-overlay-e2e`);
		await expect(page).toHaveURL(/error-overlay-e2e/, {timeout: 15_000});

		// Sanity check: no error visible initially.
		await expect(errorMessage).toHaveCount(0);
		await expect.poll(getCurrentError).toBe(null);

		// 1. Introduce the bug: remove the `radius: 24` argument.
		await writeAndWaitForRebuild(buggyContent, 'introducing the bug');
		await expect(errorMessage).toBeVisible({timeout: 15_000});
		await expect(
			page.getByText('ErrorOverlayRepro', {exact: true}),
		).toBeVisible();
		await expect.poll(getCurrentError).toEqual({
			name: 'TypeError',
			message: '"radius" must be a finite number, but got undefined',
			stack: expect.any(String),
			symbolicatedStackFrames: expect.arrayContaining([
				expect.objectContaining({
					originalFunctionName: 'ErrorOverlayRepro',
					originalFileName: expect.stringContaining(
						'src/ErrorOverlayE2e/ErrorOverlayRepro.tsx',
					),
				}),
			]),
		});
		await expect(
			page.getByText('react_stack_bottom_frame', {exact: true}),
		).toHaveCount(0);
		await page.getByRole('button', {name: 'Copy stack'}).click();
		const copiedSymbolicatedStack = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(copiedSymbolicatedStack).toContain('ErrorOverlayRepro');
		expect(copiedSymbolicatedStack).not.toContain('react_stack_bottom_frame');
		const openInEditorButtonBounds = await page
			.locator('#error-overlay-open-in-editor')
			.boundingBox();
		const symbolicatedFixButtonBounds = await page
			.getByRole('button', {name: 'Fix with Codex', exact: true})
			.boundingBox();
		const symbolicatedCopyButtonBounds = await page
			.getByRole('button', {name: 'Copy stack'})
			.boundingBox();
		if (
			!openInEditorButtonBounds ||
			!symbolicatedFixButtonBounds ||
			!symbolicatedCopyButtonBounds
		) {
			throw new Error('Expected the symbolicated error actions to be visible');
		}

		expect(
			Math.abs(openInEditorButtonBounds.y - symbolicatedFixButtonBounds.y),
		).toBeLessThan(1);
		expect(
			Math.abs(openInEditorButtonBounds.y - symbolicatedCopyButtonBounds.y),
		).toBeLessThan(1);
		await page.locator('#error-overlay-open-in-editor').click();
		await expect
			.poll(() => openInEditorRequests)
			.toEqual([expect.objectContaining({editorId: 'zed'})]);
		const openInAnotherApp = page.locator('#error-overlay-open-in-another-app');
		await openInAnotherApp.click();
		await expect(
			page.getByRole('button', {name: 'VS Code', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {
				name: 'Configure default apps...',
				exact: true,
			}),
		).toBeVisible();
		await page.getByRole('button', {name: 'VS Code', exact: true}).click();
		await expect
			.poll(() => openInEditorRequests)
			.toEqual([
				expect.objectContaining({editorId: 'zed'}),
				expect.objectContaining({editorId: 'vscode'}),
			]);
		await openInAnotherApp.click();
		await page
			.getByRole('button', {
				name: 'Configure default apps...',
				exact: true,
			})
			.click();
		await expect(page.getByText('Default editor', {exact: true})).toBeVisible();
		await page.keyboard.press('Escape');

		// 2. Fix the bug: restore the `radius: 24` argument. The error UI should
		//    dismiss once HMR applies the fix.
		await writeAndWaitForRebuild(originalContent, 'fixing the bug');
		await expect(errorMessage).toHaveCount(0, {timeout: 15_000});
		await expect.poll(getCurrentError).toBe(null);

		// 3. Re-introduce the bug: the error UI should come back. This guards
		//    against the boundary getting permanently stuck in the success state
		//    after the first reset.
		await writeAndWaitForRebuild(buggyContent, 're-introducing the bug');
		await expect(errorMessage).toBeVisible({timeout: 15_000});

		await writeAndWaitForRebuild(originalContent, 'restoring after the test');
		await expect(errorMessage).toHaveCount(0, {timeout: 15_000});
	});
});
