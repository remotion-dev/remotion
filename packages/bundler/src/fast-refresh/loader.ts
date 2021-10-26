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
		// @ts-expect-errors
		// eslint-disable-next-line no-proto
		const currentExports = module.__proto__.exports;
		let prevExports = null;

		if (module.hot?.data?.prevExports) {
			prevExports = module.hot.data.prevExports;
		}

		// This cannot happen in MainTemplate because the exports mismatch between
		// templating and execution.
		// @ts-expect-error
		self.$RefreshHelpers$.registerExportsForReactRefresh(
			currentExports,
			module.id
		);

		// A module can be accepted automatically based on its exports, e.g. when
		// it is a Refresh Boundary.
		// @ts-expect-error
		if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
			// Save the previous exports on update so we can compare the boundary
			// signatures.
			// @ts-expect-errors
			module.hot.dispose((data) => {
				data.prevExports = currentExports;
			});
			// Unconditionally accept an update to this module, we'll check if it's
			// still a Refresh Boundary later.
			// @ts-expect-errors
			module.hot.accept();

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
					// @ts-expect-error
					self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(
						prevExports,
						currentExports
					)
				) {
					// @ts-expect-errors
					module.hot.invalidate();
				} else {
					// @ts-expect-errors
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
				// @ts-expect-errors
				module.hot.invalidate();
			}
		}
	}
}

let refreshModuleRuntime = RefreshModuleRuntime.toString();
refreshModuleRuntime = refreshModuleRuntime.slice(
	refreshModuleRuntime.indexOf('{') + 1,
	refreshModuleRuntime.lastIndexOf('}')
);
// eslint-disable-next-line func-names
module.exports = function ReactRefreshLoader(source: any, inputSourceMap: any) {
	// @ts-expect-error
	this.callback(null, `${source}\n\n;${refreshModuleRuntime}`, inputSourceMap);
};
