export type Template = {
	shortName: string;
	description: string;
	org: string;
	repoName: string;
	homePageLabel: string;
	longerDescription: string;
	promoVideo: {
		muxId: string;
		width: number;
		height: number;
	};
	cliId: string;
};

export const FEATURED_TEMPLATES: Template[] = [
	{
		homePageLabel: 'TypeScript',
		shortName: 'Hello World',
		org: 'remotion-dev',
		repoName: 'template-helloworld',
		description: 'The default starter template (recommended)',
		longerDescription:
			'A basic template with TypeScript, Prettier and ESLint preconfigured. Our recommended choice for beginners.',
		promoVideo: {
			muxId: 'vKvV6aa7GXGlR01cmpc6J8Zz4Gkj9d2hBSnVYoef00900I',
			height: 1080,
			width: 1920,
		},
		cliId: 'hello-world',
	},
	{
		homePageLabel: 'JavaScript',
		shortName: 'Hello World (Javascript)',
		org: 'remotion-dev',
		repoName: 'template-helloworld-javascript',
		description: 'The default starter template in plain JS',
		longerDescription:
			'The Hello World template, but in plain JavaScript. Recommended for people who detest TypeScript.',
		promoVideo: {
			muxId: 'dRIuc00f8QWnKedM8GBGPqXJWqU01DPJFgPTHpJgixxas',
			width: 1920,
			height: 1080,
		},
		cliId: 'javascript',
	},
	{
		homePageLabel: 'Blank',
		shortName: 'Blank',
		description: 'Nothing except an empty canvas',
		org: 'remotion-dev',
		repoName: 'template-empty',
		longerDescription:
			'A template containing nothing but an empty canvas. Recommended for people who already worked with Remotion.',
		promoVideo: {
			muxId: 'JD00x15y859GjqO7C9hpILkrSddGzd55K4lfj02dv8gU4',
			width: 1280,
			height: 720,
		},
		cliId: 'blank',
	},
	{
		homePageLabel: '3D',
		shortName: 'React Three Fiber',
		org: 'remotion-dev',
		repoName: 'template-three',
		description: 'Remotion + React Three Fiber Starter Template',
		longerDescription:
			'A template with a React Three Fiber scene to play around.',
		promoVideo: {
			muxId: 'mN40242xogVDx023lCChyg8JJBLT02Mqu01Pp00rbbk00SL8M',
			width: 1280,
			height: 720,
		},
		cliId: 'three',
	},
	{
		homePageLabel: 'Stills',
		shortName: 'Still images',
		org: 'remotion-dev',
		repoName: 'template-still',
		description: 'Dynamic PNG/JPEG template with built-in server',
		longerDescription:
			'A template for creating still images. Includes a built-in HTTP server that can be deployed to Heroku.',
		promoVideo: {
			muxId: 'admEY3QofSXUf01YbLKR8KqoZXhhprTvEZCM9onSo0001o',
			height: 628,
			width: 1200,
		},
		cliId: 'still',
	},
	{
		homePageLabel: 'TTS',
		shortName: 'Text To Speech',
		org: 'FelippeChemello',
		repoName: 'Remotion-TTS-Example',
		description: 'Turns text into speech and makes a video',
		longerDescription:
			'A template that turns text into a spoken video. Integrates with Azure Cloud for Speech synthesis.',
		promoVideo: {
			muxId: '8vJJ01lNuFmQCx7n59VILevqQGxRuQHp9a7VBR7B4C8k',
			width: 1920,
			height: 1080,
		},
		cliId: 'tts',
	},
	{
		homePageLabel: 'Audiogram',
		shortName: 'Audiogram',
		org: 'marcusstenbeck',
		repoName: 'remotion-template-audiogram',
		description: 'Text and waveform visualization for podcasts',
		longerDescription:
			'A template that turns podcast snippets into videos that can be posted on Social Media.',
		promoVideo: {
			muxId: 'nqGuji1CJuoPoU3iprRRhiy3HXiQN0201HLyliOg44HOU',
			height: 1080,
			width: 1080,
		},
		cliId: 'audiogram',
	},
	{
		homePageLabel: 'Tailwind',
		shortName: 'Tailwind',
		org: 'remotion-dev',
		repoName: 'template-tailwind',
		description: 'TypeScript and Tailwind starter',
		longerDescription:
			'A starter template with TypeScript and Tailwind already set up.',
		promoVideo: {
			muxId: 'OAe00WUpvsAyqAVSd4gehDCeWI81cI024RhTs9l2eB48w',
			height: 720,
			width: 1280,
		},
		cliId: 'tailwind',
	},
];
