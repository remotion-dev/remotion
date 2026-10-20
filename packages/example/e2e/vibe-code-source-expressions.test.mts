import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {exampleDir} from './constants.mts';

test.use({viewport: {width: 1920, height: 1200}});

test('SDK Canvas and vibe-code evaluate and save source expressions per instance', async ({
	page,
}) => {
	test.setTimeout(180_000);
	const template = path.resolve(exampleDir, '../template-vibe-code');
	const rootFile = path.join(template, 'src/remotion/Root.tsx');
	const fixture = path.join(
		template,
		'src/remotion/SourceSubscriptionChurn.tsx',
	);
	const originalRoot = fs.readFileSync(rootFile, 'utf8');
	const originalFixture = fs.existsSync(fixture)
		? fs.readFileSync(fixture, 'utf8')
		: null;
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	fs.writeFileSync(
		fixture,
		fs
			.readFileSync(
				path.join(exampleDir, 'src/SourceSubscriptionChurn.tsx'),
				'utf8',
			)
			.replace(
				/(<Sequence name="Trim this parent" durationInFrames=\{)\d+(\})/,
				(_, prefix: string, suffix: string) => `${prefix}300${suffix}`,
			),
	);
	fs.writeFileSync(
		rootFile,
		`import {Composition} from 'remotion';
import {SourceSubscriptionChurn} from './SourceSubscriptionChurn';
export const RemotionRoot = () => <Composition id="SourceSubscriptionChurn" component={SourceSubscriptionChurn} durationInFrames={600} fps={30} width={1280} height={720} />;`,
	);
	const server = spawn('bun', ['run', 'dev', '--port', '3124'], {
		cwd: template,
		detached: true,
		stdio: 'pipe',
	});
	let serverLogs = '';
	server.stdout.on('data', (chunk: Buffer) => {
		serverLogs += chunk.toString();
	});
	server.stderr.on('data', (chunk: Buffer) => {
		serverLogs += chunk.toString();
	});
	try {
		await expect
			.poll(
				async () => {
					try {
						return (await fetch('http://localhost:3124')).ok;
					} catch {
						return false;
					}
				},
				{timeout: 90_000, message: 'Vibe-code dev server should start'},
			)
			.toBe(true);
		await page.goto('http://localhost:3124');
		const preview = page.frameLocator('iframe[title="Composition preview"]');
		const parent = page.getByRole('button', {
			name: /^Trim this parent: from frame/,
		});
		await expect(parent).toBeVisible({timeout: 60_000});
		await page.getByRole('textbox', {name: 'Current frame'}).fill('30');
		await page.getByRole('textbox', {name: 'Current frame'}).press('Enter');
		await expect(
			preview.getByText('Expression A: 150 frames', {exact: true}),
		).toBeVisible();
		await expect(
			preview.getByText('Expression B: 200 frames', {exact: true}),
		).toBeVisible();
		const box = await parent.boundingBox();
		if (!box) throw new Error('Expected parent timeline bar');
		const pixelsPerFrame = box.width / 300;
		const x = box.x + box.width - 2;
		const y = box.y + box.height / 2;
		await page.mouse.move(x, y);
		await page.mouse.down();
		for (const delta of [20, 40, 60]) {
			await page.mouse.move(x + delta * pixelsPerFrame, y, {steps: 3});
			await expect(
				preview.getByText(`Parent scope: ${300 + delta} frames`, {exact: true}),
			).toBeVisible();
			await expect(
				preview.getByText(`Expression A: ${(300 + delta) / 2} frames`, {
					exact: true,
				}),
			).toBeVisible();
			await expect(
				preview.getByText('Expression B: 200 frames', {exact: true}),
			).toBeVisible();
			await expect
				.poll(() =>
					preview
						.getByTestId('Expression A')
						.evaluate((element) =>
							Number(getComputedStyle(element.parentElement!).opacity),
						),
				)
				.toBeCloseTo(30 / (299 + delta), 5);
		}
		await page.mouse.up();
		const expression = page.getByRole('button', {
			name: /^Expression A: from frame/,
		});
		let edge = await expression.boundingBox();
		await expect
			.poll(async () => {
				try {
					await expression.scrollIntoViewIfNeeded();
					edge = await expression.boundingBox();
					return edge;
				} catch (error) {
					if (
						error instanceof Error &&
						error.message.includes('Element is not attached to the DOM')
					) {
						return null;
					}
					throw error;
				}
			})
			.not.toBeNull();
		if (!edge) throw new Error('Expected expression timeline bar');
		await page.mouse.move(edge.x + edge.width - 2, edge.y + edge.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			edge.x + edge.width - 2 + pixelsPerFrame * 36,
			edge.y + edge.height / 2,
			{steps: 5},
		);
		await page.mouse.up();
		await expect(
			preview.getByText('Expression A: 216 frames', {exact: true}),
		).toBeVisible();
		await expect(
			preview.getByText('Expression B: 240 frames', {exact: true}),
		).toBeVisible();
		await page
			.getByRole('button', {name: 'Save to src/remotion', exact: true})
			.click();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf8'))
			.toMatch(/durationInFrames=\{duration \* 0\.6\}/);
		expect(
			errors.filter((error) => /maximum update depth/i.test(error)),
		).toEqual([]);
	} catch (error) {
		await test.info().attach('vibe-code-server.log', {
			body: serverLogs,
			contentType: 'text/plain',
		});
		throw error;
	} finally {
		if (server.pid) process.kill(-server.pid, 'SIGTERM');
		await new Promise<void>((resolve) => {
			server.once('exit', () => resolve());
			setTimeout(resolve, 5_000);
		});
		fs.writeFileSync(rootFile, originalRoot);
		if (originalFixture === null) fs.rmSync(fixture, {force: true});
		else fs.writeFileSync(fixture, originalFixture);
	}
});
