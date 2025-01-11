/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';

type ContextValue = {
	/** Current color mode. */
	readonly colorMode: ColorMode;
	/** Set new color mode. */
	readonly setColorMode: (colorMode: ColorMode) => void;

	// TODO legacy APIs kept for retro-compatibility: deprecate them
	readonly isDarkTheme: boolean;
	readonly setLightTheme: () => void;
	readonly setDarkTheme: () => void;
};

const Context = React.createContext<ContextValue | undefined>(undefined);

const ColorModeStorageKey = 'theme';

const ColorModes = {
	light: 'light',
	dark: 'dark',
} as const;

export type ColorMode = (typeof ColorModes)[keyof typeof ColorModes];

// Ensure to always return a valid colorMode even if input is invalid
const coerceToColorMode = (colorMode?: string | null): ColorMode =>
	colorMode === ColorModes.dark ? ColorModes.dark : ColorModes.light;

const getInitialColorMode = (): ColorMode =>
	coerceToColorMode(
		typeof document === 'undefined'
			? 'light'
			: document.documentElement.getAttribute('data-theme'),
	);

const storeColorMode = (newColorMode: ColorMode) => {
	window.localStorage.set('theme', coerceToColorMode(newColorMode));
};

function useContextValue(): ContextValue {
	const [colorMode, setColorModeState] = useState(getInitialColorMode());

	const setColorMode = useCallback(
		(newColorMode: ColorMode | null, options: {persist?: boolean} = {}) => {
			const {persist = true} = options;
			if (newColorMode) {
				setColorModeState(newColorMode);
				if (persist) {
					storeColorMode(newColorMode);
				}
			} else {
				setColorModeState(
					window.matchMedia('(prefers-color-scheme: dark)').matches
						? ColorModes.dark
						: ColorModes.light,
				);

				window.localStorage.del('theme');
			}
		},
		[],
	);

	useEffect(() => {
		document.documentElement.setAttribute(
			'data-theme',
			coerceToColorMode(colorMode),
		);
	}, [colorMode]);

	useEffect(() => {
		const onChange = (e: StorageEvent) => {
			if (e.key !== ColorModeStorageKey) {
				return;
			}

			const storedColorMode = window.localStorage.getItem('theme');
			if (storedColorMode !== null) {
				setColorMode(coerceToColorMode(storedColorMode));
			}
		};

		window.addEventListener('storage', onChange);
		return () => window.removeEventListener('storage', onChange);
	}, [setColorMode]);

	// PCS is coerced to light mode when printing, which causes the color mode to
	// be reset to dark when exiting print mode, disregarding user settings. When
	// the listener fires only because of a print/screen switch, we don't change
	// color mode. See https://github.com/facebook/docusaurus/pull/6490
	const previousMediaIsPrint = useRef(false);

	useEffect(() => {
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = () => {
			if (window.matchMedia('print').matches || previousMediaIsPrint.current) {
				previousMediaIsPrint.current = window.matchMedia('print').matches;
				return;
			}

			setColorMode(null);
		};

		mql.addListener(onChange);
		return () => mql.removeListener(onChange);
	}, [setColorMode]);

	return useMemo(
		() => ({
			colorMode,
			setColorMode,
			get isDarkTheme() {
				if (process.env.NODE_ENV === 'development') {
					// eslint-disable-next-line no-console
					console.error(
						'`useColorMode().isDarkTheme` is deprecated. Please use `useColorMode().colorMode === "dark"` instead.',
					);
				}

				return colorMode === ColorModes.dark;
			},
			setLightTheme() {
				if (process.env.NODE_ENV === 'development') {
					// eslint-disable-next-line no-console
					console.error(
						'`useColorMode().setLightTheme` is deprecated. Please use `useColorMode().setColorMode("light")` instead.',
					);
				}

				setColorMode(ColorModes.light);
			},
			setDarkTheme() {
				if (process.env.NODE_ENV === 'development') {
					// eslint-disable-next-line no-console
					console.error(
						'`useColorMode().setDarkTheme` is deprecated. Please use `useColorMode().setColorMode("dark")` instead.',
					);
				}

				setColorMode(ColorModes.dark);
			},
		}),
		[colorMode, setColorMode],
	);
}

export function ColorModeProvider({
	children,
}: {
	children: ReactNode;
}): ReactNode {
	const value = useContextValue();
	return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useColorMode(): ContextValue {
	const context = useContext(Context);
	if (context === null || context === undefined) {
		throw new Error('ColorModeProvider');
	}

	return context;
}
