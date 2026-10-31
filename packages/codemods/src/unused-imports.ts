import type {Node} from '@babel/types';
import * as recast from 'recast';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	getImportBracketSpacing,
	renderImportDeclaration,
	type SourceEdit,
} from './source-edits';

// Every identifier that a node references outside of imports, including JSX
// tag names
export const collectReferencedNames = (node: Node) => {
	const names = new Set<string>();
	recast.types.visit(node, {
		visitImportDeclaration() {
			return false;
		},
		visitIdentifier(path) {
			const isJsxAttributeName =
				path.parent?.node.type === 'JSXAttribute' && path.name === 'name';
			if (!isJsxAttributeName) {
				names.add(path.node.name);
			}

			this.traverse(path);
		},
	});
	return names;
};

/**
 * Removes the imports of `localNames` that are not referenced anymore,
 * e.g. the import of a component whose only usage was replaced.
 */
export const removeUnusedImports = ({
	input,
	localNames,
}: {
	input: string;
	localNames: Set<string>;
}) => {
	const ast = parseAst(input);
	const referenced = collectReferencedNames(ast);

	const edits: SourceEdit[] = [];
	for (const statement of ast.program.body) {
		if (statement.type !== 'ImportDeclaration' || !statement.loc) {
			continue;
		}

		const specifiers = statement.specifiers ?? [];
		const kept = specifiers.filter(
			(specifier) =>
				!localNames.has(specifier.local.name) ||
				referenced.has(specifier.local.name),
		);
		if (kept.length === specifiers.length) {
			continue;
		}

		const start = recastLocToOffset(input, statement.loc.start);
		const end = recastLocToOffset(input, statement.loc.end);
		if (kept.length === 0) {
			const lineBreak = input.slice(end).match(/^\r?\n/)?.[0] ?? '';
			edits.push({start, end: end + lineBreak.length, replacement: ''});
			continue;
		}

		const original = input.slice(start, end);
		edits.push({
			start,
			end,
			replacement: renderImportDeclaration({
				bracketSpacing: getImportBracketSpacing({
					declaration: statement,
					input,
					prettierConfigOverride: null,
				}),
				declaration: {...statement, specifiers: kept},
				quote: original.includes('"') ? '"' : "'",
				semicolon: original.trimEnd().endsWith(';') ? ';' : '',
			}),
		});
	}

	return applySourceEdits({input, edits});
};
