import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';
import {elementDefinitions} from '../components/Elements/element-definitions';
import {
	getElementDocumentationUrl,
	getElementLibrarySections,
} from '../components/Elements/element-library-data';
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

test('expands the actual Element overview into categorized Markdown', () => {
	const sourcePath = path.join(__dirname, '..', '..', 'elements', 'index.mdx');
	const output = expandRawMarkdownComponents({
		raw: readFileSync(sourcePath, 'utf8'),
		sourcePath,
	});

	expect(output).not.toContain('ElementLibrary');
	for (const section of getElementLibrarySections(null)) {
		expect(output).toContain(`## ${section.label}`);
	}

	for (const definition of Object.values(elementDefinitions)) {
		expect(output).toContain(
			`[${definition.displayName}](${getElementDocumentationUrl(definition)})`,
		);
		expect(output).toContain(definition.description);
	}
});

test('expands the actual Element category indexes without unrelated entries', () => {
	const sections = getElementLibrarySections(null);

	for (const section of sections) {
		const sourcePath = path.join(
			__dirname,
			'..',
			'..',
			'elements',
			section.category,
			'index.mdx',
		);
		const output = expandRawMarkdownComponents({
			raw: readFileSync(sourcePath, 'utf8'),
			sourcePath,
		});

		expect(output).not.toContain('ElementLibrary');
		for (const definition of Object.values(elementDefinitions)) {
			const elementLink = `[${definition.displayName}](${getElementDocumentationUrl(definition)})`;
			if (definition.category === section.category) {
				expect(output).toContain(elementLink);
			} else {
				expect(output).not.toContain(elementLink);
			}
		}
	}
});

test('rejects an invalid Element category in raw Markdown', () => {
	expect(() =>
		expandRawMarkdownComponents({
			raw: '<ElementLibrary category="invalid" />',
			sourcePath: '/elements/invalid/index.mdx',
		}),
	).toThrow('Invalid Element category: invalid');
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
