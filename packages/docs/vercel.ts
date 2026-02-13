import {routes, type VercelConfig} from '@vercel/config/v1';

export const config: VercelConfig = {
	headers: [
		routes.cacheControl('/assets/(.*)', {
			public: true,
			maxAge: '365days',
			immutable: true,
		}),
		routes.header('/_raw/docs/(.*).md', [
			{key: 'Content-Type', value: 'text/plain; charset=utf-8'},
			{key: 'Vary', value: 'Accept'},
		]),
		routes.header('/img/gt-planar(.*)', [
			{key: 'Access-Control-Allow-Credentials', value: 'true'},
			{key: 'Access-Control-Allow-Origin', value: '*'},
			{
				key: 'Access-Control-Allow-Methods',
				value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
			},
			{
				key: 'Access-Control-Allow-Headers',
				value:
					'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
			},
		]),
		routes.header('/transcribe(.*)', [
			{key: 'Cross-Origin-Embedder-Policy', value: 'require-corp'},
			{key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
		]),
		routes.header('/convert/assets/(.*)', [
			{key: 'Cross-Origin-Embedder-Policy', value: 'require-corp'},
			{key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
		]),
	],
	redirects: [
		routes.redirect(
			'/changelog',
			'https://github.com/remotion-dev/remotion/releases',
			{permanent: false},
		),
		routes.redirect('/discord', 'https://discord.gg/6VzzNDwUwV', {
			permanent: false,
		}),
		routes.redirect('/booking', 'https://cal.com/remotion', {
			permanent: false,
		}),
		routes.redirect(
			'/coc',
			'https://github.com/remotion-dev/remotion/blob/main/CODE-OF-CONDUCT.md',
			{permanent: false},
		),
		routes.redirect(
			'/license',
			'https://github.com/remotion-dev/remotion/blob/main/LICENSE.md',
			{permanent: false},
		),
		routes.redirect('/timeout', '/docs/timeout', {permanent: false}),
		routes.redirect('/acknowledgements', '/docs/acknowledgements', {
			permanent: false,
		}),
		routes.redirect(
			'/issue',
			'https://github.com/remotion-dev/remotion/issues/new/choose',
			{permanent: false},
		),
		routes.redirect('/skia', '/docs/skia', {permanent: false}),
		routes.redirect('/gif', '/docs/gif', {permanent: false}),
		routes.redirect('/lottie', '/docs/lottie', {permanent: false}),
		routes.redirect('/paths', '/docs/paths', {permanent: false}),
		routes.redirect('/shapes', '/docs/shapes', {permanent: false}),
		routes.redirect('/api', '/docs/api', {permanent: false}),
		routes.redirect('/terminology', '/docs/terminology', {permanent: false}),
		routes.redirect(
			'/hacktoberfest',
			'https://github.com/remotion-dev/remotion/issues/1365',
			{permanent: false},
		),
		routes.redirect('/motion-blur', '/docs/motion-blur', {permanent: false}),
		routes.redirect('/noise', '/docs/noise', {permanent: false}),
		routes.redirect(
			'/docs/get-audio-duration',
			'/docs/get-audio-duration-in-seconds',
			{permanent: true},
		),
		routes.redirect(
			'/docs/get-compositions',
			'/docs/renderer/get-compositions',
			{permanent: true},
		),
		routes.redirect(
			'/docs/stitch-frames-to-video',
			'/docs/renderer/stitch-frames-to-video',
			{permanent: true},
		),
		routes.redirect('/docs/render-still', '/docs/renderer/render-still', {
			permanent: true,
		}),
		routes.redirect('/docs/render-frames', '/docs/renderer/render-frames', {
			permanent: true,
		}),
		routes.redirect(
			'/docs/motion-blur/motion-blur',
			'/docs/motion-blur/trail',
			{
				permanent: true,
			},
		),
		routes.redirect('/support', '/docs/support', {permanent: true}),
		routes.redirect('/webcodecs', '/docs/webcodecs', {permanent: true}),
		routes.redirect('/docs/player/api', '/docs/player/player', {
			permanent: true,
		}),
		routes.redirect('/github', 'https://github.com/remotion-dev/remotion', {
			permanent: false,
		}),
		routes.redirect('/brand', 'https://github.com/remotion-dev/logo', {
			permanent: false,
		}),
		routes.redirect('/docs/lottie/after-effects', '/docs/after-effects', {
			permanent: false,
		}),
		routes.redirect('/docs/miscellaneous/render-all', '/docs/render-all', {
			permanent: false,
		}),
		routes.redirect('/docs/overlays', '/docs/overlay', {permanent: false}),
		routes.redirect('/docs/cli/preview', '/docs/cli/studio', {
			permanent: false,
		}),
		routes.redirect('/links', 'https://linktr.ee/remotion', {
			permanent: false,
		}),
		routes.redirect(
			'/contributing',
			'https://www.remotion.dev/docs/contributing',
			{permanent: false},
		),
		routes.redirect('/resources', 'https://www.remotion.dev/docs/resources', {
			permanent: false,
		}),
		routes.redirect('/rive', 'https://www.remotion.dev/docs/rive', {
			permanent: false,
		}),
		routes.redirect('/zod-types', 'https://www.remotion.dev/docs/zod-types', {
			permanent: false,
		}),
		routes.redirect('/cloudrun', 'https://www.remotion.dev/docs/cloudrun', {
			permanent: false,
		}),
		routes.redirect(
			'/layout-utils',
			'https://www.remotion.dev/docs/layout-utils',
			{permanent: false},
		),
		routes.redirect(
			'/animation-utils',
			'https://www.remotion.dev/docs/animation-utils',
			{permanent: false},
		),
		routes.redirect('/get-help', 'https://www.remotion.dev/docs/get-help', {
			permanent: false,
		}),
		routes.redirect('/help', 'https://www.remotion.dev/docs/get-help', {
			permanent: false,
		}),
		routes.redirect(
			'/ask-in-public',
			'https://www.remotion.dev/docs/ask-in-public',
			{permanent: false},
		),
		routes.redirect('/native', 'https://remotion.dev/docs/react-native', {
			permanent: false,
		}),
		routes.redirect(
			'/docs/parametrized-rendering',
			'https://www.remotion.dev/docs/parameterized-rendering',
			{permanent: false},
		),
		routes.redirect(
			'/business',
			'https://github.com/orgs/remotion-dev/projects/10',
			{permanent: false},
		),
		routes.redirect(
			'/docs/thorium-browser',
			'/docs/miscellaneous/thorium-browser',
			{permanent: false},
		),
		routes.redirect('/youtube', 'https://youtube.com/@remotion_dev', {
			permanent: false,
		}),
		routes.redirect('/bun', '/docs/bun', {permanent: false}),
		routes.redirect('/bounties', '/docs/contributing/bounty', {
			permanent: false,
		}),
		routes.redirect('/transitions', '/docs/transitioning', {
			permanent: false,
		}),
		routes.redirect(
			'/repro',
			'https://stackblitz.com/fork/github/remotion-dev/template-helloworld',
			{permanent: false},
		),
		routes.redirect('/templates/remix', '/templates/react-router', {
			permanent: false,
		}),
		routes.redirect('/studio', '/docs/studio', {permanent: false}),
		routes.redirect('/security', '/docs/security', {permanent: false}),
		routes.redirect('/accessibility', '/docs/accessibility', {
			permanent: false,
		}),
		routes.redirect('/custom-controls', '/docs/player/custom-controls', {
			permanent: false,
		}),
		routes.redirect('/drag-and-drop', '/docs/player/drag-and-drop/', {
			permanent: false,
		}),
		routes.redirect('/standalone', '/docs/standalone', {permanent: false}),
		routes.redirect('/docs/deploy-studio', '/docs/studio/deploy-server', {
			permanent: false,
		}),
		routes.redirect('/blog/faster-lambda-renders', '/blog/faster-lambda', {
			permanent: false,
		}),
		routes.redirect(
			'/docs/miscellaneous/thorium-browser',
			'/docs/miscellaneous/chrome-headless-shell',
			{permanent: false},
		),
		routes.redirect(
			'/chrome-headless-shell',
			'/docs/miscellaneous/chrome-headless-shell',
			{permanent: false},
		),
		routes.redirect(
			'/chrome-for-testing',
			'/docs/miscellaneous/chrome-headless-shell#using-chrome-for-testing-instead',
			{permanent: false},
		),
		routes.redirect('/media-parser', '/docs/media-parser', {
			permanent: false,
		}),
		routes.redirect('/editor-starter', '/docs/editor-starter', {
			permanent: false,
		}),
		routes.redirect('/docs/system-prompt', '/docs/ai/system-prompt', {
			permanent: false,
		}),
		routes.redirect('/media-parser/', '/docs/media-parser', {
			permanent: false,
		}),
		routes.redirect(
			'/docs/chrome-headless-shell',
			'/docs/miscellaneous/chrome-headless-shell',
			{permanent: false},
		),
		routes.redirect('/docs/audio-visualization', '/docs/audio/visualization', {
			permanent: false,
		}),
		routes.redirect('/recorder', '/docs/recorder', {permanent: false}),
		routes.redirect('/install-whisper-cpp', '/docs/install-whisper-cpp', {
			permanent: false,
		}),
		routes.redirect('/captions', '/docs/captions', {permanent: false}),
		routes.redirect(
			'/docs/miscellaneous/snippets/adding-animations',
			'/docs/animation-math',
			{permanent: false},
		),
		routes.redirect('/docs/video-vs-offthreadvideo', '/docs/video-tags', {
			permanent: false,
		}),
		routes.redirect(
			'/bbb.webm',
			'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm',
			{permanent: false},
		),
		routes.redirect(
			'/bbb.mp4',
			'https://remotion.media/BigBuckBunny.mp4',
			{permanent: false},
		),
		routes.redirect(
			'/leads',
			'https://github.com/orgs/remotion-dev/projects/15/views/1',
			{permanent: false},
		),
		routes.redirect(
			'/discord-blue-badges',
			'https://github.com/remotion-dev/business/issues/347',
			{permanent: false},
		),
		routes.redirect(
			'/content',
			'https://github.com/orgs/remotion-dev/projects/16/views/1?layout=board',
			{permanent: false},
		),
		routes.redirect('/docs/snippets/fps-converter', '/docs/multiple-fps', {
			permanent: false,
		}),
		routes.redirect(
			'/docs/miscellaneous/vercel-functions',
			'/docs/miscellaneous/vercel',
			{permanent: false},
		),
		routes.redirect('/system-prompt', '/docs/ai/system-prompt', {
			permanent: false,
		}),
		routes.redirect('/investors', '/docs/investors', {permanent: false}),
		routes.redirect(
			'/docs/miscellaneous/snippets/offthread-video-while-rendering',
			'/docs/video-tags#using-a-different-tag-in-preview-and-rendering',
			{permanent: false},
		),
		routes.redirect('/docs/video', '/docs/html5-video', {permanent: false}),
		routes.redirect('/docs/audio', '/docs/html5-audio', {permanent: false}),
	],
};
