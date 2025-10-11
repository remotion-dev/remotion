import {expect, test} from 'bun:test';
import path from 'path';

test('Should not contain forbidden imports', async () => {
	const output = await Bun.build({
		external: ['@remotion/renderer', 'react/jsx-runtime'],
		entrypoints: [path.join(__filename, '..', '..', 'index.ts')],
	});
	expect(output.outputs.length).toBe(1);
	const text = await output.outputs[0].text();
	expect(text).not.toContain('jsx-runtime');
	expect(text).not.toContain('"@remotion/renderer"');
	expect(text).not.toContain("'@remotion/renderer'");
});
