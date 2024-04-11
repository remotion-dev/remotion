/**
 * ⚠️ Be careful when refactoring this file!
 * This gets injected into every file of the browser.
 * You cannot have returns, optional chains, inverse the if statement etc.
 * Check the Typescript output in dist/ to see that no extra `var` statements were produced
 */

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

import type {LoaderDefinition} from 'webpack';

declare global {
	const __webpack_hash__: unknown;

	interface HotNotifierInfo {
		type:
			| 'self-declined'
			| 'declined'
			| 'unaccepted'
			| 'accepted'
			| 'disposed'
			| 'accept-errored'
			| 'self-accept-errored'
			| 'self-accept-error-handler-errored';
		/**
		 * The module in question.
		 */
		moduleId: number;
		/**
		 * For errors: the module id owning the accept handler.
		 */
		dependencyId?: number | undefined;
		/**
		 * For declined/accepted/unaccepted: the chain from where the update was propagated.
		 */
		chain?: number[] | undefined;
		/**
		 * For declined: the module id of the declining parent
		 */
		parentId?: number | undefined;
		/**
		 * For accepted: the modules that are outdated and will be disposed
		 */
		outdatedModules?: number[] | undefined;
		/**
		 * For accepted: The location of accept handlers that will handle the update
		 */
		outdatedDependencies?:
			| {
					[dependencyId: number]: number[];
			  }
			| undefined;
		/**
		 * For errors: the thrown error
		 */
		error?: Error | undefined;
		/**
		 * For self-accept-error-handler-errored: the error thrown by the module
		 * before the error handler tried to handle it.
		 */
		originalError?: Error | undefined;
	}

	interface AcceptOptions {
		/**
		 * If true the update process continues even if some modules are not accepted (and would bubble to the entry point).
		 */
		ignoreUnaccepted?: boolean | undefined;
		/**
		 * Ignore changes made to declined modules.
		 */
		ignoreDeclined?: boolean | undefined;
		/**
		 *  Ignore errors throw in accept handlers, error handlers and while reevaluating module.
		 */
		ignoreErrored?: boolean | undefined;
		/**
		 * Notifier for declined modules.
		 */
		onDeclined?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for unaccepted modules.
		 */
		onUnaccepted?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for accepted modules.
		 */
		onAccepted?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for disposed modules.
		 */
		onDisposed?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for errors.
		 */
		onErrored?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Indicates that apply() is automatically called by check function
		 */
		autoApply?: boolean | undefined;
	}
	const __webpack_module__: {
		id: string;
		exports: unknown;
		hot: {
			accept: () => void;
			dispose: (onDispose: (data: Record<string, unknown>) => void) => void;
			invalidate: () => void;
			data?: Record<string, unknown>;
			addStatusHandler(callback: (status: string) => void): void;
			status(): string;
			apply(options?: AcceptOptions): Promise<ModuleId[]>;
			check(autoApply?: boolean): Promise<null | ModuleId[]>;
		};
	};
	type ModuleId = string | number;
}

// This file is copied from the @vercel/next.js, with removed TS annotations
//
// https://github.com/vercel/next.js/blob/canary/packages/react-refresh-utils/loader.ts

// This function gets unwrapped into global scope, which is why we don't invert
// if-blocks. Also, you cannot use `return`.
function RefreshModuleRuntime() {
	// Legacy CSS implementations will `eval` browser code in a Node.js context
	// to extract CSS. For backwards compatibility, we need to check we're in a
	// browser context before continuing.
	if (
		typeof self !== 'undefined' &&
		// AMP / No-JS mode does not inject these helpers:
		'$RefreshHelpers$' in self
	) {
		const currentExports = __webpack_module__.exports;
		const prevExports = __webpack_module__.hot.data?.prevExports ?? null;

		// This cannot happen in MainTemplate because the exports mismatch between
		// templating and execution.
		self.$RefreshHelpers$.registerExportsForReactRefresh(
			currentExports,
			__webpack_module__.id,
		);

		// A module can be accepted automatically based on its exports, e.g. when
		// it is a Refresh Boundary.
		if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
			// Save the previous exports on update so we can compare the boundary
			// signatures.
			__webpack_module__.hot.dispose((data) => {
				data.prevExports = currentExports;
			});
			// Unconditionally accept an update to this module, we'll check if it's
			// still a Refresh Boundary later.
			__webpack_module__.hot.accept();

			// This field is set when the previous version of this module was a
			// Refresh Boundary, letting us know we need to check for invalidation or
			// enqueue an update.
			if (prevExports !== null) {
				// A boundary can become ineligible if its exports are incompatible
				// with the previous exports.
				//
				// For example, if you add/remove/change exports, we'll want to
				// re-execute the importing modules, and force those components to
				// re-render. Similarly, if you convert a class component to a
				// function, we want to invalidate the boundary.
				if (
					self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(
						prevExports,
						currentExports,
					)
				) {
					__webpack_module__.hot.invalidate();
				} else {
					self.$RefreshHelpers$.scheduleUpdate();
				}
			}
		} else {
			// Since we just executed the code for the module, it's possible that the
			// new exports made it ineligible for being a boundary.
			// We only care about the case when we were _previously_ a boundary,
			// because we already accepted this update (accidental side effect).
			const isNoLongerABoundary = prevExports !== null;
			if (isNoLongerABoundary) {
				__webpack_module__.hot.invalidate();
			}
		}
	}
}

let refreshModuleRuntime = RefreshModuleRuntime.toString();
refreshModuleRuntime = refreshModuleRuntime.slice(
	refreshModuleRuntime.indexOf('{') + 1,
	refreshModuleRuntime.lastIndexOf('}'),
);

const ReactRefreshLoader: LoaderDefinition = function (source, inputSourceMap) {
	// Importing a module that declares the global variables _a and _b
	// will conflict with the global variables that React Fast Refresh uses.

	// https://github.com/remotion-dev/remotion/issues/3699
	const renamedSymbols = refreshModuleRuntime
		.replace(/_a/g, '_remotion_globalVariableA')
		.replace(/_b/g, '_remotion_globalVariableB');

	this.callback(null, `${source}\n;${renamedSymbols}`, inputSourceMap);
};

export default ReactRefreshLoader;
