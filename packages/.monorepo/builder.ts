import {build} from 'bun';
import {existsSync} from 'node:fs';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

type Format = 'esm' | 'cjs';

const validateExports = (
	exports: Record<string, './package.json' | Record<string, string>>,
) => {
	const keys = Object.keys(exports);
	for (const key of keys) {
		const value = exports[key];
		if (key === './package.json' && value === './package.json') {
			continue;
		}

		if (typeof value === 'string') {
			throw new Error(`Invalid export for ${key}`);
		}

		if (!value.import || !value.require || !value.module || !value) {
			throw new Error(`Missing import or require for ${key}`);
		}
		const paths = Object.keys(value);
		for (const entry of paths) {
			if (
				entry !== 'import' &&
				entry !== 'require' &&
				entry !== 'module' &&
				entry !== 'types'
			) {
				console.log(exports);
				throw new Error(`Invalid export: ${entry}`);
			}
			const pathToCheck = path.join(process.cwd(), value[entry]);
			const exists = existsSync(pathToCheck);
			if (!exists) {
				throw new Error(`Path does not exist: ${pathToCheck}`);
			}
		}
	}
};

const getExternal = (deps: string[] | 'dependencies'): string[] => {
	if (deps === 'dependencies') {
		return Object.keys(
			require(path.join(process.cwd(), 'package.json')).dependencies,
		);
	}

	return deps;
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
	const newExports = {
		...pkg.exports,
	};

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

			const outputPath = './' + path.join('./dist', format, file.path);
			const typesOutputPath =
				'./' +
				path.join(
					'./dist',
					file.path.replace('.mjs', '.d.ts').replace('.js', '.d.ts'),
				);
			await Bun.write(path.join(process.cwd(), outputPath), text);

			if (text.includes('jonathanburger')) {
				throw new Error('Absolute path was included, see ' + outputPath);
			}

			const firstName = file.path.split('.')[1].slice(1);
			const exportName = firstName === 'index' ? '.' : './' + firstName;
			newExports[exportName] = {
				...(newExports[exportName] ?? {}),
				types: typesOutputPath,
				...(format === 'esm'
					? {
							import: outputPath,
							module: outputPath,
						}
					: {}),
				...(format === 'cjs'
					? {
							require: outputPath,
						}
					: {}),
			};
		}
	}
	validateExports(newExports);
	await Bun.write(
		path.join(process.cwd(), 'package.json'),
		JSON.stringify(
			{
				...pkg,
				exports: newExports,
			},
			null,
			'\t',
		) + '\n',
	);
	console.timeEnd(`Generated ${formats.join(', ')}.`);
};
