import fs from 'fs';
import {expect, test} from '@playwright/test';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	visualMode3DFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test('shows mixed text children as computed in the inspector', async ({
	page,
}) => {
	const originalSource = fs.readFileSync(visualMode3DFile, 'utf-8');
	try {
		await startStudio();
		fs.writeFileSync(
			visualMode3DFile,
			`
import React from 'react';
import {Interactive} from 'remotion';
export const VisualMode3D = () => (
	<Interactive.Div name="Headline" style={{fontSize: 72, lineHeight: 1.03, letterSpacing: -4, fontWeight: 500}}>
		Ideas, in<br />
		<span style={{fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#698357'}}>motion.</span>
	</Interactive.Div>
);
`,
		);
		await page.goto(`${STUDIO_URL}/visual-mode-3d`);
		await expect(async () => {
			await page
				.locator('[data-timeline-marquee-item][title="Headline"]')
				.click();
			await expect(
				page.getByRole('button', {name: 'Collapse Text', exact: true}),
			).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await expect(page.getByText('computed', {exact: true})).toBeVisible();
	} finally {
		await stopStudio();
		fs.writeFileSync(visualMode3DFile, originalSource);
	}
});
