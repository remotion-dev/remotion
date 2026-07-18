import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const studioServerSource = readFileSync(
	path.join(__dirname, '../helpers/open-in-editor.ts'),
	'utf8',
);
const createVideoSource = readFileSync(
	path.join(__dirname, '../../../create-video/src/open-in-editor.ts'),
	'utf8',
);

test('Windows editor launch hides cmd.exe console window (studio-server)', () => {
	expect(studioServerSource).toContain(
		"{stdio: 'inherit', detached: true, windowsHide: true}",
	);
});

test('Windows editor launch hides cmd.exe console window (create-video)', () => {
	expect(createVideoSource).toContain(
		"{stdio: 'inherit', detached: true, windowsHide: true}",
	);
});
