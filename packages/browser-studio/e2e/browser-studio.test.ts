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

test('clears hover backgrounds even if pointer leave events are lost', async ({
	page,
}) => {
	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await studio.locator('[data-compname="MyComp"]').click();
	await studio.locator('[data-sidebar-toggle="right"]').click();

	const addSolid = studio.getByRole('button', {name: 'Add Solid'});
	await expect(addSolid).toBeVisible();

	const getBackgroundColor = (locator: ReturnType<typeof studio.locator>) =>
		locator.evaluate(
			(element) => window.getComputedStyle(element).backgroundColor,
		);

	await addSolid.hover();
	await expect
		.poll(() => getBackgroundColor(addSolid))
		.toBe('rgba(255, 255, 255, 0.06)');

	// Browsers can fail to deliver pointer leave events when the pointer
	// exits the Studio <iframe>. Simulate this by suppressing them before
	// they reach the app: https://github.com/remotion-dev/remotion/issues/9886
	await studio.locator('body').evaluate((body) => {
		const win = body.ownerDocument.defaultView as Window;
		for (const type of [
			'pointerout',
			'pointerleave',
			'mouseout',
			'mouseleave',
		]) {
			win.addEventListener(type, (e) => e.stopImmediatePropagation(), {
				capture: true,
			});
		}
	});

	const neutralArea = studio.locator('.remotion-studio-composition-container');

	await neutralArea.hover();
	await expect
		.poll(() => getBackgroundColor(addSolid))
		.toBe('rgba(0, 0, 0, 0)');

	// Menubar items must reset as well
	const fileMenu = studio.getByRole('button', {name: 'File', exact: true});
	await fileMenu.hover();
	await expect
		.poll(() => getBackgroundColor(fileMenu))
		.toBe('rgba(255, 255, 255, 0.06)');

	await neutralArea.hover();
	await expect
		.poll(() => getBackgroundColor(fileMenu))
		.toBe('rgba(0, 0, 0, 0)');
});
