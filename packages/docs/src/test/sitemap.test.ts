import {expect, test} from 'bun:test';
import type {RouteWithSrc} from '@vercel/routing-utils';
import {config} from '../../vercel';

const sourceRoutes = config.routes?.filter(
	(route): route is RouteWithSrc =>
		'src' in route && typeof route.src === 'string',
);

test('redirects the legacy sitemap URL to the sitemap index', () => {
	const redirect = sourceRoutes?.find(
		(route) => new RegExp(route.src).test('/sitemap') && route.status === 308,
	);

	expect(redirect?.headers?.Location).toBe('/sitemap.xml');
});

test('serves the portal sitemap through the existing backend', () => {
	const rewrite = sourceRoutes?.find(
		(route) =>
			new RegExp(route.src).test('/portal-sitemap.xml') &&
			route.dest?.startsWith('https://www.remotion.pro/sitemap.xml'),
	);

	expect(rewrite).toBeDefined();
	expect(rewrite?.transforms).toContainEqual({
		type: 'request.headers',
		op: 'set',
		target: {key: 'x-remotion-public-origin'},
		args: 'https://www.remotion.dev',
	});
});

test('indexes the documentation and portal sitemaps on remotion.dev', async () => {
	const xml = await Bun.file(
		new URL('../../static/sitemap.xml', import.meta.url),
	).text();

	expect(xml).toContain(
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	);
	expect(xml.match(/<loc>[^<]+<\/loc>/g)).toEqual([
		'<loc>https://www.remotion.dev/docs-sitemap.xml</loc>',
		'<loc>https://www.remotion.dev/portal-sitemap.xml</loc>',
	]);
});
