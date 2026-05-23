import {expect, test} from '@playwright/test';
import fs from 'fs';
import {hookOrderChangeE2eFile, STUDIO_URL} from './constants.mts';
import {readStudioLogs, stripAnsi} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.describe('hook order refresh', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('reloads the Studio when a component gains a second hook', async ({
		page,
	}) => {
		const originalContent = fs.readFileSync(hookOrderChangeE2eFile, 'utf-8');
		expect(originalContent).toContain('one hook');
		expect(originalContent).not.toContain('React.useState(false)');

		const updatedContent = originalContent.replace(
			'\tconst frame = useCurrentFrame();\n\n\treturn <div data-frame={frame}>one hook</div>;\n',
			`\tconst frame = useCurrentFrame();\n\tReact.useState(false);\n\n\treturn <div data-frame={frame}>two hooks</div>;\n`,
		);
		expect(updatedContent).not.toBe(originalContent);

		await page.goto(`${STUDIO_URL}/hook-order-change-e2e`);
		await expect(page).toHaveURL(/hook-order-change-e2e/, {timeout: 15_000});
		await expect(page.getByText('one hook')).toBeVisible({timeout: 15_000});

		const logCountBefore = readStudioLogs().length;
		fs.writeFileSync(hookOrderChangeE2eFile, updatedContent);

		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs().slice(logCountBefore).map(stripAnsi);
					return newLogs.some((log) => log.includes('Built in'));
				},
				{
					message: 'Expected webpack to rebuild after adding a second hook',
					timeout: 30_000,
				},
			)
			.toBe(true);

		await expect(page.getByText('two hooks')).toBeVisible({timeout: 30_000});
		await expect(page.getByText('one hook')).toHaveCount(0);
	});
});
