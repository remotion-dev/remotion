import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import path from 'path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
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
import {
	elementCategories,
	elementRegistry,
} from '../components/Elements/element-registry';
import {
	getElementCompositionId,
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
const elementDefinitionList = Object.values(elementDefinitions);
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

const getRelativeTsxPath = (tsxPath: string, mdxPath: string) => {
	const relative = path.relative(path.dirname(mdxPath), tsxPath);
	return relative.startsWith('.') ? relative : `./${relative}`;
};

const productionElements = findElements(elementsRoot);
const allElements = [...productionElements, ...findElements(templateRoot)];

describe('Elements must follow the colocated single-file format', () => {
	test('at least one element exists', () => {
		expect(allElements.length).toBeGreaterThan(0);
	});

	test('remark plugin nests source inside ElementPage', () => {
		const element = allElements[0];
		const sourceFile = getRelativeTsxPath(element.tsxPath, element.mdxPath);
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

			test('source file is an Element, not a composition', () => {
				expect(tsx).not.toContain('export const durationInFrames');
				expect(tsx).not.toContain('export const fps');
				expect(tsx).not.toContain('export const width');
				expect(tsx).not.toContain('export const height');
				expect(tsx).not.toContain('export const RemotionRoot');
				expect(tsx).not.toMatch(/<Composition(?:\s|\/?>)/);
			});

			test('MDX uses the ElementPage template', () => {
				expect(mdx).toContain('ElementPage');
			});

			test('MDX references the source file from ElementPage', () => {
				const relativeTsxPath = getRelativeTsxPath(
					element.tsxPath,
					element.mdxPath,
				);

				expect(mdx).toContain(`sourceFile="${relativeTsxPath}"`);
				expect(mdx).not.toContain('<ElementSource');
				expect(mdx).not.toContain('<RemotionElementSource');
				expect(mdx).not.toContain('remotion-element-source');
				expect(mdx).not.toContain(tsx.trim());
			});

			test('ElementPage sourceFile expands to the source file', () => {
				const expanded = expandElementSourceReferences({
					raw: mdx,
					sourceFilePath: element.mdxPath,
				});

				expect(expanded).toContain(
					`\`\`\`tsx twoslash title="${path.basename(element.tsxPath)}"\n${tsx.trim()}\n\`\`\``,
				);
			});

			test('MDX does not duplicate source metadata for drag payloads', () => {
				expect(mdx).not.toContain('?raw');
				expect(mdx).not.toContain('sourceCode=');
				expect(mdx).not.toContain('componentName=');
				expect(mdx).not.toMatch(/export const \w+Source = /);
			});

			test('Element drag file name is derived from the definition slug', () => {
				expect(mdx).not.toContain('fileName=');

				if (element.mdxPath.startsWith(templateRoot)) {
					return;
				}

				const definition = elementDefinitionList.find(
					(entry) => entry.slug === element.name,
				);
				expect(definition).toBeDefined();

				const lastSlugSegment = definition?.slug.split('/').at(-1);
				expect(lastSlugSegment).toBeTruthy();
				expect(lastSlugSegment).toBe(lastSlugSegment?.toLowerCase());
				expect(lastSlugSegment).not.toContain('..');
			});
		});
	}
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

	test('renders draggable cards and filters the real category entry points', () => {
		const sourceCodeBySlug = getRemotionElementSourceMap({elementsRoot});
		const overviewMarkup = renderToStaticMarkup(
			React.createElement(ElementLibrary, {
				category: null,
				sourceCodeBySlug,
			}),
		);
		const sections = getElementLibrarySections(null);

		for (const definition of elementDefinitionList) {
			expect(
				overviewMarkup.split(`>${definition.displayName}</h3>`),
			).toHaveLength(2);
			expect(overviewMarkup).toContain(definition.description);
			expect(overviewMarkup).toContain(definition.preview.posterUrl);
			expect(overviewMarkup).toContain(getElementDocumentationUrl(definition));
		}

		expect(overviewMarkup).not.toContain('.mp4');
		expect(overviewMarkup).toContain('>YouTube</h2>');
		expect(overviewMarkup.match(/draggable="true"/g)).toHaveLength(
			elementDefinitionList.length,
		);
		expect(overviewMarkup).toContain(
			'title="Click to view details, or drag this Element into Remotion Studio"',
		);

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
			const definition = elementDefinitions[slug];
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
	test('lists every registered Element exactly once in deterministic order', () => {
		const sidebar = elementSidebars.elementsSidebar;
		if (!Array.isArray(sidebar)) {
			throw new Error('Elements sidebar must be an array');
		}

		expect(sidebar.slice(0, 3)).toEqual([
			'index',
			'contributing',
			{
				type: 'html',
				value:
					'<hr style="margin-top: 4px; margin-bottom: 4px; border-bottom: none"/>',
				defaultStyle: true,
			},
		]);

		const categories = sidebar.slice(3);
		const expectedCategories = [
			{
				category: 'backgrounds',
				label: 'Backgrounds',
				items: [
					'backgrounds/liquid-contours/index',
					'backgrounds/notebook-paper/index',
					'backgrounds/paper-texture/index',
					'backgrounds/rotating-starburst/index',
				],
			},
			{
				category: 'captions',
				label: 'Captions',
				items: [
					'captions/moving-pill-captions/index',
					'captions/popping-word-captions/index',
					'captions/word-highlight-captions/index',
				],
			},
			{
				category: 'commerce',
				label: 'Commerce',
				items: [
					'commerce/product-discount-callout/index',
					'commerce/product-offer/index',
				],
			},
			{
				category: 'data',
				label: 'Data',
				items: [
					'data/horizontal-bar-chart/index',
					'data/line-chart/index',
					'data/number-counter/index',
					'data/pie-chart/index',
					'data/vertical-bar-chart/index',
				],
			},
			{
				category: 'maps',
				label: 'Maps',
				items: ['maps/map-flyover/index'],
			},
			{
				category: 'overlays',
				label: 'Overlays',
				items: [
					'overlays/location-lower-third/index',
					'overlays/name-lower-third/index',
				],
			},
			{
				category: 'storytelling',
				label: 'Storytelling',
				items: ['text/news-article-highlight/index'],
			},
			{
				category: 'text',
				label: 'Text',
				items: [
					'text/circle-marker/index',
					'text/crossed-off/index',
					'text/spinning-text-wheel/index',
					'text/strike-through/index',
					'text/text-marker/index',
				],
			},
			{
				category: 'youtube',
				label: 'YouTube',
				items: ['youtube/youtube-end-card/index'],
			},
		] as const;

		expect(categories).toEqual(
			expectedCategories.map(({category, label, items}) => ({
				type: 'category',
				label,
				link: {type: 'doc', id: `${category}/index`},
				collapsed: false,
				items,
			})),
		);
		expect(elementCategories).toEqual(
			expectedCategories.map(({category, label}) => ({category, label})),
		);

		const listedElementPages = expectedCategories.flatMap(({items}) => items);
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
	test('contains every production Element exactly once', () => {
		const elementSlugs = productionElements
			.map((element) => element.name)
			.sort();
		const definitionSlugs = elementDefinitionList
			.map((definition) => definition.slug)
			.sort();
		const definitionKeys = Object.keys(elementDefinitions).sort();

		expect(definitionKeys).toEqual(elementSlugs);
		expect(definitionSlugs).toEqual(elementSlugs);
		expect(new Set(definitionSlugs).size).toBe(definitionSlugs.length);

		for (const [slug, definition] of Object.entries(elementDefinitions)) {
			expect(definition.slug).toBe(slug);
		}
	});

	test('publishes caption treatments as separate Elements', () => {
		const captionSlugs = elementDefinitionList
			.map((definition) => definition.slug)
			.filter((slug) => slug.startsWith('captions/'))
			.sort();

		expect(captionSlugs).toEqual([
			'captions/moving-pill-captions',
			'captions/popping-word-captions',
			'captions/word-highlight-captions',
		]);

		for (const slug of captionSlugs) {
			const element = productionElements.find((entry) => entry.name === slug);
			if (!element) {
				throw new Error(`Missing caption Element for ${slug}`);
			}

			const source = readFileSync(element.tsxPath, 'utf8');
			expect(source).not.toContain('readonly mode');
			expect(source).not.toContain('TimedCaptionsMode');
			expect(source).not.toContain("translate: '109.5px -36px'");
		}
	});

	test('only Elements with one interactive timeline item own their Sequence', () => {
		const componentOwnedSequenceSlugs = new Set([
			'captions/moving-pill-captions',
			'captions/popping-word-captions',
			'captions/word-highlight-captions',
			'maps/map-flyover',
			'text/spinning-text-wheel',
		]);

		for (const definition of elementDefinitionList) {
			expect(definition.installationMode).toBe(
				componentOwnedSequenceSlugs.has(definition.slug)
					? 'component-owned-sequence'
					: 'wrapped',
			);
		}
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
		const adaptiveDefinition = elementDefinitions['backgrounds/paper-texture'];
		expect(getElementDimensionsLabel(adaptiveDefinition)).toBe(
			'Adapts to composition',
		);
		expect(getElementPreviewDimensions(adaptiveDefinition)).toEqual({
			height: 1080,
			width: 1920,
		});

		const fixedDefinition = elementDefinitions['overlays/name-lower-third'];
		expect(getElementDimensionsLabel(fixedDefinition)).toBe('534 × 132px');
		expect(getElementPreviewDimensions(fixedDefinition)).toEqual({
			height: 732,
			width: 1134,
		});
	});

	test('dimensionless Solid backgrounds use composition dimensions', () => {
		for (const slug of [
			'backgrounds/paper-texture',
			'backgrounds/rotating-starburst',
		] as const) {
			const definition = elementDefinitions[slug];
			const element = productionElements.find((entry) => entry.name === slug);
			if (!element) {
				throw new Error(`Could not find Element source for ${slug}`);
			}

			const source = readFileSync(element.tsxPath, 'utf8');
			expect(definition.elementWidth).toBe(null);
			expect(definition.elementHeight).toBe(null);
			expect(source).toContain('useVideoConfig()');
			expect(source).not.toContain(`width={${definition.width}}`);
			expect(source).not.toContain(`height={${definition.height}}`);
		}
	});

	test('uses stable composition IDs and flat review or published preview paths', () => {
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
			const publicPosterUrl = `https://remotion.media${localPosterUrl}`;
			const publicVideoUrl = `https://remotion.media${localVideoUrl}`;
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
				expect(String(definition.preview.posterUrl)).toBe(publicPosterUrl);
				expect(String(definition.preview.videoUrl)).toBe(publicVideoUrl);
				expect(existsSync(posterPath)).toBe(false);
				expect(existsSync(videoPath)).toBe(false);
			}
		}
	});

	test('the Element template includes explicit defaults and local preview URLs', () => {
		const template = readFileSync(path.join(templateRoot, 'index.mdx'), 'utf8');
		expect(template).toContain("installationMode: 'wrapped'");
		expect(template).toContain(
			'image: /elements/category-element-title-preview.png',
		);
		expect(template).toContain(
			"posterUrl: '/elements/category-element-title-preview.png'",
		);
		expect(template).toContain(
			"videoUrl: '/elements/category-element-title-preview.mp4'",
		);
	});

	test('registers Element compositions in a Folder', () => {
		const root = readFileSync(
			path.join(__dirname, '..', 'remotion', 'Root.tsx'),
			'utf8',
		);
		expect(root).toContain('<Folder name="elements">');
	});
});
