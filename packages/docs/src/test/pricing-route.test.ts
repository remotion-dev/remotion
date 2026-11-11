import {expect, test} from 'bun:test';
import type {RouteWithSrc} from '@vercel/routing-utils';
import middleware, {config as middlewareConfig} from '../../middleware';
import {config} from '../../vercel';

const sourceRoutes = config.routes?.filter(
	(route): route is RouteWithSrc =>
		'src' in route && typeof route.src === 'string',
);

test.each(['/pricing', '/pricing/'])(
	'%s bypasses documentation middleware redirects',
	async (path) => {
		expect(middlewareConfig.matcher).not.toContain('/pricing');
		expect(
			await middleware(new Request(`https://www.remotion.dev${path}`)),
		).toBeUndefined();
	},
);

test('serves pricing from Pro with session-aware navigation', () => {
	const path = '/pricing';
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
});

test('normalizes the pricing URL before proxying it', () => {
	const redirect = sourceRoutes?.find(
		(route) => new RegExp(route.src).test('/pricing/') && route.status === 308,
	);
	expect(redirect?.headers?.Location).toBe('/pricing');
});

test('redirects the legacy license URL to the pricing page', () => {
	const redirect = sourceRoutes?.find(
		(route) => new RegExp(route.src).test('/license') && route.status === 307,
	);
	expect(redirect?.headers?.Location).toBe('/pricing');
});
