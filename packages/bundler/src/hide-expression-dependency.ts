// When Webpack cannot resolve these dependencies, it will not print an error message.

import type {Compiler} from '@rspack/core';

// If importing TypeScript, it will give this warning:
// WARNING in ./node_modules/typescript/lib/typescript.js 6304:33-52
// Critical dependency: the request of a dependency is an expression
export class AllowDependencyExpressionPlugin {
	filter(error: Error) {
		if (
			error.message.includes('the request of a dependency is an expression')
		) {
			return false;
		}

		return true;
	}

	apply(compiler: Compiler) {
		compiler.hooks.afterCompile.tap('Com', (compilation) => {
			// @ts-expect-error
			compilation.errors = compilation.errors.filter(this.filter);
		});
		compiler.hooks.afterEmit.tap(
			'AllowOptionalDependenciesPlugin',
			(compilation) => {
				// @ts-expect-error
				compilation.errors = compilation.errors.filter(this.filter);
				// @ts-expect-error
				compilation.warnings = compilation.warnings.filter(this.filter);
			},
		);
	}
}
