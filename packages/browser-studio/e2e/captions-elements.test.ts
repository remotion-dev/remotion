import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
	expect,
	test,
	type Frame,
	type FrameLocator,
	type Page,
} from '@playwright/test';
import {
	createElementPayload,
	StudioProtocolInternals,
} from '@remotion/studio-protocol';

const instrumentSequencePropsSubscriptions = async (page: Page) => {
	const studioFrame = page.frames().find((frame) => frame !== page.mainFrame());
	if (!studioFrame) {
		throw new Error('No studio iframe');
	}

	await studioFrame.waitForFunction(
		() =>
			Boolean(
				(window as unknown as {remotion_browserStudio: unknown})
					.remotion_browserStudio,
			),
		null,
		{timeout: 60_000},
	);
	await studioFrame.evaluate(() => {
		const ops = (
			window as unknown as {
				remotion_browserStudio: {
					subscribeToSequenceProps: (request: unknown) => Promise<unknown>;
				};
			}
		).remotion_browserStudio;
		const original = ops.subscribeToSequenceProps.bind(ops);
		const log: {request: unknown; result: unknown}[] = [];
		(window as unknown as {__subsLog: typeof log}).__subsLog = log;
		ops.subscribeToSequenceProps = async (request: unknown) => {
			const result = await original(request);
			log.push({request, result});
			return result;
		};
	});

	return studioFrame;
};

const installElement = async (studio: FrameLocator, displayName: string) => {
	await studio.getByRole('button', {name: /^Install/}).click();
	await expect(studio.getByText(displayName).first()).toBeVisible();
};

const dragCaptionElement = async ({
	page,
	studio,
	studioFrame,
}: {
	readonly page: Page;
	readonly studio: FrameLocator;
	readonly studioFrame: Frame;
}) => {
	const captionGroup = studio
		.locator('[role="group"][aria-label^="Captions"]')
		.first();
	await expect(captionGroup).toBeVisible();

	// Wait for the sequence-props subscription so that prop statuses (and with
	// them the drag affordances) are available.
	await studioFrame.waitForFunction(
		() =>
			((window as unknown as {__subsLog: unknown[]}).__subsLog ?? []).length >
			0,
		null,
		{timeout: 30_000},
	);

	// Pause playback so caption pages don't swap mid-drag.
	const pauseButton = studio.getByRole('button', {name: 'Pause', exact: false});
	if (await pauseButton.isVisible().catch(() => false)) {
		await pauseButton.click();
	}

	for (let attempt = 0; attempt < 3; attempt++) {
		const boxBefore = await captionGroup.boundingBox();
		if (boxBefore === null) {
			throw new Error('Caption element not visible');
		}

		const centerX = boxBefore.x + boxBefore.width / 2;
		const centerY = boxBefore.y + boxBefore.height / 2;
		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.move(centerX + 120, centerY + 80, {steps: 12});
		await page.mouse.up();
		await page.waitForTimeout(400);

		const boxAfter = await captionGroup.boundingBox();
		const moved =
			boxAfter !== null &&
			(Math.round(boxAfter.x) !== Math.round(boxBefore.x) ||
				Math.round(boxAfter.y) !== Math.round(boxBefore.y));
		if (moved) {
			return true;
		}
	}

	return false;
};

const elementCases = [
	{
		displayName: 'Moving Pill Captions',
		slug: 'captions/moving-pill-captions',
		sourceFile: 'moving-pill-captions.tsx',
	},
	{
		displayName: 'Popping Word Captions',
		slug: 'captions/popping-word-captions',
		sourceFile: 'popping-word-captions.tsx',
	},
	{
		displayName: 'Word Highlight Captions',
		slug: 'captions/word-highlight-captions',
		sourceFile: 'word-highlight-captions.tsx',
	},
] as const;

for (const elementCase of elementCases) {
	test(`${elementCase.displayName}: has a visibility eye, targets the composition and can be moved`, async ({
		page,
	}) => {
		const sourceCode = readFileSync(
			path.join(
				path.dirname(fileURLToPath(import.meta.url)),
				'..',
				'..',
				'..',
				'packages',
				'docs',
				'elements',
				'captions',
				elementCase.sourceFile.replace('.tsx', ''),
				elementCase.sourceFile,
			),
			'utf8',
		);
		const payload = createElementPayload({
			dependencies: [
				{name: '@remotion/captions', version: null},
				{name: '@remotion/google-fonts', version: null},
				{name: '@remotion/layout-utils', version: null},
			],
			dimensions: {width: 900, height: 180},
			displayName: elementCase.displayName,
			durationInFrames: 210,
			installationMode: 'component-owned-sequence',
			slug: elementCase.slug,
			sourceCode,
		});
		const url = StudioProtocolInternals.makeBrowserStudioUrl({
			endpoint: 'http://127.0.0.1:62338/',
			payload,
		});
		await page.goto(url);

		const studio = page.frameLocator('iframe');
		await expect(
			studio.getByText('Install Element', {exact: true}),
		).toBeVisible();
		const studioFrame = await instrumentSequencePropsSubscriptions(page);

		await installElement(studio, elementCase.displayName);

		// The sequence-props subscription must target the user's composition
		// file, not the internal Element implementation file.
		const subsLog = (await studioFrame.evaluate(() => {
			return (
				window as unknown as {
					__subsLog: {request: {fileName: string}}[];
				}
			).__subsLog;
		})) as {request: {fileName: string}}[];
		expect(subsLog.length).toBeGreaterThan(0);
		expect(
			subsLog.every(
				(entry) => entry.request.fileName === '/project/src/Composition.tsx',
			),
		).toBe(true);

		// The timeline item must have a visibility toggle.
		const eyes = studio.locator('[data-timeline-layer-eye]');
		await expect(eyes.first()).toBeAttached();

		const moved = await dragCaptionElement({page, studio, studioFrame});
		expect(moved).toBe(true);

		// Saving must persist the move into the composition file.
		const compositionAfterSave = await page.evaluate(() => {
			const browserWindow = window as typeof window & {
				__browserStudioProject: {files: Record<string, string>};
			};
			return browserWindow.__browserStudioProject.files[
				'/project/src/Composition.tsx'
			];
		});
		expect(compositionAfterSave).toContain('translate');

		const elementFileAfterSave = await page.evaluate((slug) => {
			const browserWindow = window as typeof window & {
				__browserStudioProject: {files: Record<string, string>};
			};
			return browserWindow.__browserStudioProject.files[
				`/project/src/${slug.split('/').at(-1)}.element.tsx`
			];
		}, elementCase.slug);
		expect(elementFileAfterSave).toBe(sourceCode);
	});
}
