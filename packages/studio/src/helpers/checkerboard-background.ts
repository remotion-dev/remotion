import {BLACK, CHECKERBOARD_BACKGROUND_IMAGE, WHITE} from './colors';

export const getCheckerboardBackgroundSize = (size: number) =>
	`${size}px ${size}px`;
export const getCheckerboardBackgroundPos = (size: number) =>
	`0 0, ${size / 2}px 0, ${size / 2}px -${size / 2}px, 0px ${size / 2}px`;

export const checkerboardBackgroundColor = (checkerboard: boolean) => {
	if (checkerboard) {
		return WHITE;
	}

	return BLACK;
};

export const checkerboardBackgroundImage = (checkerboard: boolean) => {
	if (checkerboard) {
		return CHECKERBOARD_BACKGROUND_IMAGE;
	}

	return undefined;
};
