// When Webpack cannot resolve these dependencies, it will not print an error message.

import type {Compiler} from 'webpack';
import type {webpack} from '.';

const OPTIONAL_DEPENDENCIES = [
	'zod',
	'@remotion/zod-types',
	'react-native-reanimated',
	'react-native-reanimated/package.json',
];

const SOURCE_MAP_IGNORE = ['path', 'fs'];

export class AllowOptionalDependenciesPlugin {
	checkIgnore = (resolveData: webpack.ResolveData) => {
		if (OPTIONAL_DEPENDENCIES.includes(resolveData.request)) {
			return false;
		}

		if (
			resolveData.context.includes('source-map') &&
			SOURCE_MAP_IGNORE.includes(resolveData.request)
		) {
			return false;
		}
	};

	filter(error: Error) {
		for (const dependency of OPTIONAL_DEPENDENCIES) {
			if (error.message.includes(`Can't resolve '${dependency}'`)) {
				return false;
			}
		}

		for (const dependency of SOURCE_MAP_IGNORE) {
			if (
				error.message.includes(`Can't resolve '${dependency}'`) &&
				error.message.includes('source-map')
			) {
				return false;
			}
		}

		return true;
	}

	apply(compiler: Compiler) {
		compiler.hooks.afterEmit.tap(
			'AllowOptionalDependenciesPlugin',
			(compilation) => {
				compilation.errors = compilation.errors.filter(this.filter);
				compilation.warnings = compilation.warnings.filter(this.filter);
			},
		);
		compiler.hooks.normalModuleFactory.tap(
			'AllowOptionalDependenciesPlugin',
			(nmf) => {
				nmf.hooks.beforeResolve.tap(
					'AllowOptionalDependenciesPlugin',
					this.checkIgnore,
				);
			},
		);
		compiler.hooks.contextModuleFactory.tap(
			'AllowOptionalDependenciesPlugin',
			(cmf) => {
				cmf.hooks.beforeResolve.tap(
					'AllowOptionalDependenciesPlugin',
					this.checkIgnore,
				);
			},
		);
	}
}
