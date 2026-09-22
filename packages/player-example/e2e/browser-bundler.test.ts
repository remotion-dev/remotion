import {expect, test} from '@playwright/test';

test('Fast Refresh preserves an isolated Canvas, video state and editor focus through live edits', async ({
	page,
}) => {
	const pageErrors: string[] = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));

	await page.goto('/');
	await page
		.getByRole('link', {name: 'Browser-compiled Canvas', exact: true})
		.click();
	const preview = page.frameLocator('iframe[title="Live Canvas preview"]');
	const composition = preview.getByRole('region', {
		name: 'Compiled composition',
	});
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByText('Frame 0 of 138', {exact: true}),
	).toBeVisible();
	await expect(
		composition.getByText('1280 x 720 / 30 fps / 138 frames', {exact: true}),
	).toBeVisible();
	const mountedLayers = composition.getByRole('region', {
		name: 'Mounted layers',
	});
	await expect(
		mountedLayers.getByRole('heading', {name: 'Layers (5)'}),
	).toBeVisible();
	await expect(
		mountedLayers.getByRole('button', {name: /^Background/}),
	).toBeVisible();
	await expect(mountedLayers.getByRole('button', {name: /^Orb/})).toBeVisible();
	await expect(
		mountedLayers.getByRole('button', {name: /^Content/}),
	).toBeVisible();
	await mountedLayers.getByRole('button', {name: /^Content/}).click();
	await expect(
		composition
			.getByRole('region', {name: 'Layer selection'})
			.getByRole('heading', {name: 'Selection (1)'}),
	).toBeVisible();
	await composition
		.getByRole('button', {name: 'Clicks: 0', exact: true})
		.click();
	await composition
		.getByRole('button', {name: 'Clicks: 1', exact: true})
		.click();
	const playbackRate = composition.getByRole('button', {
		name: 'Change playback rate',
		exact: true,
	});
	await playbackRate.click();
	await composition.getByText('1.5x', {exact: true}).click();

	const frame = composition.getByText(/^Frame \d+ of 138$/);
	await composition
		.getByRole('button', {name: 'Play video', exact: true})
		.click();
	await expect(frame).not.toHaveText('Frame 0 of 138');
	await composition
		.getByRole('button', {name: 'Pause video', exact: true})
		.click();
	const pausedFrame = await frame.innerText();

	const editor = page.getByRole('textbox', {name: 'Video.tsx'});
	const original = await editor.inputValue();
	const compatibleEdit = original.replace(
		'{title}',
		'{title + " - refreshed"}',
	);
	await editor.fill(compatibleEdit);
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser - refreshed',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByRole('button', {name: 'Clicks: 2', exact: true}),
	).toBeVisible();
	await expect(frame).toHaveText(pausedFrame);
	await expect(playbackRate).toHaveText('1.5x');
	await expect(
		mountedLayers.getByRole('heading', {name: 'Layers (5)'}),
	).toBeVisible();
	await expect(
		composition.getByRole('button', {name: 'Play video', exact: true}),
	).toBeVisible();
	await expect(editor).toBeFocused();

	const typingSource = `${compatibleEdit}\n// Consecutive edits: `;
	const status = page.getByRole('status');
	await editor.fill(typingSource);
	await expect(status).toHaveText('Up to date');
	// Use the keyboard, not locator typing that would restore lost focus.
	await page.keyboard.type('first', {delay: 80});
	await expect(editor).toHaveValue(`${typingSource}first`);
	await expect(status).toHaveText('Up to date');
	await expect(editor).toBeFocused();
	await page.keyboard.type(' second', {delay: 80});
	await expect(editor).toHaveValue(`${typingSource}first second`);
	await expect(status).toHaveText('Up to date');
	await expect(editor).toBeFocused();
	await expect(frame).toHaveText(pausedFrame);

	await composition
		.getByRole('button', {name: 'Play video', exact: true})
		.click();
	await editor.fill(original.replace('{title}', '{title + " - playing"}'));
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser - playing',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByRole('button', {name: 'Pause video', exact: true}),
	).toBeVisible();
	const playingFrame = await frame.innerText();
	await expect(frame).not.toHaveText(playingFrame);
	await expect(editor).toBeFocused();
	await composition
		.getByRole('button', {name: 'Pause video', exact: true})
		.click();
	const recoveryFrame = await frame.innerText();

	await editor.fill("import {Broken from 'remotion';");
	const compilationError = page
		.getByRole('alert')
		.filter({hasText: 'Rspack compilation failed'});
	await expect(compilationError).toBeVisible();
	await expect(compilationError).toContainText('Video.tsx');
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser - playing',
			exact: true,
		}),
	).toBeVisible();
	await expect(frame).toHaveText(recoveryFrame);
	await expect(
		composition.getByRole('button', {name: 'Clicks: 2', exact: true}),
	).toBeVisible();

	await editor.fill(original.replace('{title}', '{title + " - intermediate"}'));
	await editor.fill(original.replace('{title}', '{title + " - recovered"}'));
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser - recovered',
			exact: true,
		}),
	).toBeVisible();
	await expect(compilationError).toBeHidden();

	const npmSource = `import {Circle} from '@remotion/shapes';\n${original
		.replace('{title}', '{title.toUpperCase()}')
		.replace(
			'<Orb accent={accent} />',
			'<Circle radius={40} fill="red" role="img" aria-label="Bundled circle" />',
		)}`;
	await editor.fill(npmSource);
	await expect(
		composition.getByRole('heading', {
			name: 'COMPILED IN THE BROWSER',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByRole('img', {name: 'Bundled circle', exact: true}),
	).toBeVisible();
	await expect(
		composition.getByRole('button', {name: 'Clicks: 2', exact: true}),
	).toBeVisible();
	await expect(frame).toHaveText(recoveryFrame);
	await expect(playbackRate).toHaveText('1.5x');
	await expect(editor).toBeFocused();

	await editor.fill(
		npmSource
			.replace(
				'const frame = useCurrentFrame();',
				'const [suffix] = useState("hook reset");\n  const frame = useCurrentFrame();',
			)
			.replace('{title.toUpperCase()}', '{title + " - " + suffix}'),
	);
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser - hook reset',
			exact: true,
		}),
	).toBeVisible();
	await expect(
		composition.getByRole('button', {name: 'Clicks: 0', exact: true}),
	).toBeVisible();
	await expect(frame).toHaveText(recoveryFrame);
	await expect(playbackRate).toHaveText('1.5x');

	await page.getByRole('link', {name: 'Player examples', exact: true}).click();
	await expect(
		page.getByRole('heading', {name: 'Player examples', exact: true}),
	).toBeVisible();
	await page
		.getByRole('link', {name: 'Browser-compiled Canvas', exact: true})
		.click();
	await expect(
		composition.getByRole('heading', {
			name: 'Compiled in the browser',
			exact: true,
		}),
	).toBeVisible();
	await expect(frame).toHaveText('Frame 0 of 138');
	expect(pageErrors).toEqual([]);
});
