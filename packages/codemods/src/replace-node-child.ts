import type {JSXElement} from '@babel/types';
import {buildJsxElement} from './build-jsx-element';
import type {CodemodElement} from './codemod-element';
import type {CodemodProject} from './codemod-project';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getNodeEditResult, type NodeReference} from './node-references';
import {printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getImportBracketSpacing,
	getInsertImportSourceEdits,
	renderImportDeclaration,
} from './source-edits';
import {indentContinuationLines, getLineIndent} from './source-style';
import {collectReferencedNames, removeUnusedImports} from './unused-imports';

export type ReplaceNodeChildOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	element: CodemodElement;
};

/**
 * Replaces the only JSX child of a node, e.g. `<Sequence><Scene /></Sequence>`,
 * with a new element. Used to swap a scene for its pre-rendered video.
 */
export const replaceNodeChild = <Project extends CodemodProject>({
	project,
	node,
	element,
}: ReplaceNodeChildOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const parent = findJsxElementPathForDeletion(ast, node.nodePath)?.node as
		| JSXElement
		| undefined;
	if (!parent) {
		throw new Error('Could not find a JSX element at the target node path');
	}

	const meaningfulChildren = parent.children.filter(
		(c) => c.type !== 'JSXText' || c.value.trim() !== '',
	);
	const child = meaningfulChildren[0];
	if (
		meaningfulChildren.length !== 1 ||
		child.type !== 'JSXElement' ||
		!child.loc
	) {
		throw new Error('The target element must have exactly one JSX child');
	}

	// Remembered so that the replacement can be undone without the undo stack
	const childNames = collectReferencedNames(child);
	let rootName = child.openingElement.name;
	while (rootName.type === 'JSXMemberExpression') {
		rootName = rootName.object;
	}

	let sceneImportSource: string | null = null;
	const replacedImports: string[] = [];
	for (const statement of ast.program.body) {
		if (statement.type !== 'ImportDeclaration' || !statement.loc) {
			continue;
		}

		const usedSpecifiers = (statement.specifiers ?? []).filter((specifier) =>
			childNames.has(specifier.local.name),
		);
		if (usedSpecifiers.length === 0) {
			continue;
		}

		if (
			rootName.type === 'JSXIdentifier' &&
			usedSpecifiers.some((specifier) => specifier.local.name === rootName.name)
		) {
			sceneImportSource = statement.source.value;
		}

		const original = input.slice(
			recastLocToOffset(input, statement.loc.start),
			recastLocToOffset(input, statement.loc.end),
		);
		replacedImports.push(
			renderImportDeclaration({
				bracketSpacing: getImportBracketSpacing({
					declaration: statement,
					input,
					prettierConfigOverride: null,
				}),
				declaration: {...statement, specifiers: usedSpecifiers},
				quote: original.includes('"') ? '"' : "'",
				semicolon: original.trimEnd().endsWith(';') ? ';' : '',
			}),
		);
	}

	const childStart = recastLocToOffset(input, child.loc.start);
	// Without the indentation of the call site, so that it can be restored at
	// a different depth
	const childIndent = getLineIndent({input, offset: childStart});
	const replacedSource = input
		.slice(childStart, recastLocToOffset(input, child.loc.end))
		.split('\n')
		.map((line, i) =>
			i > 0 && line.startsWith(childIndent)
				? line.slice(childIndent.length)
				: line,
		)
		.join('\n');

	const jsx = buildJsxElement({ast, element});
	parent.children[parent.children.indexOf(child)] = jsx as never;

	const output = removeUnusedImports({
		input: applySourceEdits({
			input,
			edits: [
				...getInsertImportSourceEdits({
					ast,
					input,
					prettierConfigOverride: null,
					snapshots: importSnapshots,
				}),
				{
					start: childStart,
					end: recastLocToOffset(input, child.loc.end),
					replacement: indentContinuationLines({
						indent: childIndent,
						input,
						printed: printInsertedJsx({
							compactLiteralProps: true,
							element: jsx,
							input,
							prettierConfigOverride: null,
						}),
					}),
				},
			],
		}),
		localNames: childNames,
	});
	const {nodePathRemappings} = getNodePathRemappings({ast, captured, output});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		logLine: child.loc.start.line,
		replacedSource,
		replacedImports,
		sceneImportSource,
	};
};
