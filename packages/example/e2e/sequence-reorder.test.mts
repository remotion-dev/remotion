import {expect, test, type Page} from '@playwright/test';
import {STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

const effectDragError = 'Could not read effect drag data';

const dropOnTimelineRow = async ({
	page,
	title,
	data,
}: {
	readonly page: Page;
	readonly title: string;
	readonly data: Record<string, string>;
}) => {
	await page
		.locator(`[title="${title}"]`)
		.first()
		.evaluate((element, dropData) => {
			const timelineRow = element.parentElement?.parentElement?.parentElement;
			if (!timelineRow) {
				throw new Error('Could not find timeline row');
			}

			const dataTransfer = new DataTransfer();
			for (const [type, value] of Object.entries(dropData)) {
				dataTransfer.setData(type, value);
			}

			timelineRow.dispatchEvent(
				new DragEvent('drop', {
					bubbles: true,
					cancelable: true,
					dataTransfer,
				}),
			);
		}, data);
};

test.describe('sequence reorder', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('does not parse sequence reorder data as effect drag data', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/issue-8216`);
		await expect(page).toHaveURL(/issue-8216/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		await expect(page.locator('[title="Background"]').first()).toBeVisible({
			timeout: 15_000,
		});

		await dropOnTimelineRow({
			page,
			title: 'Background',
			data: {
				'text/plain': 'not effect drag data',
			},
		});
		await expect(page.getByText(effectDragError)).toBeHidden();

		await dropOnTimelineRow({
			page,
			title: 'Background',
			data: {
				'application/remotion-sequence-reorder': JSON.stringify({
					nodePath: {nodePath: [0]},
					nodePathKey: 'source',
					trackIndex: 0,
					parentId: null,
					fileName: 'Issue8216.tsx',
				}),
			},
		});

		await expect(page.getByText(effectDragError)).toBeHidden();
	});
});
