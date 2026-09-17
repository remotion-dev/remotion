import {expect, test} from '@playwright/test';
import {VERSION} from 'remotion/version';

test('compiles a virtual root, plays its composition, imports a dependency and recovers from errors', async ({
	page,
}) => {
	const pageErrors: string[] = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));

	await page.goto('/');
	await page
		.getByRole('link', {name: 'Browser-compiled Player', exact: true})
		.click();
	const composition = page.getByRole('region', {name: 'Compiled composition'});
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByText('Frame 0 of 138', {exact: true}),
	).toBeVisible();

	await composition
		.getByRole('button', {name: 'Play video', exact: true})
		.click();
	await expect(composition.getByText(/^Frame \d+ of 138$/)).not.toHaveText(
		'Frame 0 of 138',
	);
	await composition
		.getByRole('button', {name: 'Pause video', exact: true})
		.click();

	const editor = page.getByRole('textbox', {name: 'Video.tsx source'});
	const original = await editor.inputValue();
	const dependencyRequest = page.waitForRequest((request) => {
		const url = new URL(request.url());
		return (
			url.hostname === 'esm.sh' &&
			url.pathname === `/@remotion/shapes@${VERSION}`
		);
	});
	await editor.fill(
		`import {Circle} from '@remotion/shapes';\n${original
			.replace('{title}', '{title.toUpperCase()}')
			.replace(
				'<Orb accent={accent} />',
				'<Circle radius={40} fill="red" role="img" aria-label="Bundled circle" />',
			)}`,
	);
	await page.getByRole('button', {name: 'Compile', exact: true}).click();
	expect(new URL((await dependencyRequest).url()).searchParams.has('dev')).toBe(
		false,
	);
	await expect(
		composition.getByRole('heading', {
			name: 'COMPILED IN THE BROWSER',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByRole('img', {name: 'Bundled circle', exact: true}),
	).toBeVisible();

	await editor.fill("import {Broken from 'remotion';");
	await page.getByRole('button', {name: 'Compile', exact: true}).click();
	const compilationError = page
		.getByRole('alert')
		.filter({hasText: 'Rspack compilation failed'});
	await expect(compilationError).toBeVisible();
	await expect(compilationError).toContainText('Video.tsx');

	await editor.fill(original);
	await page.getByRole('button', {name: 'Compile', exact: true}).click();
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByText('Frame 0 of 138', {exact: true}),
	).toBeVisible();

	await page
		.getByRole('link', {name: 'All Player examples', exact: true})
		.click();
	await expect(
		page.getByRole('heading', {name: 'Player examples', exact: true}),
	).toBeVisible();
	await page
		.getByRole('link', {name: 'Browser-compiled Player', exact: true})
		.click();
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser',
			exact: true,
		}),
	).toBeVisible();
	expect(pageErrors).toEqual([]);
});
