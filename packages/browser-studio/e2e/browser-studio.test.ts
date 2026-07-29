import {expect, test} from '@playwright/test';

test('loads the Browser Studio canvas without runtime errors', async ({
	page,
}) => {
	const pageErrors: Error[] = [];
	let rejectPageError: (error: Error) => void = () => undefined;
	const pageError = new Promise<never>((_resolve, reject) => {
		rejectPageError = reject;
	});
	page.on('pageerror', (error) => {
		pageErrors.push(error);
		rejectPageError(error);
	});

	await Promise.race([
		(async () => {
			await page.goto('/');
			const studio = page.frameLocator('iframe');
			await expect(
				studio.getByTitle('/project').getByText('MyComp'),
			).toBeVisible();
			await expect(
				studio.locator('.remotion-studio-composition-container'),
			).toBeVisible();
		})(),
		pageError,
	]);

	expect(pageErrors).toEqual([]);
});
