import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import {createRequire} from 'module';
import path from 'path';
import {pathToFileURL} from 'url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as jsxRuntime from 'react/jsx-runtime';
import elementSidebars from '../../elements-sidebars';
import {
	expandElementSourceReferences,
	getRemotionElementDependencies,
	getRemotionElementSourceMap,
} from '../../plugins/element-source-utils';
import remarkElementSource from '../../plugins/remark-element-source';
import {elementDefinitions} from '../components/Elements/element-definitions';
import {createElementPayloadFromDefinition} from '../components/Elements/element-drag-data';
import {
	getElementDocumentationUrl,
	getElementLibrarySections,
} from '../components/Elements/element-library-data';
import {elementRegistry} from '../components/Elements/element-registry';
import {
	getElementCompositionId,
	getElementDefinition,
	getElementDimensionsLabel,
} from '../components/Elements/element-utils';
import {ElementLibrary} from '../components/Elements/ElementLibrary';
import {getElementPreviewDimensions} from '../components/Elements/ElementPreviewComposition';
import {Seo} from '../components/Seo';

const elementsRoot = path.join(__dirname, '..', '..', 'elements');
const templateRoot = path.join(__dirname, '..', '..', 'elements-template');
const staticElementsRoot = path.join(
	__dirname,
	'..',
	'..',
	'static',
	'elements',
);
const elementDefinitionList = elementDefinitions;
const exactVersionPattern =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

type Element = {
	name: string;
	mdxPath: string;
	tsxPath: string;
};

