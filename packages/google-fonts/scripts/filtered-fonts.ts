import {googleFonts} from './google-fonts';
import {incompatibleFonts} from './incompatible-fonts';

export const filteredFonts = googleFonts.filter((f) => {
	// Has no unicode range
	return !incompatibleFonts.some((i) => f.family.includes(i));
});
