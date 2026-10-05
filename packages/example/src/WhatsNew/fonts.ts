import {loadFont} from '@remotion/fonts';
import {loadFont as loadGeistMono} from '@remotion/google-fonts/GeistMono';

export const display = 'GT Planar';

loadFont({
	family: display,
	url: 'https://remotion.media/announcements/whats-new-in-remotion/cursor/fonts/GT-Planar-Medium.woff2',
	weight: '500',
});
loadFont({
	family: display,
	url: 'https://remotion.media/announcements/whats-new-in-remotion/cursor/fonts/GT-Planar-Bold.woff2',
	weight: '700',
});

export const {fontFamily: mono} = loadGeistMono('normal', {
	weights: ['400', '600'],
	subsets: ['latin'],
});
