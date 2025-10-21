import {build} from 'bun';
import path from 'path';
import {Exports, validateExports} from './validate-exports';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

type Format = 'esm' | 'cjs';

const getPackageJson = () => {
	return require(path.join(process.cwd(), 'package.json'));
};

const getDependenciesAndPeerAndOptionalDependencies = () => {
	const packageJson = getPackageJson();

	return {
		...(packageJson.dependencies ?? {}),
		...(packageJson.optionalDependencies ?? {}),
		...(packageJson.peerDependencies ?? {}),
	};
};

const getExternal = (deps: string[] | 'dependencies'): string[] => {
	if (deps === 'dependencies') {
		return Object.keys(getDependenciesAndPeerAndOptionalDependencies());
	}

	return deps;
};

// Turn @remotion/renderer/client into @remotion/renderer
// and remotion/no-react into remotion
// but leave @remotion/player alone
const stripEntryPoints = (packageName: string) => {
	const splitted = packageName.split('/');
	if (splitted[0].startsWith('@')) {
		return splitted[0] + '/' + splitted[1];
	}

	return splitted[0];
};

const validateExternal = (external: string[]) => {
	const packageJson = Object.keys(
		getDependenciesAndPeerAndOptionalDependencies(),
	);
	for (const dep of external) {
		if (dep === 'stream' || dep === 'fs' || dep === 'path') {
			continue;
		}
		if (dep.startsWith('.')) {
			continue;
		}
		if (!packageJson.includes(stripEntryPoints(dep))) {
			throw new Error(
				`External dependency ${stripEntryPoints(dep)} not found in package.json`,
			);
		}
	}
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
	splitting?: boolean;
};

export const buildPackage = async ({
	formats,
	external,
	entrypoints,
	filterExternal = (external) => external,
}: {
	formats: {
		esm: FormatAction;
		cjs: FormatAction;
	};
	external: 'dependencies' | string[];
	filterExternal?: (external: string[]) => string[];
	entrypoints: EntryPoint[];
}) => {
	console.time(`Generated.`);
	const pkg = await Bun.file(path.join(process.cwd(), 'package.json')).json();
	const newExports: Exports = {
		...(pkg.exports ?? {}),
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
			for (const {path: p, target, splitting} of entrypoints) {
				const externalFinal = filterExternal(getExternal(external));
				validateExternal(externalFinal);
				const output = await build({
					entrypoints: [p],
					naming: `[name].${format === 'esm' ? 'mjs' : 'js'}`,
					external: externalFinal,
					target,
					format,
					splitting: splitting ?? false,
				});

				for (const file of output.outputs) {
					const text = await file.text();

					const outputPath = `./${path.join('./dist', format, file.path.replace('.module.', '.'))}`;

					await Bun.write(path.join(process.cwd(), outputPath), text);

					if (text.includes('jonathanburger')) {
						throw new Error('Absolute path was included, see ' + outputPath);
					}
				}
			}
		}

		for (const firstName of firstNames) {
			const exportName = firstName === 'index' ? '.' : './' + firstName;
			const tsConfig = await Bun.file(
				path.join(process.cwd(), 'tsconfig.json'),
			).json();
			let cjsOutDir = tsConfig.compilerOptions.outDir ?? './dist';
			if (!cjsOutDir.startsWith('./')) {
				cjsOutDir = './' + cjsOutDir;
			}
			const outputName =
				action === 'use-tsc'
					? `${cjsOutDir}/${firstName}.js`
					: `./dist/${format}/${firstName}.${format === 'cjs' ? 'js' : 'mjs'}`;
			console.log({outputName});
			newExports[exportName] = sortObject({
				types: `${cjsOutDir}/${firstName}.d.ts`,
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
				versions[firstName] = [`${cjsOutDir}/${firstName}.d.ts`];
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
					? {
							typesVersions: {
								'>=1.0': {
									...(pkg.typesVersions?.['>=1.0'] ?? {}),
									...versions,
								},
							},
						}
					: {}),
			},
			null,
			'\t',
		) + '\n',
	);
	console.timeEnd(`Generated.`);
};
