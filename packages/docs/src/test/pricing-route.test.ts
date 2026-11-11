import {expect, test} from 'bun:test';
import type {RouteWithSrc} from '@vercel/routing-utils';
import {config} from '../../vercel';

const sourceRoutes = config.routes?.filter(
	(route): route is RouteWithSrc =>
		'src' in route && typeof route.src === 'string',
);

test.each(['/pricing', '/pricing/'])(
	'serves %s from Pro with session-aware navigation',
	(path) => {
		const matchingRoutes = sourceRoutes?.filter((route) =>
			new RegExp(route.src).test(path),
		);
		const rewrite = matchingRoutes?.find((route) =>
			route.dest?.startsWith(`https://www.remotion.pro${path}`),
		);
		expect(rewrite).toBeDefined();
		expect(rewrite?.transforms).toContainEqual({
			type: 'request.headers',
			op: 'set',
			target: {key: 'x-remotion-public-origin'},
			args: 'https://www.remotion.dev',
		});
		expect(
			matchingRoutes?.some(
				(route) => route.headers?.['Cache-Control'] === 'private, no-store',
			),
		).toBe(true);
		expect(matchingRoutes?.filter((route) => route.status)).toEqual([]);
	},
);

test('redirects the legacy license URL to the pricing page', () => {
	const redirect = sourceRoutes?.find(
		(route) => new RegExp(route.src).test('/license') && route.status === 307,
	);
	expect(redirect?.headers?.Location).toBe('/pricing');
});