const findElements = (root: string): Element[] => {
	const elements: Element[] = [];

	const walk = (dir: string) => {
		const indexMdx = path.join(dir, 'index.mdx');
		if (existsSync(indexMdx)) {
			const tsxFiles = readdirSync(dir).filter(
				(f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'),
			);
			if (tsxFiles.length > 0) {
				const relativeName = path.relative(root, dir) || path.basename(dir);
				elements.push({
					name: relativeName.split(path.sep).join('/'),
					mdxPath: indexMdx,
					tsxPath: path.join(dir, tsxFiles[0]),
				});
				return;
			}
		}

		for (const entry of readdirSync(dir)) {
			const full = path.join(dir, entry);
			if (statSync(full).isDirectory()) {
				walk(full);
			}
		}
	};

	walk(root);
	return elements;
};

const productionElements = findElements(elementsRoot);
const allElements = [...productionElements, ...findElements(templateRoot)];

describe('Elements must follow the colocated single-file format', () => {
	test('remark plugin nests source inside ElementPage', () => {
		const element = allElements[0];
		const relativeSourceFile = path.relative(
			path.dirname(element.mdxPath),
			element.tsxPath,
		);
		const sourceFile = relativeSourceFile.startsWith('.')
			? relativeSourceFile
			: `./${relativeSourceFile}`;
		const elementPage = {
			type: 'mdxJsxFlowElement',
			name: 'ElementPage',
			attributes: [
				{
					type: 'mdxJsxAttribute',
					name: 'sourceFile',
					value: sourceFile,
				},
			],
			children: [],
		};
		const tree = {type: 'root', children: [elementPage]};

		remarkElementSource({elementRegistry})(tree, {path: element.mdxPath});

		expect(tree.children).toHaveLength(1);
		expect(elementPage.children).toHaveLength(1);
		expect(elementPage.children[0]).toMatchObject({
			type: 'code',
			lang: 'tsx',
		});
		expect(
			elementPage.attributes.some((attr) => attr.name === 'sourceFile'),
		).toBe(false);
		expect(
			elementPage.attributes.some((attr) => attr.name === 'sourceCode'),
		).toBe(true);
		expect(
			elementPage.attributes.some(
				(attribute) => attribute.name === 'dependencies',
			),
		).toBe(false);
	});

	test('extracts dependencies using the TypeScript parser', () => {
		expect(
			getRemotionElementDependencies(`
				import type {FC} from 'react';
				import {createRoot} from 'react-dom/client';
				import {loadFont} from '@remotion/google-fonts/Inter';
				import {AbsoluteFill} from 'remotion';
				// import value from 'comment-dependency';
				const string = "import('string-dependency')";
				const template = \`import('template-dependency')\`;
				export {value} from 'actual-reexport';
				const lazy = import('actual-dynamic');

				export const Element: FC = () => <AbsoluteFill />;
			`),
		).toEqual(['@remotion/google-fonts', 'actual-reexport', 'actual-dynamic']);
	});

	for (const element of allElements) {
		describe(element.name, () => {
			const tsx = readFileSync(element.tsxPath, 'utf8');
			const mdx = readFileSync(element.mdxPath, 'utf8');

			test('ElementPage sourceFile expands to the source file', () => {
				const expanded = expandElementSourceReferences({
					raw: mdx,
					sourceFilePath: element.mdxPath,
				});

				expect(expanded).toContain(
					`\`\`\`tsx twoslash title="${path.basename(element.tsxPath)}"\n${tsx.trim()}\n\`\`\``,
				);
			});
		});
	}
});

describe('Element MDX pages', () => {
	test('resolves each page definition through its real MDX expression', async () => {
		// Use the same MDX compiler as Docusaurus.
		const requireFromDocusaurus = createRequire(
			require.resolve('@docusaurus/core/package.json'),
		);
		const requireFromMdxLoader = createRequire(
			requireFromDocusaurus.resolve('@docusaurus/mdx-loader'),
		);
		const {evaluate} = requireFromMdxLoader('@mdx-js/mdx');
		for (const element of productionElements) {
			const source = readFileSync(element.mdxPath, 'utf8')
				.replace(/^---[\s\S]*?---\s*/, '')
				// Keep the page's imports and definition expression real; replace only the
				// Docusaurus UI, which requires its build-generated module aliases.
				.replace(/import \{ElementPage\} from '[^']+';/, '')
				.replaceAll(
					'@site/',
					pathToFileURL(path.join(elementsRoot, '..')).href + '/',
				);
			const {default: Page} = await evaluate(source, {
				...jsxRuntime,
				baseUrl: pathToFileURL(element.mdxPath),
			});
			const markup = renderToStaticMarkup(
				React.createElement(Page, {
					components: {
						ElementPage: ({
							definition,
						}: {
							readonly definition: (typeof elementDefinitions)[number];
						}) => {
							expect(definition.slug).toBe(element.name);
							return React.createElement('span', null, definition.displayName);
						},
					},
				}),
			);
			expect(markup).toContain(getElementDefinition(element.name).displayName);
		}
	});
});

describe('Element library', () => {
	test('injects the exact source files needed by each listing', () => {
		const completeSourceCodeBySlug = getRemotionElementSourceMap({
			elementsRoot,
		});
		expect(Object.keys(completeSourceCodeBySlug).sort()).toEqual(
			productionElements.map((element) => element.name).sort(),
		);
		for (const element of productionElements) {
			expect(completeSourceCodeBySlug[element.name]).toBe(
				readFileSync(element.tsxPath, 'utf8').trimEnd(),
			);
		}

		const makeLibraryNode = (category: string | null) => ({
			type: 'mdxJsxFlowElement',
			name: 'ElementLibrary',
			attributes: [
				{
					type: 'mdxJsxAttribute',
					name: 'category',
					value:
						category === null
							? {
									type: 'mdxJsxAttributeValueExpression',
									value: 'null',
								}
							: category,
				},
			],
			children: [],
		});
		const getInjectedSourceCodeBySlug = (node: {
			attributes: readonly {readonly name?: string; readonly value?: unknown}[];
		}) => {
			const attribute = node.attributes.find(
				(candidate) => candidate.name === 'sourceCodeBySlug',
			);
			if (
				typeof attribute?.value !== 'object' ||
				attribute.value === null ||
				!('value' in attribute.value) ||
				typeof attribute.value.value !== 'string'
			) {
				throw new Error('ElementLibrary source map was not injected');
			}

			return JSON.parse(attribute.value.value) as Record<string, string>;
		};

		const overview = makeLibraryNode(null);
		remarkElementSource({elementRegistry})(
			{type: 'root', children: [overview]},
			{path: path.join(elementsRoot, 'index.mdx')},
		);
		expect(getInjectedSourceCodeBySlug(overview)).toEqual(
			completeSourceCodeBySlug,
		);

		const storytelling = makeLibraryNode('storytelling');
		remarkElementSource({elementRegistry})(
			{type: 'root', children: [storytelling]},
			{path: path.join(elementsRoot, 'storytelling', 'index.mdx')},
		);
		expect(getInjectedSourceCodeBySlug(storytelling)).toEqual({
			'storytelling/on-screen-messages':
				completeSourceCodeBySlug['storytelling/on-screen-messages'],
			'storytelling/polaroid-pictures':
				completeSourceCodeBySlug['storytelling/polaroid-pictures'],
			'text/news-article-highlight':
				completeSourceCodeBySlug['text/news-article-highlight'],
		});

		const missingSource = makeLibraryNode(null);
		expect(() =>
			remarkElementSource({
				elementRegistry: {
					...elementRegistry,
					'missing/source': {
						category: 'text',
						displayName: 'Missing Source',
					},
				},
			})(
				{type: 'root', children: [missingSource]},
				{path: path.join(elementsRoot, 'index.mdx')},
			),
		).toThrow('Missing source pages: missing/source.');
	});

	test('renders cards and filters the real category entry points', () => {
		const sourceCodeBySlug = getRemotionElementSourceMap({elementsRoot});
		const overviewMarkup = renderToStaticMarkup(
			React.createElement(ElementLibrary, {
				category: null,
				sourceCodeBySlug,
			}),
		);
		const sections = getElementLibrarySections(null);

		for (const definition of elementDefinitionList) {
			expect(overviewMarkup).toContain(definition.displayName);
			expect(overviewMarkup).toContain(definition.preview.posterUrl);
			expect(overviewMarkup).toContain(getElementDocumentationUrl(definition));
		}

		for (const section of sections) {
			const categoryMarkup = renderToStaticMarkup(
				React.createElement(ElementLibrary, {
					category: section.category,
					sourceCodeBySlug,
				}),
			);
			const categoryIndex = readFileSync(
				path.join(elementsRoot, section.category, 'index.mdx'),
				'utf8',
			);

			expect(categoryIndex).toContain(
				`<ElementLibrary category="${section.category}" />`,
			);

			for (const definition of elementDefinitionList) {
				if (definition.category === section.category) {
					expect(categoryMarkup).toContain(definition.displayName);
					expect(categoryMarkup).toContain(
						getElementDocumentationUrl(definition),
					);
				} else {
					expect(categoryMarkup).not.toContain(definition.displayName);
				}
			}
		}
	});

	test('creates canonical fixed-size and adaptive drag payloads', () => {
		const sourceCodeBySlug = getRemotionElementSourceMap({elementsRoot});
		for (const slug of [
			'overlays/name-lower-third',
			'backgrounds/paper-texture',
		] as const) {
			const definition = getElementDefinition(slug);
			const sourceCode = sourceCodeBySlug[slug];
			const payload = createElementPayloadFromDefinition({
				definition,
				sourceCode,
			});

			expect(payload).toMatchObject({
				type: 'remotion-element',
				version: 1,
				durationInFrames: definition.durationInFrames,
				element: {
					dependencies: definition.dependencies,
					displayName: definition.displayName,
					durationInFrames: definition.durationInFrames,
					installationMode: definition.installationMode,
					slug,
					sourceCode,
				},
			});
			const expectedDimensions =
				definition.elementWidth !== null && definition.elementHeight !== null
					? {
							width: definition.elementWidth,
							height: definition.elementHeight,
						}
					: null;
			expect(payload.element.dimensions).toEqual(expectedDimensions);
		}
	});
});

describe('Element social previews', () => {
	test('uses the matching poster in each Element page frontmatter', () => {
		for (const definition of elementDefinitionList) {
			const mdx = readFileSync(
				path.join(elementsRoot, definition.slug, 'index.mdx'),
				'utf8',
			);
			expect(mdx).toContain(`image: ${definition.preview.posterUrl}`);
		}
	});

	test('renders Open Graph video metadata for previews', () => {
		for (const definition of elementDefinitionList) {
			const url = definition.preview.videoUrl;
			const markup = renderToStaticMarkup(
				React.createElement(
					React.Fragment,
					null,
					...Seo.renderVideo({
						height: 420,
						url,
						width: 1140,
					}),
				),
			);

			expect(markup).toContain(`<meta property="og:video" content="${url}"/>`);
			expect(markup).toContain(
				`<meta property="og:video:secure_url" content="${url}"/>`,
			);
			expect(markup).toContain(
				'<meta property="og:video:type" content="video/mp4"/>',
			);
			expect(markup).toContain(
				'<meta property="og:video:width" content="1140"/>',
			);
			expect(markup).toContain(
				'<meta property="og:video:height" content="420"/>',
			);
		}
	});
});

describe('Elements sidebar', () => {
	test('lists every registered Element exactly once', () => {
		const sidebar = elementSidebars.elementsSidebar;
		if (!Array.isArray(sidebar)) {
			throw new Error('Elements sidebar must be an array');
		}

		const elementsCategory = sidebar[0];
		if (
			typeof elementsCategory !== 'object' ||
			elementsCategory === null ||
			elementsCategory.type !== 'category' ||
			!Array.isArray(elementsCategory.items)
		) {
			throw new Error('Elements sidebar must have an Elements root category');
		}

		const listedElementPages = elementsCategory.items.flatMap((item) => {
			if (
				typeof item !== 'object' ||
				item === null ||
				item.type !== 'category' ||
				!Array.isArray(item.items)
			) {
				return [];
			}

			return item.items.filter((child) => typeof child === 'string');
		});
		const registeredElementPages = Object.keys(elementRegistry).map(
			(slug) => `${slug}/index`,
		);

		expect([...listedElementPages].sort()).toEqual(
			registeredElementPages.sort(),
		);
		expect(new Set(listedElementPages).size).toBe(listedElementPages.length);
	});
});

describe('Element preview definitions', () => {
	test('does not publish local preview URLs', () => {
		const localPreviewUrls = elementDefinitionList
			.flatMap((definition) => [
				{
					slug: definition.slug,
					type: 'poster',
					url: definition.preview.posterUrl,
				},
				{
					slug: definition.slug,
					type: 'video',
					url: definition.preview.videoUrl,
				},
			])
			.filter(({url}) => url.startsWith('/'));

		expect(localPreviewUrls).toEqual([]);
	});

	test('contains every production Element exactly once', () => {
		const elementSlugs = productionElements
			.map((element) => element.name)
			.sort();
		const definitionSlugs = elementDefinitionList
			.map((definition) => definition.slug)
			.sort();

		expect(definitionSlugs).toEqual(elementSlugs);
		expect(new Set(definitionSlugs).size).toBe(definitionSlugs.length);
	});

	test('declares every external source dependency centrally with a valid version', () => {
		for (const element of productionElements) {
			const definition = elementDefinitionList.find(
				(entry) => entry.slug === element.name,
			);
			if (!definition) {
				throw new Error(`Missing definition for ${element.name}`);
			}

			expect(
				definition.dependencies.map((dependency) => dependency.name).sort(),
			).toEqual(
				getRemotionElementDependencies(
					readFileSync(element.tsxPath, 'utf8'),
				).sort(),
			);

			for (const dependency of definition.dependencies) {
				if (dependency.name.startsWith('@remotion/')) {
					if (dependency.version !== null) {
						throw new Error(
							`${definition.slug} must use version: null for ${dependency.name}`,
						);
					}

					continue;
				}

				if (
					dependency.version === null ||
					!exactVersionPattern.test(dependency.version)
				) {
					throw new Error(
						`${definition.slug} must declare an exact version for ${dependency.name}`,
					);
				}
			}
		}
	});

	test('contains valid render metadata', () => {
		for (const definition of elementDefinitionList) {
			expect(Number.isInteger(definition.width)).toBe(true);
			expect(Number.isInteger(definition.height)).toBe(true);
			expect(Number.isInteger(definition.fps)).toBe(true);
			expect(Number.isInteger(definition.durationInFrames)).toBe(true);
			expect(Number.isInteger(definition.posterFrame)).toBe(true);
			expect(definition.width).toBeGreaterThan(0);
			expect(definition.height).toBeGreaterThan(0);
			expect(definition.fps).toBeGreaterThan(0);
			expect(definition.durationInFrames).toBeGreaterThan(0);
			expect(definition.posterFrame).toBeGreaterThanOrEqual(0);
			expect(definition.posterFrame).toBeLessThan(definition.durationInFrames);
			expect(definition.elementWidth === null).toBe(
				definition.elementHeight === null,
			);

			const dimensions = getElementPreviewDimensions(definition);
			expect(dimensions.width % 2).toBe(0);
			expect(dimensions.height % 2).toBe(0);
		}
	});

	test('keeps displayed Element dimensions separate from preview dimensions', () => {
		const adaptiveDefinition = getElementDefinition(
			'backgrounds/paper-texture',
		);
		expect(getElementDimensionsLabel(adaptiveDefinition)).toBe(
			'Adapts to composition',
		);
		expect(getElementPreviewDimensions(adaptiveDefinition)).toEqual({
			height: 1080,
			width: 1920,
		});

		const fixedDefinition = getElementDefinition('overlays/name-lower-third');
		expect(getElementDimensionsLabel(fixedDefinition)).toBe('534 × 132px');
		expect(getElementPreviewDimensions(fixedDefinition)).toEqual({
			height: 732,
			width: 1134,
		});
	});

	test('uses stable composition IDs and valid review or published preview paths', () => {
		const compositionIds = elementDefinitionList.map((definition) =>
			getElementCompositionId(definition.slug),
		);
		expect(new Set(compositionIds).size).toBe(compositionIds.length);

		for (const definition of elementDefinitionList) {
			// Preserve preview URLs published before an Element slug changes.
			const assetSlug =
				definition.slug === 'youtube/youtube-end-card'
					? 'overlays-social-endcard'
					: definition.slug.replaceAll('/', '-');
			const localPosterUrl = `/elements/${assetSlug}-preview.png`;
			const localVideoUrl = `/elements/${assetSlug}-preview.mp4`;
			const publicPosterUrlPattern = new RegExp(
				`^https://remotion\\.media/elements/${assetSlug}-preview(?:-([a-f0-9-]+))?\\.png$`,
			);
			const publicVideoUrlPattern = new RegExp(
				`^https://remotion\\.media/elements/${assetSlug}-preview(?:-([a-f0-9-]+))?\\.mp4$`,
			);
			const posterPath = path.join(
				staticElementsRoot,
				`${assetSlug}-preview.png`,
			);
			const videoPath = path.join(
				staticElementsRoot,
				`${assetSlug}-preview.mp4`,
			);
			const usesReviewUrls = definition.preview.posterUrl === localPosterUrl;

			if (usesReviewUrls) {
				expect(String(definition.preview.videoUrl)).toBe(localVideoUrl);

				const isRegistered = definition.slug in elementRegistry;
				expect(existsSync(posterPath)).toBe(isRegistered);
				expect(existsSync(videoPath)).toBe(isRegistered);
				if (isRegistered) {
					const poster = readFileSync(posterPath);
					const video = readFileSync(videoPath);
					expect(Array.from(poster.subarray(0, 8))).toEqual([
						0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
					]);
					expect(video.subarray(4, 8).toString('ascii')).toBe('ftyp');
					expect(
						statSync(posterPath).size + statSync(videoPath).size,
					).toBeLessThanOrEqual(10 * 1024 * 1024);
				}
			} else {
				const publicPosterUrlMatch = String(definition.preview.posterUrl).match(
					publicPosterUrlPattern,
				);
				const publicVideoUrlMatch = String(definition.preview.videoUrl).match(
					publicVideoUrlPattern,
				);
				expect(publicPosterUrlMatch).not.toBeNull();
				expect(publicVideoUrlMatch).not.toBeNull();
				expect(publicPosterUrlMatch?.[1]).toBe(publicVideoUrlMatch?.[1]);
				expect(existsSync(posterPath)).toBe(false);
				expect(existsSync(videoPath)).toBe(false);
			}
		}
	});
});
