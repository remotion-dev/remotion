type DynamicTemplate =
	| {
			type: 'video';
			promoVideo: {
				muxId: string;
				width: number;
				height: number;
			};
	  }
	| {
			type: 'image';
			promoBanner: {
				src: string;
				width: number;
				height: number;
			};
	  };

export type Template = {
	shortName: string;
	description: string;
	org: string;
	repoName: string;
	homePageLabel: string;
	longerDescription: string;
	cliId:
		| 'hello-world'
		| 'javascript'
		| 'blank'
		| 'next'
		| 'next-no-tailwind'
		| 'next-pages-dir'
		| 'react-router'
		| 'three'
		| 'still'
		| 'tts'
		| 'google-tts'
		| 'audiogram'
		| 'music-visualization'
		| 'prompt-to-video'
		| 'skia'
		| 'overlay'
		| 'stargazer'
		| 'tiktok'
		| 'code-hike'
		| 'render-server'
		| 'recorder'
		| 'prompt-to-motion-graphics'
		| 'vercel';
	defaultBranch: string;
	featuredOnHomePage: string | null;
	previewURL: string | null;
	previewLabel: string | null;
	templateInMonorepo: string;
	allowEnableTailwind: boolean;
	contributedBy: string | null;
	showStackblitz: boolean;
} & DynamicTemplate;

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const FEATURED_TEMPLATES: Template[] = [
	{
		homePageLabel: 'Blank',
		shortName: 'Blank',
		description: 'Nothing except an empty canvas',
		org: 'remotion-dev',
		repoName: 'template-empty',
		longerDescription:
			'A template containing nothing but an empty canvas. Recommended if you already used Remotion or plan to write your code with AI.',
		promoVideo: {
			muxId: 'JD00x15y859GjqO7C9hpILkrSddGzd55K4lfj02dv8gU4',
			width: 1280,
			height: 720,
		},
		cliId: 'blank' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: 'Blank',
		previewURL: 'https://template-empty.vercel.app/?/MyComp',
		previewLabel: null,
		templateInMonorepo: 'template-blank',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},

	{
		homePageLabel: 'Hello World',
		shortName: 'Hello World',
		org: 'remotion-dev',
		repoName: 'template-helloworld',
		description: 'A playground with a simple animation',
		longerDescription:
			'A basic template with TypeScript, Prettier and ESLint preconfigured.',
		promoVideo: {
			muxId: 'vKvV6aa7GXGlR01cmpc6J8Zz4Gkj9d2hBSnVYoef00900I',
			height: 1080,
			width: 1920,
		},
		cliId: 'hello-world' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: 'Hello World',
		previewURL: 'https://remotion-helloworld.vercel.app/?/HelloWorld',
		previewLabel: null,
		templateInMonorepo: 'template-helloworld',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Next.js',
		shortName: 'Next.js',
		org: 'remotion-dev',
		repoName: 'template-next-app-dir-tailwind',
		description: 'SaaS template for video generation apps',
		longerDescription:
			'A SaaS starter kit which has the Remotion Player and rendering via Remotion Lambda built-in. Our recommended choice for people who want to build an app that can generate videos.',
		promoVideo: {
			width: 1280,
			height: 720,
			muxId: 'RufnZIJZh6L1MAaeG02jnXuM9pK96tNuHRxmXHbWqCBI',
		},
		cliId: 'next' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: 'Next.js',
		previewURL: 'https://next.remotion.dev',
		templateInMonorepo: 'template-next-app-tailwind',
		previewLabel: 'Live Demo',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Next.js (Vercel Sandbox)',
		shortName: 'Next.js (Vercel Sandbox)',
		org: 'remotion-dev',
		repoName: 'template-vercel',
		description: 'Render videos on-demand using Vercel Sandbox',
		longerDescription:
			'A template for rendering videos on-demand using Vercel Sandbox. Spawns ephemeral Linux VMs to render videos and stores them in Vercel Blob storage.',
		cliId: 'vercel' as const,
		promoVideo: {
			width: 1280,
			height: 720,
			muxId: 'RufnZIJZh6L1MAaeG02jnXuM9pK96tNuHRxmXHbWqCBI',
		},
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://template-vercel.remotion.dev',
		templateInMonorepo: 'template-vercel',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: false,
		previewLabel: 'Live Demo',
	},
	{
		homePageLabel: 'Next.js (No Tailwind)',
		shortName: 'Next.js (No Tailwind)',
		org: 'remotion-dev',
		repoName: 'template-next-app-dir',
		description: 'SaaS template for video generation apps',
		longerDescription:
			'A SaaS starter kit which has the Remotion Player and rendering via Remotion Lambda built-in. Our recommended choice for people who want to build an app that can generate videos.',
		promoVideo: {
			width: 1280,
			height: 720,
			muxId: 'RufnZIJZh6L1MAaeG02jnXuM9pK96tNuHRxmXHbWqCBI',
		},
		cliId: 'next-no-tailwind' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://next.remotion.dev',
		templateInMonorepo: 'template-next-app',
		previewLabel: 'Live Demo',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Next.js (Pages dir)',
		shortName: 'Next.js (Pages dir)',
		org: 'remotion-dev',
		repoName: 'template-next-pages-dir',
		description: 'SaaS template for video generation apps',
		longerDescription:
			'A SaaS starter kit which has the Remotion Player and rendering via Remotion Lambda built-in. Our recommended choice for people who want to build an app that can generate videos.',
		promoVideo: {
			width: 1280,
			height: 720,
			muxId: 'RufnZIJZh6L1MAaeG02jnXuM9pK96tNuHRxmXHbWqCBI',
		},
		cliId: 'next-pages-dir' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://next.remotion.dev',
		previewLabel: 'Live Demo',
		templateInMonorepo: 'template-next-pages',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},

	{
		homePageLabel: 'Recorder',
		shortName: 'Recorder',
		org: 'remotion-dev',
		repoName: 'recorder',
		description: 'A video production tool built entirely in JavaScript',
		longerDescription:
			'The Remotion Recorder is a video production tool that allows you to record webcam and screen content, generate captions, add music, end-to-end in JavaScript. <a href="https://remotion.dev/recorder">See docs</a>',
		promoVideo: {
			muxId: '2A4z88QNjBTbxziIKqbI7IKLUO9iuaMp6UTZUBOItx00', // This would need a real promo video mux ID
			height: 1080,
			width: 1080,
		},
		cliId: 'recorder' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-recorder',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Prompt to Motion Graphics SaaS Starter Kit',
		shortName: 'Prompt to Motion Graphics SaaS Starter Kit',
		org: 'remotion-dev',
		repoName: 'template-prompt-to-motion-graphics-saas',
		description: 'SaaS template for AI-powered code generation with Remotion',
		longerDescription:
			'A SaaS template for "Prompt to Motion Graphics" products. Generates Remotion code, streams it to the frontend, and compiles and previews it in the browser. See the <a href="/docs/ai/ai-saas-template">documentation page</a> for more details.',
		promoBanner: {
			width: 2880,
			height: 1512,
			src: '/img/prompt-to-motion-graphics.png',
		},
		cliId: 'prompt-to-motion-graphics' as const,
		type: 'image' as const,
		defaultBranch: 'main',
		featuredOnHomePage: 'Prompt to Motion',
		previewURL: null,
		previewLabel: 'Live Demo',
		templateInMonorepo: 'template-prompt-to-motion-graphics',
		allowEnableTailwind: false,
		contributedBy: 'ASchwad',
		showStackblitz: false,
	},
	{
		homePageLabel: 'JavaScript',
		shortName: 'Hello World (JavaScript)',
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
		cliId: 'javascript' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL:
			'https://template-helloworld-javascript.vercel.app/?/HelloWorld',
		previewLabel: null,
		templateInMonorepo: 'template-javascript',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Render Server (Express.js)',
		shortName: 'Render Server',
		org: 'remotion-dev',
		repoName: 'template-render-server',
		description: 'An Express.js server for rendering videos with Remotion',
		longerDescription:
			'A template that provides an Express.js server starting, tracking, and canceling Remotion renders.',
		promoVideo: {
			muxId: 'JhsWde00fJ6L00SUrIwOZv2XOl7j00DgT5kED01FVVOUJTU',
			width: 1920,
			height: 1080,
		},
		cliId: 'render-server' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-render-server',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'React Router 7',
		shortName: 'React Router',
		org: 'remotion-dev',
		repoName: 'template-react-router',
		description: 'SaaS template for video generation apps',
		longerDescription:
			'A software-as-a-service starter kit which has the Remotion Player and rendering via Remotion Lambda built-in. Built with React Router 7.',
		promoBanner: {
			width: 918,
			height: 720,
			src: '/img/remix-template.png',
		},
		cliId: 'react-router' as const,
		type: 'image' as const,
		defaultBranch: 'main',
		featuredOnHomePage: 'React Router',
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-react-router',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
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
		cliId: 'three' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://template-three-remotion.vercel.app/',
		previewLabel: null,
		templateInMonorepo: 'template-three',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
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
		cliId: 'still' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://template-still.vercel.app/?/PreviewCard',
		previewLabel: null,
		templateInMonorepo: 'template-still',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Text-To-Speech (Azure)',
		shortName: 'TTS (Azure)',
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
		cliId: 'tts' as const,
		type: 'video' as const,
		defaultBranch: 'master',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-tts-azure',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Text-To-Speech (Google)',
		shortName: 'TTS (Google)',
		org: 'thecmdrunner',
		repoName: 'remotion-gtts-template',
		description: 'Turns text into speech and makes a video',
		longerDescription:
			'A template that turns text into a spoken video. Integrates with Firebase for Storage, and Google Cloud for Speech synthesis.',
		promoVideo: {
			muxId: '82dzhGhv3bl3p8LW009cFGd8oltqt6UvxTWdP27202BAY',
			width: 1920,
			height: 1080,
		},
		cliId: 'google-tts' as const,
		type: 'video' as const,
		defaultBranch: 'master',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-tts-google',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Audiogram',
		shortName: 'Audiogram',
		org: 'remotion-dev',
		repoName: 'template-audiogram',
		description: 'Text and waveform visualization for podcasts',
		longerDescription:
			'A template that turns podcast snippets into videos that can be posted on Social Media.',
		promoVideo: {
			muxId: '7RwHiqZX5k5radAqZpGq7x02jJhi5j4OD8BMiM1z7nmE',
			height: 1080,
			width: 1080,
		},
		cliId: 'audiogram' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://template-audiogram-1nrh.vercel.app',
		previewLabel: null,
		templateInMonorepo: 'template-audiogram',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Music Visualization',
		shortName: 'Music Visualization',
		org: 'remotion-dev',
		repoName: 'template-music-visualization',
		description: 'Text and waveform visualization for podcasts',
		longerDescription:
			'A template that turns music snippets into videos that can be posted on Social Media.',
		promoVideo: {
			muxId: '8msABU02zPeFOGdvUWChssvsLVJZgFNWGWaVKA9hNAlw',
			height: 1080,
			width: 1080,
		},
		cliId: 'music-visualization' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-music-visualization',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Prompt to Video',
		shortName: 'Prompt to Video',
		org: 'remotion-dev',
		repoName: 'template-prompt-to-video',
		description: 'Create a story with images and voiceover from a prompt',
		longerDescription:
			'A template that turns prompts into short videos with a script, images and voiceover. Uses OpenAI and ElevenLabs to generate the content.',
		promoVideo: {
			muxId: 'FGl01Rw6c5YOjBCTdVhn5wrmVaRWDOjDeT28iY3Sv47w',
			height: 1920,
			width: 1080,
		},
		cliId: 'prompt-to-video' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-prompt-to-video',
		allowEnableTailwind: true,
		contributedBy: 'webmonch',
		showStackblitz: true,
	},
	{
		homePageLabel: 'Skia',
		shortName: 'Skia',
		org: 'remotion-dev',
		repoName: 'template-skia',
		description: 'React Native Skia starter',
		longerDescription: 'A template with React Native Skia already setup.',
		promoVideo: {
			muxId: 'ecORcc01sP94IsTRGLwngxH4PC1r1kQq6iXpn00HqCIGI',
			height: 1080,
			width: 1920,
		},
		cliId: 'skia' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-skia',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Overlay',
		shortName: 'Overlay',
		org: 'remotion-dev',
		repoName: 'template-overlay',
		description: 'Overlays for video editing software',
		longerDescription: `
			<span>
				A starter template to create overlays to use in conventional video
				editing software.{' '}
				<a href="/docs/overlay">Read more about creating overlays.</a>
			</span>
			`,
		promoVideo: {
			muxId: 'zgy7XK01009y33Vfzhns02cZS00rOyeZ6WaanaxcrDysqmU',
			height: 720,
			width: 1280,
		},
		cliId: 'overlay' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-overlay',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Code Hike',
		shortName: 'Code Hike',
		org: 'remotion-dev',
		repoName: 'template-code-hike',
		description: 'Beautiful code animations',
		longerDescription: `			
				Add code snippets and animate between them using
				<a href="https://codehike.org/">Code Hike</a>. Supports many languages,
				TypeScript error annotations, and many themes.
			`,
		promoVideo: {
			muxId: 'fKwnpTAOqvnZpu00fwEezi00cpF3927NumGcS1gGdUj8A',
			width: 1080,
			height: 1080,
		},
		cliId: 'code-hike' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: 'https://template-code-hike.vercel.app/',
		previewLabel: null,
		templateInMonorepo: 'template-code-hike',
		allowEnableTailwind: false,
		contributedBy: null,
		showStackblitz: true,
	},
	{
		homePageLabel: 'Stargazer',
		shortName: 'Stargazer',
		org: 'pomber',
		repoName: 'stargazer',
		description: 'Celebrate your repo stars with a video',
		longerDescription:
			'Your repo reached a stars milestone? Celebrate with a video of your stargazers!',
		promoVideo: {
			muxId: 'y9rC1DoQ7rCzzI9TGeUywyTliOVU8xhHTHHZZ2BhM014',
			height: 540,
			width: 960,
		},
		cliId: 'stargazer' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-stargazer',
		allowEnableTailwind: true,
		contributedBy: 'pomber',
		showStackblitz: true,
	},
	{
		homePageLabel: 'TikTok',
		shortName: 'TikTok',
		org: 'remotion-dev',
		repoName: 'template-tiktok',
		description: 'Generate animated word-by-word captions',
		longerDescription:
			'Caption a video of your choice locally with animated word-by-word captions. Automatically installs Whisper.cpp for you and allows you to customize the animation style.',
		promoVideo: {
			muxId: 'BzwCAYgGPqNtLk301tsgWCDvuWVWfEvaO2bIo2lGEd300',
			height: 1920,
			width: 1080,
		},
		cliId: 'tiktok' as const,
		type: 'video' as const,
		defaultBranch: 'main',
		featuredOnHomePage: null,
		previewURL: null,
		previewLabel: null,
		templateInMonorepo: 'template-tiktok',
		allowEnableTailwind: true,
		contributedBy: null,
		showStackblitz: true,
	},
].filter(truthy);

export const PAID_TEMPLATES = [
	{
		homePageLabel: 'Editor Starter',
		shortName: 'Editor Starter',
		org: 'remotion-dev',
		repoName: 'editor-starter',
		description: 'A boilerplate for starting a video editor',
		longerDescription: 'A starting point for building your own video editor.',
		cliId: 'editor-starter' as const,
		defaultBranch: 'main',
		previewURL: 'https://www.remotion.pro/editor-starter',
	},
].filter(truthy);
