import {formatBytes} from '~/lib/format-bytes';

const res = await Bun.build({
	entrypoints: ['entry.ts'],
	minify: true,
});

const str = await res.outputs[0].text();

console.log(formatBytes(str.length));
