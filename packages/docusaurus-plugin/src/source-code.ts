import fs from 'fs';
import path from 'path';
import {visit} from 'unist-util-visit';

type UnistTree = {
	type: string;
	children?: UnistTree[];
	[key: string]: unknown;
};

type CodeNode = {
	type: 'code';
	value: string;
};

type Options = {
	root?: string;
};

const sourcePrefix = 'source:';

export const remarkSourceCode = (options: Options = {}) => {
	return (tree: UnistTree, file: {path?: string}) => {
		const root = path.resolve(options.root ?? process.cwd());
		const fileDir = file.path ? path.dirname(file.path) : root;

		visit(tree, 'code', (node: CodeNode) => {
			const value = node.value.trim();

			if (!value.startsWith(sourcePrefix)) {
				return;
			}

			const sourcePath = value.slice(sourcePrefix.length).trim();
			const resolved = path.resolve(
				sourcePath.startsWith('.') ? fileDir : root,
				sourcePath,
			);

			if (!resolved.startsWith(root + path.sep)) {
				throw new Error(`Cannot read source code outside of ${root}: ${sourcePath}`);
			}

			node.value = fs.readFileSync(resolved, 'utf8').trimEnd();
		});
	};
};
