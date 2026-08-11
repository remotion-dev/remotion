import {mkdirSync, writeFileSync} from 'fs';
import path from 'path';
import {build} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

console.time('Generated.');

const scriptMap: Record<string, string> = {
	'render-video-script': 'src/scripts/render-video.ts',
	'render-still-script': 'src/scripts/render-still.ts',
	'ensure-browser-script': 'src/scripts/ensure-browser.ts',
	'upload-blob-script': 'src/scripts/upload-blob.ts',
};

const generatedDir = path.join('src', 'generated');
mkdirSync(generatedDir, {recursive: true});

// Bundle each script separately so that `remotion` imports are inlined,
// while `@remotion/renderer`, `@vercel/blob`, `fs`, etc. stay external.
const scriptBundles: Record<string, string> = {};
for (const [name, entrypoint] of Object.entries(scriptMap)) {
	writeFileSync(
		path.join(generatedDir, `${name}.d.ts`),
		'export declare const script: string;\n',
	);

	const scriptOutput = await build({
		entrypoints: [entrypoint],
		target: 'node',
		external: ['@remotion/renderer', '@vercel/blob', 'fs'],
	});

	if (!scriptOutput.success) {
		console.log(scriptOutput.logs.join('\n'));
		process.exit(1);
	}

	scriptBundles[name] = await scriptOutput.outputs[0].text();
}

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	target: 'node',
	external: [
		'remotion',
		'remotion/no-react',
		'remotion/version',
		'@vercel/sandbox',
		'@vercel/blob',
	],
	plugins: [
		{
			name: 'script-embed',
			setup(build) {
				build.onResolve(
					{
						filter:
							/(render-video-script|render-still-script|ensure-browser-script|upload-blob-script)$/,
					},
					(args) => {
						const name = args.path.match(
							/(render-video-script|render-still-script|ensure-browser-script|upload-blob-script)$/,
						)?.[1];
						return {
							path: name!,
							namespace: 'script-embed',
						};
					},
				);

				build.onLoad(
					{namespace: 'script-embed', filter: /.*/},
					async (args) => {
						const jsContent = scriptBundles[args.path];
						return {
							contents: `export const script = ${JSON.stringify(jsContent)};`,
							loader: 'ts',
						};
					},
				);
			},
		},
	],
});

if (!output.success) {
	console.log(output.logs.join('\n'));
	process.exit(1);
}

for (const file of output.outputs) {
	const str = await file.text();
	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}

console.timeEnd('Generated.');
