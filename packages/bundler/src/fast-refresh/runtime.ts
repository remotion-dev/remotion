/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
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
//
// https://github.com/vercel/next.js/blob/canary/packages/react-refresh-utils/runtime.ts

declare global {
	interface Window {
		$RefreshReg$: (type: string, id?: string) => void;
		$RefreshSig$: () => (type: string) => unknown;
		$RefreshHelpers$: typeof RefreshHelpers;
		$RefreshInterceptModuleExecution$: (webpackId: unknown) => () => void;
	}
}

const RefreshRuntime = require('react-refresh/runtime');
import RefreshHelpers from './helpers';

// Hook into ReactDOM initialization
RefreshRuntime.injectIntoGlobalHook(self);

// noop fns to prevent runtime errors during initialization
self.$RefreshReg$ = () => undefined;
self.$RefreshSig$ = () => (type: unknown) => type;

// Register global helpers
self.$RefreshHelpers$ = RefreshHelpers;

// Register a helper for module execution interception
self.$RefreshInterceptModuleExecution$ = function (webpackModuleId: unknown) {
	const prevRefreshReg = self.$RefreshReg$;
	const prevRefreshSig = self.$RefreshSig$;

	self.$RefreshReg$ = (type, id) => {
		RefreshRuntime.register(type, webpackModuleId + ' ' + id);
	};

	self.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;

	// Modeled after `useEffect` cleanup pattern:
	return () => {
		self.$RefreshReg$ = prevRefreshReg;
		self.$RefreshSig$ = prevRefreshSig;
	};
};
