// Suppress the frequent Webpack warnings about serializing large strings in the cache

import type {Compiler} from 'webpack';

export class IgnorePackFileCacheWarningsPlugin {
	filter(error: Error) {
		if (error.message.includes('Serializing big strings')) {
			return false;
		}

		return true;
	}

	apply(compiler: Compiler) {
		compiler.hooks.afterCompile.tap(
			'IgnorePackFileCacheWarningsPlugin',
			(compilation) => {
				compilation.warnings = compilation.warnings.filter(this.filter);
			},
		);
		compiler.hooks.afterEmit.tap(
			'IgnorePackFileCacheWarningsPlugin',
			(compilation) => {
				compilation.warnings = compilation.warnings.filter(this.filter);
			},
		);
	}
}
