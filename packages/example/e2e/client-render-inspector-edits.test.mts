import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import sharp from 'sharp';
import {
	exampleDir,
	EXPANDED_SIDEBAR_STATE,
	rootFile,
	STUDIO_URL,
} from './constants.mts';
import {readStudioLogs, stripAnsi} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test('client export includes inspector edits without reloading Studio', async ({
	page,
}) => {
	await startStudio();
	const output = path.join(
		exampleDir,
		'out',
		'client-render-inspector-edits.png',
	);
	try {
		fs.rmSync(output, {force: true});
		fs.writeFileSync(
			rootFile,
			`
import React from 'react';
import {Composition, Solid} from 'remotion';
const EditableSolid = () => <Solid name="Editable color" color="#ff0000" width={32} height={32} />;
export const E2eTestRoot = () => <Composition id="client-render-inspector" component={EditableSolid} durationInFrames={1} fps={30} width={32} height={32} />;
`,
		);
		await page.goto(`${STUDIO_URL}/client-render-inspector`);
		await expect(async () => {
			await page.getByText('Editable color', {exact: true}).first().click();
			await expect(
				page.getByRole('button', {name: '#ff0000', exact: true}),
			).toBeVisible({timeout: 1_000});
		}).toPass();
		const logCount = readStudioLogs().length;
		await page.getByRole('button', {name: '#ff0000', exact: true}).click();
		await page.getByRole('textbox', {name: 'Hex', exact: true}).fill('#0000ff');
		await page.getByRole('textbox', {name: 'Hex', exact: true}).press('Enter');
		await page.keyboard.press('Escape');
		await expect
			.poll(() =>
				readStudioLogs()
					.slice(logCount)
					.map(stripAnsi)
					.some((log) => log.includes('All changes suppressed')),
			)
			.toBe(true);

		await page
			.getByRole('button', {name: 'Select render type', exact: true})
			.click();
		await page
			.getByRole('button', {name: 'Client-side render', exact: true})
			.click();
		await page.getByRole('button', {name: 'Still', exact: true}).click();
		await page.getByRole('button', {name: 'PNG', exact: true}).click();
		await page
			.getByRole('textbox', {name: 'Output name', exact: true})
			.fill('out/client-render-inspector-edits.png');
		await page.getByRole('button', {name: /Render still/}).click();
		await expect.poll(() => fs.existsSync(output)).toBe(true);
		const {data, info} = await sharp(output)
			.ensureAlpha()
			.raw()
			.toBuffer({resolveWithObject: true});
		const offset = (16 * info.width + 16) * info.channels;
		expect([...data.subarray(offset, offset + 4)]).toEqual([0, 0, 255, 255]);
	} finally {
		await stopStudio();
		fs.rmSync(output, {force: true});
	}
});
