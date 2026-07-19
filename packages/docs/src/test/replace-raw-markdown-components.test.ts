import {expect, test} from 'bun:test';
import {
	expandRawMarkdownComponents,
	getStringAttribute,
	replaceRawMarkdownComponents,
} from '../raw-markdown/replace-components';

test('supports registering additional component replacements', () => {
	const output = replaceRawMarkdownComponents({
		raw: 'Hello <User name="Mia" />!',
		sourcePath: '/docs/example.mdx',
		replacements: [
			{
				componentName: 'User',
				render: ({attributes}) =>
					`**${getStringAttribute({attributes, name: 'name'})}**`,
			},
		],
	});

	expect(output).toBe('Hello **Mia**!');
});

test('replaces Installation with its default command', () => {
	const output = expandRawMarkdownComponents({
		raw: '<Installation pkg="@remotion/studio" />',
		sourcePath: '/docs/example.mdx',
	});

	expect(output).toBe(
		['```bash', 'npx remotion add @remotion/studio', '```'].join('\n'),
	);
});

test('replaces the Studio table of contents and removes its import', () => {
	const output = expandRawMarkdownComponents({
		raw: [
			'import { TableOfContents } from "./TableOfContents";',
			'',
			'<TableOfContents />',
		].join('\n'),
		sourcePath: '/docs/studio/api.mdx',
	});

	expect(output).not.toContain('TableOfContents');
	expect(output).toContain(
		'| [`getStaticFiles()`](/docs/studio/get-static-files) |',
	);
});
