import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import path from 'path';
import {expandElementSourceReferences} from '../../plugins/element-source-utils';
import remarkElementSource from '../../plugins/remark-element-source';
import {elementDefinitions} from '../components/Elements/element-definitions';
import {
	getElementCompositionId,
	getElementPreviewUrls,
} from '../components/Elements/element-utils';
import {getElementPreviewDimensions} from '../components/Elements/ElementPreviewComposition';

const elementsRoot = path.join(__dirname, '..', '..', 'elements');
const templateRoot = path.join(__dirname, '..', '..', 'elements-template');
const elementDefinitionList = Object.values(elementDefinitions);

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

		remarkElementSource()(tree, {path: element.mdxPath});

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
	});

	for (const element of allElements) {
		describe(element.name, () => {
			const tsx = readFileSync(element.tsxPath, 'utf8');
			const mdx = readFileSync(element.mdxPath, 'utf8');

			test('source file is an Element, not a composition or wrapper Sequence', () => {
				expect(tsx).not.toContain('export const durationInFrames');
				expect(tsx).not.toContain('export const fps');
				expect(tsx).not.toContain('export const width');
				expect(tsx).not.toContain('export const height');
				expect(tsx).not.toContain('export const RemotionRoot');
				expect(tsx).not.toContain('<Composition');
				expect(tsx).not.toContain('<Sequence');
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

	test('derives stable composition IDs and preview URLs', () => {
		const compositionIds = elementDefinitionList.map((definition) =>
			getElementCompositionId(definition.slug),
		);
		expect(new Set(compositionIds).size).toBe(compositionIds.length);

		for (const definition of elementDefinitionList) {
			expect(getElementPreviewUrls(definition.slug)).toEqual({
				mp4: `https://remotion.media/elements/${definition.slug}/preview.mp4`,
				png: `https://remotion.media/elements/${definition.slug}/preview.png`,
			});
		}
	});

	test('registers Element compositions in a Folder', () => {
		const root = readFileSync(
			path.join(__dirname, '..', 'remotion', 'Root.tsx'),
			'utf8',
		);
		expect(root).toContain('<Folder name="elements">');
	});
});
