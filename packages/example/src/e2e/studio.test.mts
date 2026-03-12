import {spawn, type ChildProcess} from 'child_process';
import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';

let studioProcess: ChildProcess | undefined;

const STUDIO_PORT = 3123;
const STUDIO_URL = `http://localhost:${STUDIO_PORT}`;

const exampleDir = path.resolve(
	// @ts-expect-error
	new URL('.', import.meta.url).pathname,
	'..',
);

const remotionBin = path.join(exampleDir, 'node_modules', '.bin', 'remotion');

const rootFile = path.join(exampleDir, 'src', 'Root.tsx');

async function waitForServer(
	url: string,
	timeoutMs: number = 30_000,
): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(url);
			if (res.ok) {
				return;
			}
		} catch {
			// Server not ready yet
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function navigateToSchemaTest(page: import('@playwright/test').Page) {
	await page.goto(STUDIO_URL);
	// Expand the "Schema" folder in the sidebar
	const schemaFolder = page.getByTitle('Schema');
	await schemaFolder.click({timeout: 15_000});
	// Click on the schema-test composition inside the folder
	const schemaTestLink = page.getByText('schema-test', {exact: true}).first();
	await schemaTestLink.click({timeout: 10_000});
	await expect(page).toHaveURL(/schema-test/, {timeout: 10_000});
}

let originalRootContent: string;

test.beforeAll(async () => {
	originalRootContent = fs.readFileSync(rootFile, 'utf-8');

	studioProcess = spawn(
		remotionBin,
		['studio', '--port', String(STUDIO_PORT), '--props', 'src/my-props.json'],
		{
			cwd: exampleDir,
			stdio: 'pipe',
			env: {
				...process.env,
				BROWSER: 'none',
			},
		},
	);

	studioProcess.stderr?.on('data', (data: Buffer) => {
		const msg = data.toString();
		if (!msg.includes('ExperimentalWarning')) {
			console.error('[studio stderr]', msg);
		}
	});

	studioProcess.stdout?.on('data', (data: Buffer) => {
		console.log('[studio stdout]', data.toString());
	});

	await waitForServer(STUDIO_URL);
});

test.afterAll(async () => {
	if (studioProcess) {
		studioProcess.kill('SIGTERM');
		studioProcess = undefined;
	}

	// Restore original file content
	fs.writeFileSync(rootFile, originalRootContent);
});

test.describe('Remotion Studio', () => {
	test('should load the studio', async ({page}) => {
		await page.goto(STUDIO_URL);
		await expect(page).toHaveTitle(/Remotion/i, {timeout: 15_000});
	});

	test('should show the composition list', async ({page}) => {
		await page.goto(STUDIO_URL);
		// The Schema folder should be visible in the sidebar
		await expect(page.getByRole('button', {name: 'Schema'})).toBeVisible({
			timeout: 15_000,
		});
	});

	test('should navigate to schema-test composition', async ({page}) => {
		await navigateToSchemaTest(page);
	});

	test('should edit a prop and update source code', async ({page}) => {
		// Expand the right sidebar
		await page.goto(STUDIO_URL);
		await page.evaluate(() => {
			window.localStorage.setItem(
				'remotion.sidebarRightCollapsing',
				'expanded',
			);
		});
		await page.reload();

		await navigateToSchemaTest(page);

		// Wait for the props editor to load - use the text input, not the nullable checkbox
		const titleInput = page
			.locator(
				'input[name="title"][type="text"], input[name="title"]:not([type="checkbox"])',
			)
			.first();
		await expect(titleInput).toBeVisible({timeout: 15_000});

		// Clear and type a new value
		const newTitle = 'e2e-test-title';
		await titleInput.fill(newTitle);

		// Blur the input to trigger save to file
		await titleInput.blur();

		// Wait for the file to be updated
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(rootFile, 'utf-8');
					return content.includes(newTitle);
				},
				{
					message: `Expected Root.tsx to contain "${newTitle}" after prop edit`,
					timeout: 10_000,
				},
			)
			.toBe(true);

		// Verify the old value is no longer in the file
		const updatedContent = fs.readFileSync(rootFile, 'utf-8');
		expect(updatedContent).not.toContain("title: 'sdasds'");
		expect(updatedContent).toContain(newTitle);
	});
});
