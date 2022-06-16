import fs from 'fs';
import {tmpdir} from 'os';
import path from 'path';
import {downloadFile} from '../assets/download-file';

test('Should be able to download file', async () => {
	const output = path.join(tmpdir(), 'tmp.html');
	await downloadFile('https://example.net/', output, () => undefined);
	const data = await fs.promises.readFile(output, 'utf8');

	expect(data).toMatch(
		/This domain is for use in illustrative examples in documents/
	);
});

test('Should fail to download invalid files', async () => {
	const output = path.join(tmpdir(), 'invalid.html');
	await expect(() =>
		downloadFile('https://thisdomain.doesnotexist', output, () => undefined)
	).rejects.toThrow(/ENOTFOUND/);
});
