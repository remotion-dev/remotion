/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useContext, useMemo, type ReactNode} from 'react';

type ContextValue = {
	/** Current color mode. */
	readonly colorMode: ColorMode;
	/** Set new color mode. */
	readonly setColorMode: (colorMode: ColorMode) => void;
};

const Context = React.createContext<ContextValue | undefined>(undefined);

export type ColorMode = 'light' | 'dark';

export const ColorModeProvider = ({
	children,
	colorMode,
	setColorMode,
}: {
	readonly children: React.ReactNode;
	readonly setColorMode: (colorMode: ColorMode) => void;
	readonly colorMode: ColorMode;
}): ReactNode => {
	const value: ContextValue = useMemo(() => {
		return {colorMode, setColorMode};
	}, [colorMode, setColorMode]);

	return <Context.Provider value={value}>{children}</Context.Provider>;
};

export function useColorMode(): ContextValue {
	const context = useContext(Context);
	if (context === null || context === undefined) {
		throw new Error('ColorModeProvider');
	}

	return context;
}
