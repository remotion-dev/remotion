import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Roboto Serif',
	importName: 'RobotoSerif',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Roboto+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh73Ob9-w.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBhy3Ob9-w.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh53Ob9-w.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh43Ob9-w.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70kjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbBh23OY.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5JCh0xOI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5LSh0xOI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jih0xOI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5Jyh0xOI.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoserif/v17/R70mjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEX5KSh0.woff2',
			},
		},
	},
	subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext', 'vietnamese'],
	variable: {
		axes: {
			GRAD: {
				min: -50,
				max: 100,
			},
			opsz: {
				min: 8,
				max: 144,
			},
			wdth: {
				min: 50,
				max: 150,
			},
			wght: {
				min: 100,
				max: 900,
			},
		},
		fontFaces: [
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'cyrillic-ext',
				unicodeRange:
					'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70DjywflP6FLr3gZx7K8UyEVSPzb5CBnA.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'cyrillic',
				unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70DjywflP6FLr3gZx7K8UyEVSP6b5CBnA.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70DjywflP6FLr3gZx7K8UyEVSPxb5CBnA.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70DjywflP6FLr3gZx7K8UyEVSPwb5CBnA.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70DjywflP6FLr3gZx7K8UyEVSP-b5A.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'cyrillic-ext',
				unicodeRange:
					'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70djywflP6FLr3gZx7K8UyEXRP8d5Q.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'cyrillic',
				unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70djywflP6FLr3gZx7K8UyEVBP8d5Q.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70djywflP6FLr3gZx7K8UyEXxP8d5Q.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70djywflP6FLr3gZx7K8UyEXhP8d5Q.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 150%',
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/robotoserif/v17/R70djywflP6FLr3gZx7K8UyEUBP8.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=Roboto+Serif:GRAD,ital,opsz,wdth,wght@-50..100,0,8..144,50..150,100..900;-50..100,1,8..144,50..150,100..900',
	},
});

export const fontFamily = 'Roboto Serif' as const;

type Variants = {
	italic: {
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
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
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
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
	italic: {
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
