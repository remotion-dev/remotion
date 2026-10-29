import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import type {} from './studio-browser';

const brandRoot = path.resolve(import.meta.dir, '../..');
const browserRequire = createRequire(
	path.resolve(brandRoot, '../web-renderer/package.json'),
);
const {chromium} = browserRequire('playwright') as typeof import('playwright');
const outputDir = path.join(brandRoot, 'public/aura-code/timeline');
const viewport = {width: 1280, height: 800};
const density = 4;
const studioUrl = process.env.AURA_STUDIO_URL ?? 'http://localhost:3110';
const shots = [
	{
		id: 'chapters',
		composition: 'AuraTimeline-Chapters',
		frame: 45,
		select: null,
		requiredNames: ['Chapters', 'Intro', 'Light leaks', 'Outro', 'Score'],
	},
	{
		id: 'styles',
		composition: 'AuraTimeline-Card',
		frame: 60,
		select: 'Presenter card',
		requiredNames: ['Presenter card', 'Presenter name', 'Presenter role'],
	},
	{
		id: 'selection',
		composition: 'AuraTimeline-Chapters',
		frame: 45,
		select: 'Intro',
		requiredNames: ['Chapters', 'Intro', 'Light leaks', 'Outro', 'Score'],
	},
	{
		id: 'captions',
		composition: 'AuraTimeline-Captions',
		frame: 20,
		select: 'Presenter captions',
		requiredNames: [
			'Presenter video and captions',
			'Presenter video',
			'Presenter captions',
		],
	},
] as const;
const requested =
	process.argv.find((arg) => arg.startsWith('--shot='))?.slice(7) ?? null;
