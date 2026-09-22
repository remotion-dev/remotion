import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import type {SubscribeToSequencePropsResponse} from '@remotion/studio-shared';
import {exampleDir, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('consecutive visual edits target the correct siblings after fast refresh', async ({
	page,
}) => {
	const sourceFile = path.join(exampleDir, 'src/BarChart.tsx');
	const original = fs.readFileSync(sourceFile, 'utf8');
	try {
		await startStudio();
		const initialProps = page.waitForResponse(async (response) => {
			if (!response.url().endsWith('/api/subscribe-to-sequence-props')) {
				return false;
			}
			const result = await response.json();
			return result.data?.results?.some(
				(item: SubscribeToSequencePropsResponse) =>
					item.success &&
					item.status.canUpdate &&
					item.status.props.name?.status === 'static' &&
					item.status.props.name.codeValue === 'Eyebrow',
			);
		});
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		await initialProps;
		await page.getByRole('button', {name: '0', exact: true}).click();
		await page.getByRole('textbox', {name: '0', exact: true}).fill('120');
		await page.keyboard.press('Enter');
		const canvas = page.locator('.remotion-studio-composition-container');
		await expect(
			canvas.getByText('Regional growth', {exact: true}),
		).toBeVisible();

		// These unkeyed siblings reuse runtime instances when an earlier one is
		// removed. A successful API response alone can hide deleting the wrong node.
		for (const [label, text] of [
			['Eyebrow', 'Performance overview'],
			['Title', 'Regional growth'],
		]) {
			await expect(canvas.getByText(text, {exact: true})).toBeVisible();
			await page.getByTitle(label, {exact: true}).first().click();
			const response = page.waitForResponse((r) =>
				r.url().endsWith('/api/delete-jsx-nodes'),
			);
			await page.keyboard.press('Delete');
			expect((await (await response).json()).data.success).toBe(true);
			const source = fs.readFileSync(sourceFile, 'utf8');
			expect(source).not.toContain(`name="${label}"`);
			expect(source).toContain('name="Chart panel"');
			expect(source).toContain('name="Peak badge"');
			await expect(canvas.getByText(text, {exact: true})).toHaveCount(0);
		}

		// An editor save has no codemod remapping event. Stack refresh must still
		// discover the new source positions before the next visual edit.
		const beforeEditorSave = fs.readFileSync(sourceFile, 'utf8');
		fs.writeFileSync(
			sourceFile,
			beforeEditorSave.replace(
				'<Interactive.Div\n\t\t\t\tname="Chart panel"',
				'<Interactive.Div name="Editor insertion">External edit</Interactive.Div>\n\t\t\t<Interactive.Div\n\t\t\t\tname="Chart panel"',
			),
		);
		await expect(
			canvas.getByText('External edit', {exact: true}),
		).toBeVisible();
		await page.getByTitle('Chart panel', {exact: true}).first().click();
		const response = page.waitForResponse((r) =>
			r.url().endsWith('/api/delete-jsx-nodes'),
		);
		await page.keyboard.press('Delete');
		expect((await (await response).json()).data.success).toBe(true);
		const source = fs.readFileSync(sourceFile, 'utf8');
		expect(source).not.toContain('name="Chart panel"');
		expect(source).toContain('name="Editor insertion"');
		expect(source).toContain('name="Peak badge"');
		await expect(
			canvas.getByText('External edit', {exact: true}),
		).toBeVisible();
		await expect(canvas.getByText('West leads at 87%')).toBeVisible();

		// Insertion must select the new element after refresh. Delete it without
		// selecting a row, so this also verifies automatic selection.
		await page.keyboard.press('Escape');
		await page.getByRole('button', {name: 'Expand right sidebar'}).click();
		await page.getByRole('button', {name: 'Add Solid', exact: true}).click();
		await expect(
			page.getByTitle('<Solid>', {exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Add Solid', exact: true}),
		).toHaveCount(0);
		expect(fs.readFileSync(sourceFile, 'utf8')).toContain('<Solid');
		const deleteInserted = page.waitForResponse((r) =>
			r.url().endsWith('/api/delete-jsx-nodes'),
		);
		await page.keyboard.press('Delete');
		expect((await (await deleteInserted).json()).data.success).toBe(true);
		expect(fs.readFileSync(sourceFile, 'utf8')).not.toContain('<Solid');
		expect(fs.readFileSync(sourceFile, 'utf8')).toContain('name="Peak badge"');
	} finally {
		fs.writeFileSync(sourceFile, original);
		await stopStudio();
	}
});
