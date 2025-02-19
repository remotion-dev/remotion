/**
 * Source code is adapted from https://github.com/WebHotelier/webpack-fast-refresh#readme and rewritten in Typescript. This file is MIT licensed.
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Vercel, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// This file is copied from the @vercel/next.js, with removed TS annotations
// minor tweaks, and removed all webpack v4-related functionality
//
// https://github.com/vercel/next.js/blob/canary/packages/react-refresh-utils/ReactRefreshWebpackPlugin.ts

import type webpack from 'webpack';
import type {Compilation} from 'webpack';
import {RuntimeGlobals, RuntimeModule, Template, version} from 'webpack';

class ReactRefreshRuntimeModule extends RuntimeModule {
	constructor() {
		super('react refresh', 5);
	}

	generate() {
		const {runtimeTemplate} = this.compilation as Compilation;
		return Template.asString([
			`${
				RuntimeGlobals.interceptModuleExecution
			}.push(${runtimeTemplate.basicFunction('options', [
				`const originalFactory = options.factory;`,
				`options.factory = ${runtimeTemplate.basicFunction(
					'moduleObject, moduleExports, webpackRequire',
					[
						// Legacy CSS implementations will `eval` browser code in a Node.js
						// context to extract CSS. For backwards compatibility, we need to check
						// we're in a browser context before continuing.
						`const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;`,
						`const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};`,
						'try {',
						Template.indent(
							'originalFactory.call(this, moduleObject, moduleExports, webpackRequire);',
						),
						'} finally {',
						Template.indent(`cleanup();`),
						'}',
					],
				)}`,
			])})`,
		]);
	}
}

export class ReactFreshWebpackPlugin {
	apply(compiler: webpack.Compiler) {
		const webpackMajorVersion = parseInt(version ?? '', 10);

		if (webpackMajorVersion < 5) {
			throw new Error(
				`ReactFreshWebpackPlugin does not support webpack v${webpackMajorVersion}.`,
			);
		}

		compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
			compilation.mainTemplate.hooks.localVars.tap(
				this.constructor.name,
				(source) =>
					Template.asString([
						source,
						'',
						'// noop fns to prevent runtime errors during initialization',
						'if (typeof self !== "undefined") {',
						Template.indent('self.$RefreshReg$ = function () {};'),
						Template.indent('self.$RefreshSig$ = function () {'),
						Template.indent(Template.indent('return function (type) {')),
						Template.indent(Template.indent(Template.indent('return type;'))),
						Template.indent(Template.indent('};')),
						Template.indent('};'),
						'}',
					]),
			);

			compilation.hooks.additionalTreeRuntimeRequirements.tap(
				this.constructor.name,
				(chunk) => {
					compilation.addRuntimeModule(chunk, new ReactRefreshRuntimeModule());
				},
			);
		});
	}
}
