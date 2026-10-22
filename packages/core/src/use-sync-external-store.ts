/**
 * @license React
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Adapted from use-sync-external-store 1.5.0.
 */

import * as React from 'react';

type UseSyncExternalStore = <TSnapshot>(
	subscribe: (onStoreChange: () => void) => () => void,
	getSnapshot: () => TSnapshot,
	getServerSnapshot?: () => TSnapshot,
) => TSnapshot;

type StoreInstance<TSnapshot> = {
	value: TSnapshot;
	getSnapshot: () => TSnapshot;
};

const objectIs =
	typeof Object.is === 'function'
		? Object.is
		: (first: unknown, second: unknown) =>
				(first === second &&
					(first !== 0 || 1 / (first as number) === 1 / (second as number))) ||
				(Number.isNaN(first) && Number.isNaN(second));

let didWarnAboutUncachedGetSnapshot = false;

const checkIfSnapshotChanged = <TSnapshot>(
	instance: StoreInstance<TSnapshot>,
): boolean => {
	try {
		return !objectIs(instance.value, instance.getSnapshot());
	} catch {
		return true;
	}
};

const useSyncExternalStoreShimClient: UseSyncExternalStore = (
	subscribe,
	getSnapshot,
) => {
	const value = getSnapshot();

	if (
		process.env.NODE_ENV !== 'production' &&
		!didWarnAboutUncachedGetSnapshot &&
		!objectIs(value, getSnapshot())
	) {
		// eslint-disable-next-line no-console
		console.error(
			'The result of getSnapshot should be cached to avoid an infinite loop',
		);
		didWarnAboutUncachedGetSnapshot = true;
	}

	const [{instance}, forceUpdate] = React.useState({
		instance: {value, getSnapshot},
	});

	React.useLayoutEffect(() => {
		instance.value = value;
		instance.getSnapshot = getSnapshot;

		if (checkIfSnapshotChanged(instance)) {
			forceUpdate({instance});
		}
	}, [getSnapshot, instance, subscribe, value]);

	React.useEffect(() => {
		if (checkIfSnapshotChanged(instance)) {
			forceUpdate({instance});
		}

		return subscribe(() => {
			if (checkIfSnapshotChanged(instance)) {
				forceUpdate({instance});
			}
		});
	}, [instance, subscribe]);

	React.useDebugValue(value);
	return value;
};

const useSyncExternalStoreShimServer: UseSyncExternalStore = (
	_subscribe,
	getSnapshot,
) => getSnapshot();

const shim =
	typeof window === 'undefined' ||
	typeof window.document === 'undefined' ||
	typeof window.document.createElement === 'undefined'
		? useSyncExternalStoreShimServer
		: useSyncExternalStoreShimClient;

export const useSyncExternalStore: UseSyncExternalStore =
	React.useSyncExternalStore ?? shim;
