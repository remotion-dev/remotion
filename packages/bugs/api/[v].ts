// Keep in sync with packages/cli/src/editor/components/UpdateCheck.tsx
type Bug = {
	title: string;
	description: string;
	link: string;
	versions: string[];
};

export const bugs: Bug[] = [
	{
		title: 'Broken release',
		description:
			'This version of Remotion was not published correctly. Upgrade to 4.0.199.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.195', '4.0.196', '4.0.197', '4.0.198'],
	},
	{
		title: 'Broken release',
		description:
			'This version of Remotion was not published correctly. Upgrade to 4.0.191.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.190'],
	},
	{
		title: '@remotion/streaming is missing',
		description:
			'Broken release - @remotion/streaming is missing when installing @remotion/renderer. Upgrade to 4.0.186.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.185'],
	},
	{
		title: 'Crash upon start.',
		description: 'Broken release - @remotion/renderer would throw an error.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.184'],
	},
	{
		title: 'Lambda function may leak memory and crash',
		description:
			'The main function of the Lambda function leaks memory, which might require more RAM or cause the Lambda function to crash.',
		link: 'https://github.com/remotion-dev/remotion/pull/3983',
		versions: [
			'4.0.171',
			'4.0.170',
			'4.0.169',
			'4.0.168',
			'4.0.167',
			'4.0.166',
			'4.0.165',
		],
	},
	{
		title: 'Occasional infinite loop during rendering on Linux',
		description:
			'If using <OffthreadVideo>, the render could get stuck in an infinite loop.',
		link: 'https://github.com/remotion-dev/remotion/pull/3912',
		versions: [
			'4.0.155',
			'4.0.154',
			'4.0.153',
			'4.0.152',
			'4.0.151',
			'4.0.150',
			'4.0.149',
			'4.0.148',
			'4.0.147',
			'4.0.146',
			'4.0.145',
			'4.0.144',
			'4.0.143',
			'4.0.142',
			'4.0.141',
			'4.0.140',
			'4.0.139',
			'4.0.138',
			'4.0.137',
			'4.0.136',
			'4.0.135',
			'4.0.134',
			'4.0.133',
			'4.0.132',
			'4.0.131',
			'4.0.130',
			'4.0.129',
			'4.0.128',
			'4.0.127',
			'4.0.126',
			'4.0.125',
			'4.0.124',
			'4.0.123',
			'4.0.122',
			'4.0.121',
			'4.0.120',
			'4.0.119',
			'4.0.118',
			'4.0.117',
			'4.0.116',
			'4.0.115',
			'4.0.114',
			'4.0.113',
			'4.0.112',
			'4.0.111',
			'4.0.110',
			'4.0.109',
			'4.0.108',
			'4.0.107',
			'4.0.106',
			'4.0.105',
			'4.0.104',
			'4.0.103',
			'4.0.102',
			'4.0.101',
			'4.0.100',
			'4.0.99',
			'4.0.98',
			'4.0.97',
			'4.0.96',
			'4.0.95',
			'4.0.94',
			'4.0.93',
			'4.0.92',
			'4.0.91',
			'4.0.90',
			'4.0.89',
			'4.0.88',
			'4.0.87',
			'4.0.86',
			'4.0.85',
			'4.0.84',
			'4.0.83',
			'4.0.82',
			'4.0.81',
			'4.0.80',
			'4.0.79',
			'4.0.78',
			// continued until 4.0.0.. but old versions don't have bug notification system
		],
	},
	{
		title: 'Bad color mapping with OffthreadVideo',
		description:
			'Videos in the bt.709 color space are not properly mapped to the sRGB color space. Use v4.0.155 instead.',
		link: 'https://github.com/remotion-dev/remotion/issues/3850#issuecomment-2105628446',
		versions: ['4.0.154'],
	},
	{
		title: '@remotion/renderer import exception',
		description:
			'The @remotion/renderer package was compiled in a bad way and does not work.',
		link: 'https://github.com/remotion-dev/remotion/releases/tag/v4.0.151',
		versions: ['4.0.152', '4.0.151'],
	},
	{
		title: 'Duplicate key warning',
		description:
			'Extraneous duplicate key warning in the console in this version.',
		link: 'https://github.com/remotion-dev/remotion/releases/tag/v4.0.150',
		versions: ['4.0.149'],
	},
	{
		title: 'Slowdown with <TransitionSeries>',
		description:
			'All sequences were rendered all the time, slowing down the render and making it more crash-prone.',
		link: 'https://github.com/remotion-dev/remotion/pull/3736',
		versions: ['4.0.140', '4.0.141', '4.0.142'],
	},
	{
		title: 'Audio issues on Lambda',
		description:
			'The new seamless audio concatenation feature does not produce clean audio in all cases.',
		link: 'https://github.com/remotion-dev/remotion/pull/3518',
		versions: ['4.0.124'],
	},
	{
		title: 'Videos have bad colors during rendering',
		description:
			'Videos could become too dark when rendering by being tone-mapped when they should not. Upgrade to 4.0.118.',
		link: 'https://github.com/remotion-dev/remotion/pull/3518',
		versions: ['4.0.117'],
	},
	{
		title: 'Every render now by default emits a repro.zip',
		description:
			'This was unintentional and has been removed. Upgrade to 4.0.116.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.115'],
	},
	{
		title: 'Video playback in Studio and Player is broken',
		description:
			'OffthreadVideo, Video and Audio tags are affected. Upgrade to 4.0.113.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.111', '4.0.112'],
	},
	{
		title: 'Remotion Lambda is broken',
		description: 'A render would not start on the Lambda. Upgrade to 4.0.99.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.98'],
	},
	{
		title: 'Too tight dependency on zod',
		description:
			'Remotion would require zod and @remotion/zod-types even though it should be optional.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.92', '4.0.93', '4.0.94', '4.0.95'],
	},
	{
		title: 'Broken release',
		description: 'Rendering may fail. Upgrade to 4.0.94.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.90', '4.0.91'],
	},
	{
		title: '<Video> seeking breaks during rendering for some videos',
		description: 'A timeout would occur on some videos.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.86', '4.0.87', '4.0.88'],
	},
	{
		title: 'Lambda throws an undefined variable error',
		description: 'The publish script of this version was broken.',
		link: 'https://remotion.dev/changelog',
		versions: ['4.0.73'],
	},
	{
		title: 'Subsequent Lambda renders become slow',
		description: 'A warm Lambda function would get slower over time.',
		link: 'https://github.com/remotion-dev/remotion/pull/3184',
		versions: ['4.0.66', '4.0.67', '4.0.68', '4.0.69', '4.0.70'],
	},
	{
		title: '<Player> does not render',
		description: 'The <Player> component does not render anything.',
		link: 'https://github.com/remotion-dev/remotion/issues/3128',
		versions: ['4.0.63'],
	},
	{
		title: 'Slow rendering for long videos',
		description: 'A render could get progressively slower the longer it runs.',
		link: 'https://github.com/remotion-dev/remotion/pull/3106',
		versions: [
			'4.0.59',
			'4.0.58',
			'4.0.57',
			'4.0.56',
			'4.0.55',
			'4.0.54',
			'4.0.53',
			'4.0.52',
			'4.0.51',
			'4.0.50',
			'4.0.49',
			'4.0.48',
			'4.0.47',
			'4.0.46',
			'4.0.45',
			'4.0.44',
			'4.0.43',
			'4.0.42',
			'4.0.41',
			'4.0.40',
			'4.0.39',
			'4.0.38',
			'4.0.37',
			'4.0.36',
			'4.0.35',
			'4.0.34',
			'4.0.33', // Previous versions did not not have bug notification system
		],
	},
	{
		title: 'Broken Lambda',
		description: 'Lambda rendering fails with IPv6 error.',
		link: 'https://github.com/remotion-dev/remotion/pull/3019',
		versions: ['4.0.49'],
	},
	{
		title: 'OffthreadVideo could crash',
		description:
			'On some videos, OffthreadVideo could crash without proper error handling.',
		link: 'https://github.com/remotion-dev/remotion/pull/2882',
		versions: ['4.0.36', '4.0.37', '4.0.38'],
	},
	{
		title: 'Slow OffthreadVideo performance',
		description:
			'Without an explicit cache size, the OffthreadVideo component would run with no cache.',
		link: 'https://github.com/remotion-dev/remotion/pull/2882',
		versions: ['4.0.33', '4.0.34', '4.0.35', '4.0.36'],
	},
	{
		title: '<Thumbnail> component would crash',
		description:
			'<Thumbnail> component in a React app would crash if a <Sequence> was used.',
		link: 'https://github.com/remotion-dev/remotion/pull/2944',
		versions: ['4.0.43', '4.0.42'],
	},
];

const getVersionBugs = (version: string) => {
	const selectedVersionBugs = bugs.filter((bug) => {
		return bug.versions.includes(version);
	});
	return selectedVersionBugs;
};

export default async function handler(request: Request) {
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'access-control-allow-origin': '*',
				'access-control-allow-methods': 'GET',
				'access-control-allow-headers': 'Content-Type',
			},
		});
	}

	const urlParams = new URL(request.url).searchParams;

	const query = Object.fromEntries(urlParams);
	const v = query['v'].replace('v', '') as string;

	const bugs = getVersionBugs(v);

	return new Response(
		JSON.stringify({
			version: v,
			bugs,
		}),
		{
			status: 200,
			headers: {
				'content-type': 'application/json',
				'access-control-allow-origin': '*',
			},
		},
	);
}

export const config = {
	runtime: 'edge',
};
