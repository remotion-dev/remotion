export type Theme = 'light' | 'dark';

export const getBackground = (theme: Theme) => {
	return theme === 'dark' ? '#2E2E2E' : 'white';
};

export const getColor = (theme: Theme) => {
	return theme === 'dark' ? 'white' : 'black';
};

export const getOpacity = (theme: Theme) => {
	return theme === 'dark' ? 0.13 : 0.08;
};

export const getBrand = (theme: Theme) => {
	return theme === 'dark' ? 'white' : '#0C85F3';
};
