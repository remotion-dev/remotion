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
		// @ts-expect-error
		// eslint-disable-next-line no-proto
		const currentExports = module.__proto__.exports;
		let prevExports = null;

		// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
		if (module.hot && module.hot.data && module.hot.data.prevExports) {
			prevExports = module.hot.data.prevExports;
		}

		// This cannot happen in MainTemplate because the exports mismatch between
		// templating and execution.
		self.$RefreshHelpers$.registerExportsForReactRefresh(
			currentExports,
			module.id
		);

		// A module can be accepted automatically based on its exports, e.g. when
		// it is a Refresh Boundary.
		if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
			// Save the previous exports on update so we can compare the boundary
			// signatures.
			(module.hot as __WebpackModuleApi.Hot).dispose((data) => {
				data.prevExports = currentExports;
			});
			// Unconditionally accept an update to this module, we'll check if it's
			// still a Refresh Boundary later.
			(module.hot as __WebpackModuleApi.Hot).accept();

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
						currentExports
					)
				) {
					// @ts-expect-error
					(module.hot as __WebpackModuleApi.Hot).invalidate();
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
				// @ts-expect-error
				(module.hot as __WebpackModuleApi).invalidate();
			}
		}
	}
}

let refreshModuleRuntime = RefreshModuleRuntime.toString();
refreshModuleRuntime = refreshModuleRuntime.slice(
	refreshModuleRuntime.indexOf('{') + 1,
	refreshModuleRuntime.lastIndexOf('}')
);

const ReactRefreshLoader: LoaderDefinition = function (source, inputSourceMap) {
	this.callback(null, `${source}\n\n;${refreshModuleRuntime}`, inputSourceMap);
};

export default ReactRefreshLoader;
