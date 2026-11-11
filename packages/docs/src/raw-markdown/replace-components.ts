import fs from 'fs';
import path from 'path';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {VERSION} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {studioTableOfContents} from '../../docs/studio/table-of-contents-data';
import {optionDescriptionToMarkdown} from '../../option-description';
import {
	getElementLibrarySections,
	isElementCategory,
	type ElementCategory,
} from '../components/Elements/element-library-data';
import {thirdPartyElementLibraries} from '../components/Elements/third-party-element-library-data';
import {getElementMarkdownUrl} from './element-markdown';

export type RawMarkdownComponentReplacement = {
	readonly componentName: string;
	readonly render: (context: {
		readonly attributes: string;
		readonly sourcePath: string;
	}) => string | null;
	readonly appliesTo?: (sourcePath: string) => boolean;
	readonly removeImport?: RegExp;
	readonly required?: boolean;
};

const escapeRegExp = (value: string) => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getStringAttribute = ({
	attributes,
	name,
}: {
	attributes: string;
	name: string;
}) => {
	const escapedName = escapeRegExp(name);
	const match = attributes.match(
		new RegExp(`(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`),
	);

	return match?.[1] ?? match?.[2] ?? null;
};

export const replaceRawMarkdownComponents = ({
	raw,
	sourcePath,
	replacements,
}: {
	raw: string;
	sourcePath: string;
	replacements: readonly RawMarkdownComponentReplacement[];
}) => {
	return replacements.reduce((currentRaw, replacement) => {
		if (replacement.appliesTo && !replacement.appliesTo(sourcePath)) {
			return currentRaw;
		}

		const componentPattern = new RegExp(
			`<${escapeRegExp(replacement.componentName)}\\b([^<>]*?)\\s*/>`,
			'g',
		);
		let replacementCount = 0;
		const withMarkdown = currentRaw.replace(
			componentPattern,
			(fullMatch, attributes: string) => {
				const markdown = replacement.render({attributes, sourcePath});
				if (markdown === null) {
					return fullMatch;
				}

				replacementCount++;
				return markdown;
			},
		);

		if (replacement.required && replacementCount === 0) {
			throw new Error(
				`Could not expand <${replacement.componentName}> in ${sourcePath}`,
			);
		}

		if (!replacement.removeImport || replacementCount === 0) {
			return withMarkdown;
		}

		const withoutImport = withMarkdown.replace(replacement.removeImport, '');
		if (replacement.required && withoutImport === withMarkdown) {
			throw new Error(
				`Could not remove the <${replacement.componentName}> import in ${sourcePath}`,
			);
		}

		return withoutImport;
	}, raw);
};

const markdownTable = (
	items: readonly {
		link: string;
		label: string;
		description: string;
	}[],
) => {
	return [
		'| API | Description |',
		'| --- | --- |',
		...items.map(
			(item) => `| [\`${item.label}\`](${item.link}) | ${item.description} |`,
		),
	].join('\n');
};

const getInstallationMarkdown = (pkg: string) => {
	const pkgList = pkg.split(' ');
	const allRemotionOnly = pkgList.every(
		(packageName) =>
			packageName.startsWith('@remotion/') || packageName === 'remotion',
	);
	const showRemotionCli =
		allRemotionOnly &&
		!pkgList.includes('remotion') &&
		!pkgList.includes('@remotion/cli');

	const command = showRemotionCli
		? `npx remotion add ${pkg}`
		: `npm i --save-exact ${pkgList
				.map((packageName) => {
					if (
						packageName.startsWith('@remotion/') ||
						packageName === 'remotion'
					) {
						return `${packageName}@${VERSION}`;
					}

					return packageName;
				})
				.join(' ')}`;

	return ['```bash', command, '```'].join('\n');
};

const studioApiPath = path.join('docs', 'studio', 'api.mdx');
const thirdPartyElementsPath = path.resolve(
	__dirname,
	'..',
	'..',
	'elements',
	'libraries.mdx',
);

