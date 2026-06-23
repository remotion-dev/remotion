import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import path from 'path';

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

// Extracts the first ```tsx fenced code block from an MDX file.
const extractTsxBlock = (mdx: string): string | null => {
	const match = mdx.match(/```tsx[^\n]*\n([\s\S]*?)\n```/);
	return match ? match[1] : null;
};

const extractLowerThirdSource = (mdx: string): string | null => {
	const match = mdx.match(/export const lowerThirdSource = ("[\s\S]*?");\n/);
	return match ? (JSON.parse(match[1]) as string) : null;
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

			test('displayed code block matches the source file', () => {
				const block = extractTsxBlock(mdx);
				expect(block).not.toBeNull();
				// The fenced code block must be identical to the runnable .tsx file.
				expect(block?.trim()).toBe(tsx.trim());
			});

			test('drag payload source matches the source file if present', () => {
				const source = extractLowerThirdSource(mdx);
				if (source === null) {
					return;
				}

				expect(source.trim()).toBe(tsx.trim());
				expect(mdx).toContain('sourceCode={lowerThirdSource}');
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
