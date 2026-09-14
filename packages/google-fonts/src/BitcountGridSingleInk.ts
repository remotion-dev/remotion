import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Bitcount Grid Single Ink',
	importName: 'BitcountGridSingleInk',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single+Ink:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
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
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u2OPF80A.woff2',
				latin:
					'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaNNepOEK_VIyYAuIaZn7FnUAOSVYeI0Ctm5-AxV__OGadlXPkpqc2W3G80KvDvfZJcTBZtOWSEifRuVdQ9MPZtUsYBBEK6cMpFmAx9Xgbn8m7Ha_CUon9Fm0PP1zM05Dnsuyw04ZGzhvlKxYNMYWI3t91IQXOwJRiUJVTErJ5YUW4O8LJCoXjD9tXQjarshNDUf3e0O5j3ZjrZCu23Qd6u4OPE.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext'],
	variable: {
		axes: {
			CRSV: {
				min: 0,
				max: 1,
			},
			ELSH: {
				min: 0,
				max: 100,
			},
			ELXP: {
				min: 0,
				max: 100,
			},
			SZP1: {
				min: 0,
				max: 100,
			},
			SZP2: {
				min: 0,
				max: 100,
			},
			XPN1: {
				min: -100,
				max: 100,
			},
			XPN2: {
				min: -100,
				max: 100,
			},
			YPN1: {
				min: -100,
				max: 100,
			},
			YPN2: {
				min: -100,
				max: 100,
			},
			slnt: {
				min: -8,
				max: 0,
			},
			wght: {
				min: 100,
				max: 900,
			},
		},
		fontFaces: [
			{
				style: 'oblique 0deg 8deg',
				weight: '100 900',
				stretch: null,
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaPLcYHeAOhfxZo1O_IA2ULZRJevZus_A5zQ3wkuzNiLh34.woff2',
			},
			{
				style: 'oblique 0deg 8deg',
				weight: '100 900',
				stretch: null,
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/bitcountgridsingleink/v2/NaPLcYHeAOhfxZo1O_IA2ULZRJevZus_A5zQ3wkuwtiL.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single+Ink:CRSV,ELSH,ELXP,slnt,SZP1,SZP2,wght,XPN1,XPN2,YPN1,YPN2@0..1,0..100,0..100,-8..0,0..100,0..100,100..900,-100..100,-100..100,-100..100,-100..100',
	},
});

export const fontFamily = 'Bitcount Grid Single Ink' as const;

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

type VariableVariants = {
	'oblique 0deg 8deg': {
		subsets: 'latin' | 'latin-ext';
	};
};

export const loadVariableFont = <T extends keyof VariableVariants>(
	style: T,
	options: {
		subsets: VariableVariants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadVariableFonts(getInfo(), style, options);
};
