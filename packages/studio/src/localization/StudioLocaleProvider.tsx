import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import type {Locale, MessageKey} from './messages';
import {loadLocale, saveLocale} from './storage';
import {createTranslator, type MessageValues} from './translate';

export type StudioTranslator = (
	key: MessageKey,
	values?: MessageValues,
) => string;

type StudioLocaleContextValue = {
	readonly locale: Locale;
	readonly setLocale: (locale: Locale) => void;
	readonly t: StudioTranslator;
};

const StudioLocaleContext = createContext<StudioLocaleContextValue | null>(
	null,
);

export const StudioLocaleProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly initialLocale?: Locale;
}> = ({children, initialLocale}) => {
	const [locale, setLocaleState] = useState<Locale>(
		() => initialLocale ?? loadLocale(),
	);
	const setLocale = useCallback((nextLocale: Locale) => {
		setLocaleState(nextLocale);
		saveLocale(nextLocale);
	}, []);
	const t = useMemo(() => createTranslator(locale), [locale]);
	const value = useMemo(() => ({locale, setLocale, t}), [locale, setLocale, t]);

	return (
		<StudioLocaleContext.Provider value={value}>
			{children}
		</StudioLocaleContext.Provider>
	);
};

export const useStudioLocale = (): StudioLocaleContextValue => {
	const context = useContext(StudioLocaleContext);
	if (context === null) {
		throw new Error(
			'useStudioLocale must be used inside a StudioLocaleProvider',
		);
	}

	return context;
};
