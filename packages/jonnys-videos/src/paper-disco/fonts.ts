import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';

export const {fontFamily: markerFont} = loadMarker('normal', {
	weights: ['400'],
	subsets: ['latin'],
});

export const {fontFamily: handFont} = loadCaveat('normal', {
	weights: ['600', '700'],
	subsets: ['latin'],
});
