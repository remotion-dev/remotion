import {loadFont} from '@remotion/google-fonts/RobotoMono';

export const {fontFamily, waitUntilDone} = loadFont('normal', {
	subsets: ['latin'],
	weights: ['400', '700'],
});
export const fontSize = 34;
export const tabSize = 3;
export const lineHeight = 1.5;
export const horizontalPadding = 60;
export const verticalPadding = 84;
