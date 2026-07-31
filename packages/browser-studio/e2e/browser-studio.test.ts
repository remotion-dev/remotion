import {expect, test} from '@playwright/test';

test('loads the Browser Studio canvas and enables Visual Mode', async ({
	page,
}) => {
	const pageErrors: Error[] = [];
	const updateAvailableRequests: string[] = [];
	let rejectPageError: (error: Error) => void = () => undefined;
	const pageError = new Promise<never>((_resolve, reject) => {
		rejectPageError = reject;
	});
	page.on('request', (request) => {
		if (new URL(request.url()).pathname === '/api/update-available') {
			updateAvailableRequests.push(request.url());
		}
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

			await studio.locator('[data-compname="MyComp"]').click();
			await studio.locator('[data-sidebar-toggle="right"]').click();
			await expect(
				studio.getByRole('button', {name: 'Inspector'}),
			).toBeVisible();
			await studio.getByRole('button', {name: 'Add Solid'}).click();
			await expect(studio.getByText('<Solid>', {exact: true})).toBeVisible();
			await expect(studio.locator('svg[viewBox="0 0 24 16"]')).toBeVisible();
		})(),
		pageError,
	]);

	expect(pageErrors).toEqual([]);
	expect(updateAvailableRequests).toEqual([]);
});
