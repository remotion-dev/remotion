import {afterAll, expect, mock, test} from 'bun:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

mock.module('@docusaurus/Head', () => {
	return {
		default: ({children}: {children: React.ReactNode}) =>
			React.createElement(React.Fragment, null, children),
	};
});

mock.module('@docusaurus/useDocusaurusContext', () => {
	return {
		default: () => ({
			siteConfig: {
				url: 'https://remotion.dev',
			},
		}),
	};
});

const {ElementHead} = await import('../components/Elements/ElementHead');

afterAll(() => {
	mock.restore();
});

test('renders overview metadata for Elements', () => {
	const markup = renderToStaticMarkup(
		React.createElement(ElementHead, {category: null}),
	);

	expect(markup).toContain('<title>Remotion Elements | Remotion</title>');
	expect(markup).toContain(
		'<meta property="og:title" content="Remotion Elements | Remotion"/>',
	);
	expect(markup).toContain(
		'<meta name="description" content="Drop-in, remixable video building blocks for Remotion."/>',
	);
	expect(markup).toContain(
		'<link rel="canonical" href="https://remotion.dev/elements/"/>',
	);
	expect(markup).toContain(
		'<meta property="og:image" content="https://remotion.dev/img/social-preview.png"/>',
	);
	expect(markup).toContain(
		'<meta name="twitter:image" content="https://remotion.dev/img/social-preview.png"/>',
	);
	expect(markup).toContain('<meta name="twitter:card" content="summary_large_image"/>');
});

test('renders category metadata for Elements', () => {
	const markup = renderToStaticMarkup(
		React.createElement(ElementHead, {category: 'backgrounds'}),
	);

	expect(markup).toContain('<title>Backgrounds | Remotion Elements</title>');
	expect(markup).toContain(
		'<meta property="og:title" content="Backgrounds | Remotion Elements"/>',
	);
	expect(markup).toContain(
		"<meta name=\"description\" content=\"Browse backgrounds Elements in Remotion&#x27;s library.\"/>",
	);
	expect(markup).toContain(
		'<link rel="canonical" href="https://remotion.dev/elements/backgrounds/"/>',
	);
	expect(markup).toContain(
		'<meta property="og:image" content="https://remotion.dev/img/social-preview.png"/>',
	);
});
