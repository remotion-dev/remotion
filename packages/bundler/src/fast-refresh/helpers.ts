/**
 * Source code is adapted from https://github.com/WebHotelier/webpack-fast-refresh#readme and rewritten in Typescript. This file is MIT licensed.
 */
/**
 * MIT License
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
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

// This file is copied from the Metro JavaScript bundler, with minor tweaks for
// webpack compatibility.
//
// https://github.com/facebook/metro/blob/d6b9685c730d0d63577db40f41369157f28dfa3a/packages/metro/src/lib/polyfills/require.js

const RefreshRuntime = require('react-refresh/runtime');

function isSafeExport(key: string) {
	return (
		key === '__esModule' ||
		key === '__N_SSG' ||
		key === '__N_SSP' ||
		key === 'config'
	);
}

function registerExportsForReactRefresh(
	moduleExports: unknown,
	moduleID: unknown,
) {
	RefreshRuntime.register(moduleExports, moduleID + ' %exports%');
	if (
		moduleExports === null ||
		moduleExports === undefined ||
		typeof moduleExports !== 'object'
	) {
		// Exit if we can't iterate over exports.
		// (This is important for legacy environments.)
		return;
	}

	for (const key in moduleExports) {
		if (isSafeExport(key)) {
			continue;
		}

		// @ts-expect-error
		const exportValue = moduleExports[key];
		const typeID = moduleID + ' %exports% ' + key;
		RefreshRuntime.register(exportValue, typeID);
	}
}

function isReactRefreshBoundary(moduleExports: unknown) {
	if (RefreshRuntime.isLikelyComponentType(moduleExports)) {
		return true;
	}

	if (
		moduleExports === null ||
		moduleExports === undefined ||
		typeof moduleExports !== 'object'
	) {
		// Exit if we can't iterate over exports.
		return false;
	}

	let hasExports = false;
	let areAllExportsComponents = true;
	for (const key in moduleExports) {
		hasExports = true;
		if (isSafeExport(key)) {
			continue;
		}

		// @ts-expect-error
		const exportValue = moduleExports[key];
		if (!RefreshRuntime.isLikelyComponentType(exportValue)) {
			areAllExportsComponents = false;
		}
	}

	return hasExports && areAllExportsComponents;
}

function getRefreshBoundarySignature(moduleExports: unknown) {
	const signature = [];
	signature.push(RefreshRuntime.getFamilyByType(moduleExports));
	if (
		moduleExports === null ||
		moduleExports === undefined ||
		typeof moduleExports !== 'object'
	) {
		// Exit if we can't iterate over exports.
		// (This is important for legacy environments.)
		return signature;
	}

	for (const key in moduleExports) {
		if (isSafeExport(key)) {
			continue;
		}

		// @ts-expect-error
		const exportValue = moduleExports[key];
		signature.push(key);
		signature.push(RefreshRuntime.getFamilyByType(exportValue));
	}

	return signature;
}

function shouldInvalidateReactRefreshBoundary(
	prevExports: unknown,
	nextExports: unknown,
) {
	const prevSignature = getRefreshBoundarySignature(prevExports);
	const nextSignature = getRefreshBoundarySignature(nextExports);
	if (prevSignature.length !== nextSignature.length) {
		return true;
	}

	for (let i = 0; i < nextSignature.length; i++) {
		if (prevSignature[i] !== nextSignature[i]) {
			return true;
		}
	}

	return false;
}

function scheduleUpdate() {
	const execute = () => {
		try {
			RefreshRuntime.performReactRefresh();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn(
				'Warning: Failed to re-render. We will retry on the next Fast Refresh event.\n' +
					err,
			);
		}
	};

	// Only trigger refresh if the webpack HMR state is idle
	if (__webpack_module__.hot?.status() === 'idle') {
		return;
	}

	__webpack_module__.hot?.addStatusHandler((status) => {
		if (status === 'idle') {
			execute();
		}
	});
}

export default {
	registerExportsForReactRefresh,
	isReactRefreshBoundary,
	shouldInvalidateReactRefreshBoundary,
	getRefreshBoundarySignature,
	scheduleUpdate,
};
