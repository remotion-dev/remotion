import fs from 'fs';
const files = fs.readdirSync('spa-dist/client');
const assets = fs.readdirSync('spa-dist/client/assets');
const toCache = [
	...files
		.filter((f) => {
			return fs.statSync(`spa-dist/client/${f}`).isFile();
		})
		.map((f) => `/convert/${f}`.replace('/index.html', '')),
	...assets
		.filter((f) => {
			if (!fs.statSync(`spa-dist/client/assets/${f}`).isFile()) {
				throw new Error('Unexpected output');
			}
			return true;
		})
		.map((f) => `/convert/assets/${f}`),
];

const result = await Bun.build({
	entrypoints: ['./app/service-worker.ts'],
});

if (!result.success) {
	console.log(result.logs);
	throw new Error('Failed to build service worker');
}

const firstOutput = result.outputs[0];

if (!firstOutput) {
	throw new Error('No output');
}
const text = await firstOutput.text();
const replaced = '$FILES = [];';
if (!text.includes(replaced)) {
	throw new Error('Unexpected output');
}

await Bun.write(
	'spa-dist/client/service-worker.js',
	text.replace(replaced, `$FILES = ${JSON.stringify(toCache)};`),
);
