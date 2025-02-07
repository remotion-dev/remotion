import {build} from 'bun';
import path from 'path';
import {validateExports} from './validate-exports';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

type Format = 'esm' | 'cjs';

const getExternal = (deps: string[] | 'dependencies'): string[] => {
	if (deps === 'dependencies') {
		return Object.keys(
			require(path.join(process.cwd(), 'package.json')).dependencies,
		);
	}

	return deps;
};

const sortObject = (obj: Record<string, string>) => {
	return {
		...(obj.types !== undefined && {types: obj.types}),
		...(obj.require !== undefined && {require: obj.require}),
		...(obj.module !== undefined && {module: obj.module}),
		...(obj.import !== undefined && {import: obj.import}),
	};
};

export const buildPackage = async ({
	formats,
	external,
	target,
	entrypoints,
}: {
	formats: Format[];
	external: 'dependencies' | string[];
	target: 'node' | 'browser';
	entrypoints: string[];
}) => {
	console.time(`Generated ${formats.join(', ')}.`);
	const pkg = await Bun.file(path.join(process.cwd(), 'package.json')).json();
	const newExports = {};
	const versions = {};

	for (const format of formats) {
		const output = await build({
			entrypoints: entrypoints.map((e) => path.join(process.cwd(), e)),
			naming: `[name].${format === 'esm' ? 'mjs' : 'js'}`,
			external: getExternal(external),
			target,
			format,
		});

		for (const file of output.outputs) {
			const text = await file.text();

			const outputPath = `./${path.join('./dist', format, file.path)}`;

			await Bun.write(path.join(process.cwd(), outputPath), text);

			if (text.includes('jonathanburger')) {
				throw new Error('Absolute path was included, see ' + outputPath);
			}

			const firstName = file.path.split('.')[1].slice(1);
			const exportName = firstName === 'index' ? '.' : './' + firstName;
			newExports[exportName] = sortObject({
				types: `./dist/${firstName}.d.ts`,
				...(format === 'cjs'
					? {
							require: outputPath,
						}
					: {}),
				...(format === 'esm'
					? {
							import: outputPath,
							module: outputPath,
						}
					: {}),
				...(newExports[exportName] ?? {}),
			});
			if (firstName !== 'index') {
				versions[firstName] = [`dist/${firstName}.d.ts`];
			}
		}
	}
	validateExports(newExports);
	await Bun.write(
		path.join(process.cwd(), 'package.json'),
		JSON.stringify(
			{
				...pkg,
				exports: newExports,
				...(Object.keys(versions).length > 0
					? {typesVersions: {'>=1.0': versions}}
					: {}),
			},
			null,
			'\t',
		) + '\n',
	);
	console.timeEnd(`Generated ${formats.join(', ')}.`);
};
