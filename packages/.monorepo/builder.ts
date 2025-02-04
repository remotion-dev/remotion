import {build} from 'bun';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

type Format = 'esm' | 'cjs';

export const buildPackage = async ({
	formats,
	external,
	target,
	entrypoints,
}: {
	formats: Format[];
	external: string[];
	target: 'node' | 'browser';
	entrypoints: string[];
}) => {
	for (const format of formats) {
		console.time(`Generated ${format}.`);
		const output = await build({
			entrypoints: entrypoints.map((e) => path.join(process.cwd(), e)),
			naming: `[name].${format === 'esm' ? 'mjs' : 'js'}`,
			external,
			target,
			format,
		});
		if (!output.success) {
			throw new Error('Build failed');
		}

		const [file] = output.outputs;
		const text = await file.text();

		await Bun.write(
			`dist/${format}/index.${format === 'esm' ? 'mjs' : 'js'}`,
			text,
		);
		console.timeEnd(`Generated ${format}.`);
	}
};
