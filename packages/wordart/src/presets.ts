export type WordArtPreset = 'rainbow' | 'orange' | 'blue-wave' | 'chrome';

type Preset = {
	stops: [number, string][];
	stroke: string;
	side: string;
	depth: number;
	horizontalGradient: boolean;
};

export const presets: Record<WordArtPreset, Preset> = {
	rainbow: {
		stops: [
			[0, '#7814b7'],
			[0.17, '#dc148f'],
			[0.34, '#f52525'],
			[0.5, '#ffdc00'],
			[0.67, '#36b524'],
			[0.83, '#00a6df'],
			[1, '#3526b6'],
		],
		stroke: '#4b3564',
		side: '#858585',
		depth: 0,
		horizontalGradient: true,
	},
	orange: {
		stops: [
			[0, '#fff36a'],
			[0.3, '#ffd522'],
			[0.65, '#ff9700'],
			[1, '#ed4b00'],
		],
		stroke: '#b34400',
		side: '#923300',
		depth: 28,
		horizontalGradient: false,
	},
	'blue-wave': {
		stops: [
			[0, '#b7f7ff'],
			[0.35, '#41d9ff'],
			[0.7, '#0099eb'],
			[1, '#0866d2'],
		],
		stroke: '#17329b',
		side: '#102b93',
		depth: 12,
		horizontalGradient: false,
	},
	chrome: {
		stops: [
			[0, '#ffffff'],
			[0.2, '#dce7ed'],
			[0.46, '#6c8da5'],
			[0.49, '#f9fdff'],
			[0.5, '#283b4b'],
			[0.58, '#74848e'],
			[0.8, '#e6ecef'],
			[1, '#ffffff'],
		],
		stroke: '#354e65',
		side: '#526171',
		depth: 5,
		horizontalGradient: false,
	},
};
