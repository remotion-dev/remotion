import type {getThemeColors} from '@code-hike/lighter';
import React from 'react';

export type ThemeColors = Awaited<ReturnType<typeof getThemeColors>>;

export const ThemeColorsContext = React.createContext<ThemeColors | null>(null);

export const useThemeColors = () => {
	const themeColors = React.useContext(ThemeColorsContext);
	if (!themeColors) {
		throw new Error('ThemeColorsContext not found');
	}

	return themeColors;
};

export const ThemeProvider = ({
	children,
	themeColors,
}: {
	readonly children: React.ReactNode;
	readonly themeColors: ThemeColors;
}) => {
	return (
		<ThemeColorsContext.Provider value={themeColors}>
			{children}
		</ThemeColorsContext.Provider>
	);
};