if (requested !== null && !shots.some((shot) => shot.id === requested)) {
	throw new Error(`Unknown timeline shot ${requested}`);
}
const bundle = await Bun.build({
	entrypoints: [path.join(import.meta.dir, 'studio-browser.ts')],
	target: 'browser',
	format: 'iife',
	minify: true,
});
if (!bundle.success) throw new Error(bundle.logs.join('\n'));
await mkdir(outputDir, {recursive: true});
const browser = await chromium.launch({
	executablePath:
		process.env.CHROME_EXECUTABLE ??
		'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
	headless: true,
	args: ['--enable-features=CanvasDrawElement'],
});
try {
	for (const shot of shots.filter(
		(candidate) => requested === null || candidate.id === requested,
	)) {
		const context = await browser.newContext({
			viewport,
			deviceScaleFactor: density,
		});
		await context.addInitScript({content: await bundle.outputs[0].text()});
		await context.addInitScript(() => {
			localStorage.setItem(
				'remotion.editor.timelineFlex.top-to-bottom',
				'0.36',
			);
			localStorage.setItem(
				'remotion.editor.timelineFlex.names-to-timeline',
				String(260 / 1277),
			);
			sessionStorage.setItem('remotion.studioPixelRatio', '4');
		});
		const page = await context.newPage();
		const errors: string[] = [];
		const pendingMedia = new Set<string>();
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('request', (request) => {
			if (/\.(mov|mp4|mp3|wav|webm)(\?|$)/i.test(request.url()))
				pendingMedia.add(request.url());
		});
		page.on('requestfinished', (request) => pendingMedia.delete(request.url()));
		page.on('requestfailed', (request) => pendingMedia.delete(request.url()));
		await page.goto(`${studioUrl}/${shot.composition}?studioPixelRatio=4`, {
			waitUntil: 'domcontentloaded',
		});
		console.log(`${shot.id}: Studio loaded`);
		await page
			.waitForFunction(
				() => window.auraTimeline?.tools.has('select_composition'),
				null,
				{timeout: 30_000},
			)
			.catch(async (error) => {
				await page.screenshot({
					path: path.join(outputDir, `${shot.id}-incomplete.png`),
				});
				console.log(
					JSON.stringify({
						errors,
						text: await page.locator('body').innerText(),
					}),
				);
				throw error;
			});
		await page.evaluate(
			(compositionName) =>
				window.auraTimeline.call('select_composition', {compositionName}),
			shot.composition,
		);
		console.log(`${shot.id}: composition selected`);
		await page
			.waitForFunction(
				async (requiredNames) => {
					const result = (await window.auraTimeline.call(
						'get_sequences',
						{},
					)) as {sequences: {name: string | null}[]};
					return requiredNames.every((name) =>
						result.sequences.some((sequence) => sequence.name === name),
					);
				},
				shot.requiredNames,
				{timeout: 120_000},
			)
			.catch(async (error) => {
				await page.screenshot({
					path: path.join(outputDir, `${shot.id}-incomplete.png`),
				});
				console.log(
					JSON.stringify(
						await page.evaluate(() =>
							window.auraTimeline.call('get_sequences', {}),
						),
					),
				);
				throw error;
			});
		console.log(`${shot.id}: expected sequence names registered`);
		await page.evaluate(async (frame) => {
			await window.auraTimeline.call('pause', {});
			await window.auraTimeline.call('seek_to_frame', {frame});
			await window.auraTimeline.call('set_timeline_zoom', {zoom: 0});
		}, shot.frame);
		if (shot.id === 'chapters' || shot.id === 'selection') {
			const expandChapters = page.getByRole('button', {
				name: 'Expand children of Chapters',
				exact: true,
			});
			if (await expandChapters.isVisible()) await expandChapters.click();
			await page
				.getByRole('button', {
					name: 'Collapse children of Chapters',
					exact: true,
				})
				.waitFor({state: 'visible'});
		}
		console.log(`${shot.id}: framing applied`);
		if (shot.select !== null) {
			await page.waitForFunction(
				async (name) => {
					const result = (await window.auraTimeline.call(
						'get_sequences',
						{},
					)) as {sequences: {name: string | null; selectable: boolean}[]};
					return result.sequences.some(
						(sequence) => sequence.name === name && sequence.selectable,
					);
				},
				shot.select,
				{timeout: 120_000},
			);
			await page.evaluate(async (name) => {
				const result = (await window.auraTimeline.call(
					'get_sequences',
					{},
				)) as {sequences: {sequenceId: string; name: string | null}[]};
				const sequence = result.sequences.find(
					(candidate) => candidate.name === name,
				);
				if (!sequence) throw new Error(`Missing selection ${name}`);
				await window.auraTimeline.call('select_sequence', {
					sequenceId: sequence.sequenceId,
				});
			}, shot.select);
		}
		await page.mouse.move(1278, 2);
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(
			() =>
				!document.querySelector(
					'.__remotion-slide-forward, .__remotion-slide-backward',
				),
		);
		let previous = '';
		let stableSamples = 0;
		let state = await page.evaluate(() => window.auraTimeline.inspect());
		const deadline = Date.now() + 120_000;
		while (stableSamples < 4 && Date.now() < deadline) {
			await page.waitForTimeout(500);
			state = await page.evaluate(() => window.auraTimeline.inspect());
			const signature = JSON.stringify({
				rows: state.rows,
				canvases: state.canvases,
			});
			const waveformReady = state.canvases.some(
				(canvas) =>
					(Math.abs(canvas.cssHeight - 19) < 1 ||
						Math.abs(canvas.cssHeight - 34) < 1) &&
					canvas.occupiedSamples > 0,
			);
			const filmstripReady = state.canvases.some(
				(canvas) =>
					Math.abs(canvas.cssHeight - 26) < 1 &&
					canvas.occupiedSamples / canvas.samples > 0.85,
			);
			const mediaReady =
				shot.id === 'styles' ||
				(waveformReady && (shot.id !== 'captions' || filmstripReady));
			const ready =
				pendingMedia.size === 0 &&
				mediaReady &&
				state.canvases.every((canvas) => canvas.width > 0 && canvas.height > 0);
			stableSamples = ready && signature === previous ? stableSamples + 1 : 0;
			previous = signature;
		}
		if (stableSamples < 4) {
			await page.screenshot({
				path: path.join(outputDir, `${shot.id}-incomplete.png`),
			});
			console.log(
				JSON.stringify({state, pendingMedia: [...pendingMedia], errors}),
			);
			throw new Error(`${shot.id}: native timeline did not settle`);
		}
		const sequences = await page.evaluate(() =>
			window.auraTimeline.call('get_sequences', {}),
		);
		const selection = (await page.evaluate(() =>
			window.auraTimeline.call('get_selection', {}),
		)) as {selectedSequence: {name: string | null} | null};
		if (
			shot.select !== null &&
			selection.selectedSequence?.name !== shot.select
		) {
			throw new Error(`${shot.id}: expected ${shot.select} to be selected`);
		}
		const playback = await page.evaluate(() =>
			window.auraTimeline.call('get_playback_state', {}),
		);
		const currentError = await page.evaluate(() =>
			window.auraTimeline.call('get_current_error', {}),
		);
		if (errors.length > 0 || currentError !== null) {
			await page.screenshot({
				path: path.join(outputDir, `${shot.id}-incomplete.png`),
			});
			throw new Error(
				`${shot.id}: Studio reported an error: ${JSON.stringify({errors, currentError})}`,
			);
		}
		await page.screenshot({
			path: path.join(outputDir, `${shot.id}-studio.png`),
			animations: 'disabled',
		});
		let technique = 'PageCapture: requestPaint + drawElementImage';
		let fallbackReason: string | null = null;
		try {
			const png = await page.evaluate(
				(crop) => window.auraTimeline.capture(crop),
				state.crop,
			);
			await writeFile(path.join(outputDir, `${shot.id}.png`), png, {
				encoding: 'base64',
			});
		} catch (error) {
			fallbackReason = String(error);
			technique = 'Native Chromium screenshot at deviceScaleFactor 4';
			await page.screenshot({
				path: path.join(outputDir, `${shot.id}.png`),
				clip: {
					x: state.crop.left,
					y: state.crop.top,
					width: state.crop.width,
					height: state.crop.height,
				},
			});
		}
		await writeFile(
			path.join(outputDir, `${shot.id}.json`),
			JSON.stringify(
				{
					technique,
					fallbackReason,
					browser: await browser.version(),
					composition: shot.composition,
					frame: shot.frame,
					viewport,
					density,
					width: state.crop.width * density,
					height: state.crop.height * density,
					studioPixelRatio: density,
					coordinateUnits:
						'CSS pixels relative to crop; multiply by density for PNG coordinates',
					readiness: {
						stableSamples,
						sampleIntervalMs: 500,
						pendingMedia: [...pendingMedia],
						errors,
						currentError,
					},
					...state,
					sequences,
					selection,
					playback,
				},
				null,
				2,
			) + '\n',
		);
		console.log(
			`Saved ${shot.id}: ${state.crop.width * density}×${state.crop.height * density}; ${state.rows.map((row) => row.name).join(', ')}`,
		);
		await context.close();
	}
} finally {
	await browser.close();
}