const renderElementLibraryMarkdown = (attributes: string) => {
	const categoryAttribute = getStringAttribute({
		attributes,
		name: 'category',
	});
	let category: ElementCategory | null;

	if (categoryAttribute !== null) {
		if (!isElementCategory(categoryAttribute)) {
			throw new Error(`Invalid Element category: ${categoryAttribute}`);
		}

		category = categoryAttribute;
	} else if (/(?:^|\s)category\s*=\s*\{\s*null\s*\}/.test(attributes)) {
		category = null;
	} else {
		throw new Error(
			'The <ElementLibrary> component is missing a category prop',
		);
	}

	return getElementLibrarySections(category)
		.map((section) => {
			const list = section.definitions
				.map(
					(definition) =>
						`- [${definition.displayName}](${getElementMarkdownUrl(definition)}) — ${definition.description}`,
				)
				.join('\n');

			return category === null ? `## ${section.label}\n\n${list}` : list;
		})
		.join('\n\n');
};

const rawMarkdownComponentReplacements: readonly RawMarkdownComponentReplacement[] =
	[
		{
			componentName: 'ElementLibrary',
			render: ({attributes}) => renderElementLibraryMarkdown(attributes),
			removeImport:
				/^import\s+\{\s*ElementLibrary\s*\}\s+from\s+['"]@site\/src\/components\/Elements\/ElementLibrary['"];?\s*\n/m,
		},
		{
			componentName: 'ThirdPartyElementLibraries',
			appliesTo: (sourcePath) =>
				path.resolve(sourcePath) === thirdPartyElementsPath,
			render: () =>
				[
					'For the Elements made by Remotion, see the [Remotion Elements index](https://www.remotion.dev/elements/index.md).',
					'To install an Element from a page that embeds its payload, run [`npx remotion elements use <url> --composition <composition-id> --yes`](https://www.remotion.dev/docs/cli/elements/use.md).',
					thirdPartyElementLibraries
						.map((library) =>
							[
								`- [${library.displayName}](${library.browseUrl})`,
								`  - Element Library: \`${library.libraryUrl}\``,
								...(library.markdownIndexUrl === null
									? []
									: [`  - Markdown index: ${library.markdownIndexUrl}`]),
							].join('\n'),
						)
						.join('\n'),
				].join('\n\n'),
			removeImport:
				/^import\s+\{\s*ThirdPartyElementLibraries\s*\}\s+from\s+['"]@site\/src\/components\/Elements\/ThirdPartyElementLibraries['"];?\s*\n/m,
			required: true,
		},
		{
			componentName: 'Installation',
			render: ({attributes}) => {
				const pkg = getStringAttribute({attributes, name: 'pkg'});
				if (pkg === null) {
					throw new Error('The <Installation> component is missing a pkg prop');
				}

				return getInstallationMarkdown(pkg);
			},
		},
		{
			componentName: 'TableOfContents',
			appliesTo: (sourcePath) =>
				path.normalize(sourcePath).endsWith(studioApiPath),
			render: () => markdownTable(studioTableOfContents),
			removeImport:
				/^import\s+\{\s*TableOfContents\s*\}\s+from\s+['"]\.\/TableOfContents['"];\s*\n/m,
			required: true,
		},
		{
			componentName: 'Options',
			render: ({attributes}) => {
				const id = getStringAttribute({attributes, name: 'id'});
				const option = Object.values(BrowserSafeApis.options).find(
					(o) => o.id === id,
				);
				if (!option) {
					throw new Error(`Unknown option in <Options>: ${id}`);
				}

				const cli = /(?:^|\s)cli(?:\s|$|=\{true\})/.test(attributes);
				return optionDescriptionToMarkdown(
					option.description(cli ? 'cli' : 'ssr'),
				).trim();
			},
		},
		{
			componentName: 'Pricing',
			render: ({attributes}) => {
				const toMarkdownUrl = (name: string) => {
					const href = getStringAttribute({attributes, name});
					if (href === null) {
						throw new Error(`The <Pricing> component is missing ${name}`);
					}

					return href.replace(
						/^\/docs\/(.*)$/,
						'https://www.remotion.dev/docs/$1.md',
					);
				};

				return `For the license terms, see [LICENSE.md](${toMarkdownUrl('licenseHref')}), the [License FAQ](${toMarkdownUrl('faqHref')}) and the [Terms and Conditions](${toMarkdownUrl('termsHref')}).`;
			},
			removeImport:
				/^import\s+\{\s*Pricing\s*\}\s+from\s+['"]@remotion\/promo-pages\/dist\/homepage\/Pricing\.js['"];?\s*\n/m,
		},
		{
			componentName: 'MinNodeVersion',
			render: () => String(NoReactInternals.MIN_NODE_VERSION),
		},
		{
			componentName: 'MinBunVersion',
			render: () => String(NoReactInternals.MIN_BUN_VERSION),
		},
	];

const decodeEntities = (value: string) => {
	return value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&');
};

const jsxTextPattern = /\{\s*(['"`])(.*?)\1\s*\}|<[^>]+>/g;

const stripJsx = (value: string) => {
	return value
		.replace(
			/<code>([\s\S]*?)<\/code>|\{\s*(['"`])(.*?)\2\s*\}|<[^>]+>/g,
			(
				_,
				code: string | undefined,
				quote: string | undefined,
				text: string | undefined,
			) => {
				if (code !== undefined) {
					const inner = code.replace(
						jsxTextPattern,
						(__, q: string | undefined, t: string | undefined) =>
							q === undefined ? '' : t!,
					);
					return `\`${decodeEntities(inner)}\``;
				}

				if (quote === undefined) {
					return '';
				}

				return text!.includes('<') ? `\`${text}\`` : text!;
			},
		)
		.split(/(`[^`]*`)/)
		.map((part) => (part.startsWith('`') ? part : decodeEntities(part)))
		.join('')
		.replace(/\s+/g, ' ')
		.trim();
};

// Table of contents components are a list of <TOCItem link="..."> entries.
// Read them from the component source so that the Markdown lists the pages.
const expandTableOfContents = ({
	raw,
	sourcePath,
}: {
	raw: string;
	sourcePath: string;
}) => {
	let result = raw;
	for (const [importStatement, names, importPath] of Array.from(
		raw.matchAll(/^import\s+\{([^}]*)\}\s+from\s+['"](\.[^'"]+)['"];?\s*\n/gm),
	)) {
		if (
			!names.split(',').some((name) => name.trim().endsWith('TableOfContents'))
		) {
			continue;
		}

		const componentPath = ['.tsx', '/index.tsx', '']
			.map((ext) => path.resolve(path.dirname(sourcePath), importPath + ext))
			.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
		if (!componentPath) {
			continue;
		}

		const componentSource = fs.readFileSync(componentPath, 'utf8');
		let expandedAll = true;
		for (const name of names.split(',').map((n) => n.trim())) {
			if (!name.endsWith('TableOfContents')) {
				expandedAll = false;
				continue;
			}

			const body = componentSource
				.split(/^export const /m)
				.find(
					(part) => part.startsWith(`${name}:`) || part.startsWith(`${name} `),
				);
			const items = (body ?? '')
				.split(/(?=\blink=")/)
				.slice(1)
				.map((chunk) => {
					const link = chunk.match(/^link="([^"]+)"/)![1];
					const label =
						chunk.match(/<strong[^>]*>([\s\S]*?)<\/strong>/)?.[1] ??
						chunk.match(/\bname="([^"]+)"/)?.[1] ??
						chunk.match(/<div[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
						link;
					const description =
						chunk.match(/<\/strong>\s*<div[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
						chunk.match(/\bdescription="([^"]+)"/)?.[1] ??
						null;
					const url = link
						.replace(/^\/docs\/([^#?]*)/, 'https://www.remotion.dev/docs/$1.md')
						.replace(/^\//, 'https://www.remotion.dev/');
					return `- [${stripJsx(label)}](${url})${description ? ` — ${stripJsx(description)}` : ''}`;
				});
			const tag = new RegExp(`<${name}\\s*/>`, 'g');
			if (items.length === 0 || !tag.test(result)) {
				expandedAll = false;
				continue;
			}

			result = result.replace(tag, () => items.join('\n'));
		}

		if (expandedAll) {
			result = result.replace(importStatement, '');
		}
	}

	return result;
};

export const expandRawMarkdownComponents = ({
	raw,
	sourcePath,
}: {
	raw: string;
	sourcePath: string;
}) => {
	return expandTableOfContents({
		raw: replaceRawMarkdownComponents({
			raw,
			sourcePath,
			replacements: rawMarkdownComponentReplacements,
		}),
		sourcePath,
	});
};
