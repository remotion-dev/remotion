import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import path from 'path';

const examplesRoot = path.join(__dirname, '..', '..', 'examples');
const templateRoot = path.join(__dirname, '..', '..', 'examples-template');

// Exports every example source file must define so that the colocated MDX page
// can import them and pass them to <Player>.
const requiredExports = [
	'durationInFrames',
	'fps',
	'width',
	'height',
	'RemotionRoot',
];

type Example = {
	name: string;
	mdxPath: string;
	tsxPath: string;
};

const findExamples = (root: string): Example[] => {
	const examples: Example[] = [];

	const walk = (dir: string) => {
		const indexMdx = path.join(dir, 'index.mdx');
		if (existsSync(indexMdx)) {
			const tsxFiles = readdirSync(dir).filter(
				(f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'),
			);
			if (tsxFiles.length > 0) {
				examples.push({
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
	return examples;
};

// Extracts the first ```tsx fenced code block from an MDX file.
const extractTsxBlock = (mdx: string): string | null => {
	const match = mdx.match(/```tsx[^\n]*\n([\s\S]*?)\n```/);
	return match ? match[1] : null;
};

const allExamples = [
	...findExamples(examplesRoot),
	...findExamples(templateRoot),
];

describe('Examples must follow the colocated single-file format', () => {
	test('at least one example exists', () => {
		expect(allExamples.length).toBeGreaterThan(0);
	});

	for (const example of allExamples) {
		describe(example.name, () => {
			const tsx = readFileSync(example.tsxPath, 'utf8');
			const mdx = readFileSync(example.mdxPath, 'utf8');

			test('source file defines the required exports', () => {
				for (const exp of requiredExports) {
					expect(tsx).toContain(`export const ${exp}`);
				}

				expect(tsx).toContain('<Composition');
			});

			test('MDX uses the ExamplePage template', () => {
				expect(mdx).toContain('ExamplePage');
			});

			test('MDX imports the colocated source module', () => {
				expect(mdx).toMatch(/from '\.\/[\w-]+';/);
			});

			test('displayed code block matches the source file', () => {
				const block = extractTsxBlock(mdx);
				expect(block).not.toBeNull();
				// The fenced code block is the single source of truth shown to both
				// humans and agents; it must be identical to the runnable .tsx file.
				expect(block?.trim()).toBe(tsx.trim());
			});
		});
	}
});
