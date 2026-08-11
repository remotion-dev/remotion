import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bitcount Ink',
	importName: 'BitcountInk',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Bitcount+Ink:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z2lWi5iA.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountink/v2/CHw6XOqbPlXqZygxqACCMDRlDHEsWMeZ-ply2TQhrGdTTV70MvuSq-hd_83nDPWRtOLnAR0RGYwUI6_l53HbUsPlZt2f_nGD_DNHtMCB7B9hQwZ0b5o6F6iN-beb4rZZL0lJiDukrkTdyFcJaMYOfDmhx95p-j2BlGfR752-BOzpyNMOV-otpEi0LP8lkm2L_v1iV6z4lWg.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext'],
});

export const fontFamily = 'Bitcount Ink' as const;

type Variants = {
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
