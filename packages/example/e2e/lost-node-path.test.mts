import {expect, test} from '@playwright/test';
import fs from 'fs';
import {EXPANDED_SIDEBAR_STATE, lostNodePathE2eFile} from './constants.mts';
import {
	navigateToLostNodePathE2e,
	readStudioLogs,
	stripAnsi,
} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

const getSequenceLine = (content: string): number => {
	const lineIndex = content
		.split('\n')
		.findIndex((line) => line.trim().startsWith('<Sequence'));
	expect(lineIndex).toBeGreaterThan(-1);
	return lineIndex + 1;
};

const applyIssue7393Refactor = (content: string): string => {
	if (content.includes('const t = tint')) {
		return content;
	}

	return content
		.replace(
			'\tconst memoizedEffects = Internals.useMemoizedEffectDefinitions([',
			"\tconst t = tint({color: 'green', amount: 1});\n\tconst memoizedEffects = Internals.useMemoizedEffectDefinitions([",
		)
		.replace("\t\ttint({color: 'green', amount: 1}),", '\t\tt,');
};

const stackAttribution = (line: number) => `LostNodePathRepro.tsx:${line}`;
const expandTintSectionName = /^Expand (?:Tint|tint\(\)) section$/;
const collapseTintSectionName = /^Collapse (?:Tint|tint\(\)) section$/;

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('lost node path recovery', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('recovers stack location and preserves expanded timeline state after refactor', async ({
		page,
	}) => {
		const originalContent = fs.readFileSync(lostNodePathE2eFile, 'utf-8');
		const initialLine = getSequenceLine(originalContent);
		const refactoredContent = applyIssue7393Refactor(originalContent);
		const refactoredLine = getSequenceLine(refactoredContent);
		expect(refactoredLine).toBeGreaterThan(initialLine);

		await navigateToLostNodePathE2e(page);

		await expect(
			page.getByText(stackAttribution(initialLine), {exact: true}),
		).toBeVisible({timeout: 30_000});

		const expandTrack = page.getByRole('button', {
			name: 'Expand track properties',
		});
		await expect(expandTrack).toBeVisible({timeout: 10_000});
		await expandTrack.click();

		const expandEffects = page.getByRole('button', {
			name: 'Expand Effects section',
		});
		await expect(expandEffects).toBeVisible({timeout: 10_000});
		await expandEffects.click();

		const expandTint = page.getByRole('button', {
			name: expandTintSectionName,
		});
		await expect(expandTint).toBeVisible({timeout: 10_000});
		await expandTint.click();

		await expect(
			page.getByRole('button', {name: 'Collapse track properties'}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Collapse Effects section'}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: collapseTintSectionName}),
		).toBeVisible();

		const logCountBefore = readStudioLogs().length;
		fs.writeFileSync(lostNodePathE2eFile, refactoredContent);

		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs().slice(logCountBefore).map(stripAnsi);
					return newLogs.some((log) => log.includes('Built in'));
				},
				{
					message:
						'Expected webpack to rebuild after LostNodePathRepro.tsx refactor',
					timeout: 30_000,
				},
			)
			.toBe(true);

		await expect
			.poll(
				async () =>
					page
						.getByText(stackAttribution(refactoredLine), {exact: true})
						.isVisible(),
				{
					message: `Expected timeline stack to update to ${stackAttribution(refactoredLine)}`,
					timeout: 30_000,
				},
			)
			.toBe(true);

		await expect(
			page.getByText(stackAttribution(initialLine), {exact: true}),
		).toHaveCount(0);

		await expect(
			page.getByRole('button', {name: 'Collapse track properties'}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Collapse Effects section'}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: collapseTintSectionName}),
		).toBeVisible();
	});
});
