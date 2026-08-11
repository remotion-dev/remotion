type MaxRes = {
	width: number;
	height: number;
	fps: number;
};

interface HEVCLevel {
	level: string;
	maxBitrateMainTier: number;
	maxBitrateHighTier: number | null;
	maxResolutionsAndFrameRates: MaxRes[];
}

export const hevcLevels: HEVCLevel[] = [
	{
		level: '3.1',
		maxBitrateMainTier: 10000,
		maxBitrateHighTier: null,
		maxResolutionsAndFrameRates: [
			{
				width: 720,
				height: 480,
				fps: 84.3,
			},
			{
				width: 720,
				height: 576,
				fps: 75,
			},
			{
				width: 960,
				height: 540,
				fps: 60,
			},
			{
				width: 1280,
				height: 720,
				fps: 33.7,
			},
		],
	},
	{
		level: '4',
		maxBitrateMainTier: 12000,
		maxBitrateHighTier: 30000,
		maxResolutionsAndFrameRates: [
			{
				width: 1280,
				height: 720,
				fps: 68,
			},
			{
				width: 1920,
				height: 1080,
				fps: 32,
			},
			{
				width: 2048,
				height: 1080,
				fps: 30,
			},
		],
	},
	{
		level: '4.1',
		maxBitrateMainTier: 20000,
		maxBitrateHighTier: 50000,
		maxResolutionsAndFrameRates: [
			{
				width: 1280,
				height: 720,
				fps: 136,
			},
			{
				width: 1920,
				height: 1080,
				fps: 64,
			},
			{
				width: 2048,
				height: 1080,
				fps: 60,
			},
		],
	},
	{
		level: '5',
		maxBitrateMainTier: 25000,
		maxBitrateHighTier: 100000,
		maxResolutionsAndFrameRates: [
			{
				width: 1920,
				height: 1080,
				fps: 128,
			},
			{
				width: 2048,
				height: 1080,
				fps: 120,
			},
			{
				width: 3840,
				height: 2160,
				fps: 32,
			},
			{
				width: 4096,
				height: 2160,
				fps: 30,
			},
		],
	},
	{
		level: '5.1',
		maxBitrateMainTier: 40000,
		maxBitrateHighTier: 160000,
		maxResolutionsAndFrameRates: [
			{
				width: 1920,
				height: 1080,
				fps: 256,
			},
			{
				width: 2048,
				height: 1080,
				fps: 240,
			},
			{
				width: 3840,
				height: 2160,
				fps: 64,
			},
			{
				width: 4096,
				height: 2160,
				fps: 60,
			},
		],
	},
	{
		level: '5.2',
		maxBitrateMainTier: 60000,
		maxBitrateHighTier: 240000,
		maxResolutionsAndFrameRates: [
			{
				width: 2048,
				height: 1080,
				fps: 300,
			},
			{
				width: 3840,
				height: 2160,
				fps: 128,
			},
			{
				width: 4096,
				height: 2160,
				fps: 120,
			},
		],
	},
	{
		level: '6',
		maxBitrateMainTier: 60000,
		maxBitrateHighTier: 240000,
		maxResolutionsAndFrameRates: [
			{
				width: 3840,
				height: 2160,
				fps: 128,
			},
			{
				width: 4096,
				height: 2160,
				fps: 120,
			},
			{
				width: 7680,
				height: 4320,
				fps: 32,
			},
			{
				width: 8192,
				height: 4320,
				fps: 30,
			},
		],
	},
	{
		level: '6.1',
		maxBitrateMainTier: 120000,
		maxBitrateHighTier: 480000,
		maxResolutionsAndFrameRates: [
			{
				width: 3840,
				height: 2160,
				fps: 256,
			},
			{
				width: 4096,
				height: 2160,
				fps: 240,
			},
			{
				width: 7680,
				height: 4320,
				fps: 64,
			},
			{
				width: 8192,
				height: 4320,
				fps: 60,
			},
		],
	},
	{
		level: '6.2',
		maxBitrateMainTier: 240000,
		maxBitrateHighTier: 800000,
		maxResolutionsAndFrameRates: [
			{
				width: 3840,
				height: 2160,
				fps: 512,
			},
			{
				width: 4096,
				height: 2160,
				fps: 480,
			},
			{
				width: 7680,
				height: 4320,
				fps: 128,
			},
			{
				width: 8192,
				height: 4320,
				fps: 120,
			},
		],
	},
];
