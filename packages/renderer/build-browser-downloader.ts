const out = await Bun.build({
	entrypoints: ['src/ensure-browser.ts'],
	target: 'node',
});

Bun.write('ensure-browser.mjs', await out.outputs[0].arrayBuffer());

export {};
