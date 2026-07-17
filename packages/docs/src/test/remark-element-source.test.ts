import {describe, expect, test} from 'bun:test';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import path from 'path';
import {getRemotionElementDependencies} from '../../plugins/element-source-utils';
import remarkElementSource from '../../plugins/remark-element-source';

const elementsRoot = path.join(__dirname, '..', '..', 'elements');

type Element = {
	mdxPath: string;
	tsxPath: string;
};

const findFirstElement = (root: string): Element | null => {
	let found: Element | null = null;

	const walk = (dir: string) => {
		if (found) {
			return;
		}

		const indexMdx = path.join(dir, 'index.mdx');
		if (existsSync(indexMdx)) {
			const tsxFiles = readdirSync(dir).filter(
				(f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'),
			);
			if (tsxFiles.length > 0) {
				found = {
					mdxPath: indexMdx,
					tsxPath: path.join(dir, tsxFiles[0]),
				};
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
	return found;
};

const getRelativeTsxPath = (tsxPath: string, mdxPath: string) => {
	const relative = path.relative(path.dirname(mdxPath), tsxPath);
	return relative.startsWith('.') ? relative : `./${relative}`;
};

describe('remark-element-source Webpack dependency', () => {
	test('sourceCode uses the Element source file loader for hot reload', () => {
		const element = findFirstElement(elementsRoot);
		expect(element).not.toBeNull();
		if (!element) {
			return;
		}

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
			children: [] as Array<Record<string, unknown>>,
		};
		const tree = {type: 'root', children: [elementPage]};

		remarkElementSource()(tree, {path: element.mdxPath});

		const sourceCode = elementPage.attributes.find(
			(attribute) => attribute.name === 'sourceCode',
		);
		expect(sourceCode?.value.value).toMatch(/^require\(/);
		expect(sourceCode?.value.value).toContain('element-source-file-loader.cjs');
		expect(sourceCode?.value.value).toContain(sourceFile.replaceAll('\\', '/'));

		const dependencies = elementPage.attributes.find(
			(attribute) => attribute.name === 'dependencies',
		);
		expect(dependencies?.value.value).toBe(
			JSON.stringify(
				getRemotionElementDependencies(readFileSync(element.tsxPath, 'utf8')),
			),
		);

		expect(elementPage.children[0]).toMatchObject({
			type: 'code',
			lang: 'tsx',
			value: readFileSync(element.tsxPath, 'utf8').trimEnd(),
		});
	});
});
