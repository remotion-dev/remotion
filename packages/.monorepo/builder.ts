import {build} from 'bun';
import path from 'path';
import {Exports, validateExports} from './validate-exports';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

type Format = 'esm' | 'cjs';

const getExternal = (deps: string[] | 'dependencies'): string[] => {
	if (deps === 'dependencies') {
		const packageJson = require(path.join(process.cwd(), 'package.json'));
		return Object.keys({
			...(packageJson.dependencies ?? {}),
			...(packageJson.optionalDependencies ?? {}),
		});
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

type FormatAction = 'do-nothing' | 'build' | 'use-tsc';

type EntryPoint = {
	target: 'node' | 'browser';
	path: string;
};

export const buildPackage = async ({
	formats,
	external,
	entrypoints,
}: {
	formats: {
		esm: FormatAction;
		cjs: FormatAction;
	};
	external: 'dependencies' | string[];
	entrypoints: EntryPoint[];
}) => {
	console.time(`Generated.`);
	const pkg = await Bun.file(path.join(process.cwd(), 'package.json')).json();
	const newExports: Exports = {
		'./package.json': './package.json',
	};
	const versions = {};

	const firstNames = entrypoints.map(({path, target}) => {
		const splittedBySlash = path.split('/');
		const last = splittedBySlash[splittedBySlash.length - 1];
		return last.split('.')[0];
	});

	for (const format of ['cjs', 'esm'] as Format[]) {
		const action = formats[format];
		if (action === 'do-nothing') {
			continue;
		} else if (action === 'use-tsc') {
		} else if (action === 'build') {
			for (const {path: p, target} of entrypoints) {
				const output = await build({
					entrypoints: [p],
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
				}
			}
		}

		for (const firstName of firstNames) {
			const exportName = firstName === 'index' ? '.' : './' + firstName;
			const outputName =
				action === 'use-tsc'
					? `./dist/${firstName}.js`
					: `./dist/${format}/${firstName}.${format === 'cjs' ? 'js' : 'mjs'}`;
			newExports[exportName] = sortObject({
				types: `./dist/${firstName}.d.ts`,
				...(format === 'cjs'
					? {
							require: outputName,
						}
					: {}),
				...(format === 'esm'
					? {
							import: outputName,
							module: outputName,
						}
					: {}),
				...(newExports[exportName] && typeof newExports[exportName] === 'object'
					? newExports[exportName]
					: {}),
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
	console.timeEnd(`Generated.`);
};
