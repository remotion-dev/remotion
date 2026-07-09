import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import path from 'path';
import {expandElementSourceReferences} from '../../plugins/element-source-utils';

const elementsRoot = path.join(__dirname, '..', '..', 'elements');
const templateRoot = path.join(__dirname, '..', '..', 'elements-template');

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
				elements.push({
					name: path.relative(root, dir) || path.basename(dir),
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

const allElements = [
	...findElements(elementsRoot),
	...findElements(templateRoot),
];

describe('Elements must follow the colocated single-file format', () => {
	test('at least one element exists', () => {
		expect(allElements.length).toBeGreaterThan(0);
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

			test('MDX imports the colocated source module', () => {
				expect(mdx).toMatch(/from '\.\/[\w-]+';/);
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

			test('Element drag file name is derived from the slug', () => {
				expect(mdx).not.toContain('fileName=');

				const match = mdx.match(/slug="([^"]+)"/);
				if (!match) {
					return;
				}

				const lastSlugSegment = match[1].split('/').at(-1);
				expect(lastSlugSegment).toBeTruthy();
				expect(lastSlugSegment).toBe(lastSlugSegment?.toLowerCase());
				expect(lastSlugSegment).not.toContain('..');
			});
		});
	}
});
