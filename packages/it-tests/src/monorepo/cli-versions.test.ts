import {$} from 'bun';
import {expect, test} from 'bun:test';
import path from 'node:path';
import {VERSION} from 'remotion';

test('should return list of versions', async () => {
	const {stdout} = await $`bunx remotion versions`
		.cwd(path.join(__dirname, '..', '..', '..', 'example'))
		.quiet();

	const text = stdout.toString();

	expect(text).toInclude(`On version: ${VERSION}`);
	expect(text).toInclude(`- @remotion/three`);
	expect(text).toInclude(`Great! All packages have the correct version`);
});
