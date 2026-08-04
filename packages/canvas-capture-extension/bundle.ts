import path from 'path';
import {build} from 'bun';

const output = await build({
	entrypoints: ['src/background.ts', 'src/content.ts', 'src/receiver.ts'],
	outdir: 'dist',
	naming: '[name].js',
	target: 'browser',
	format: 'iife',
	splitting: false,
	minify: true,
});

if (!output.success) {
	console.log(output.logs.join('\n'));
	process.exit(1);
}

await Bun.write(path.join('dist', 'manifest.json'), Bun.file('manifest.json'));

console.log('Built Chrome extension in packages/canvas-capture-extension/dist');
