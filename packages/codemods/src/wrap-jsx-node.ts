import type {JSXElement, Node} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getNodeEditResult, type JsxNodeReference} from './node-references';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';

type JsxWrapper = 'AbsoluteFill' | 'Sequence' | 'HtmlInCanvas';

export const canWrapJsxNode = ({
	input,
	nodePath,
}: {
	input: string;
	nodePath: SequenceNodePath;
}): {canWrap: boolean; canWrapHtmlInCanvas: boolean} => {
	const ast = parseAst(input);
	const path = findJsxElementPathForDeletion(ast, nodePath);
	if (!path || !(path.node as JSXElement).loc) {
		return {canWrap: false, canWrapHtmlInCanvas: false};
	}

	const htmlInCanvasNames = new Set(['HtmlInCanvas']);
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.source.value !== 'remotion'
		) {
			continue;
		}

		for (const specifier of statement.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				getImportedName(specifier) === 'HtmlInCanvas'
			) {
				htmlInCanvasNames.add(specifier.local?.name ?? 'HtmlInCanvas');
			}
		}
	}

	const isHtmlInCanvasElement = (element: JSXElement) => {
		const {name} = element.openingElement;
		return (
			(name.type === 'JSXIdentifier' && htmlInCanvasNames.has(name.name)) ||
			(name.type === 'JSXMemberExpression' &&
				name.property.name === 'HtmlInCanvas')
		);
	};

	let current = path;
	while (current) {
		const node = current.node as Node;
		if (node.type === 'JSXElement' && isHtmlInCanvasElement(node)) {
			return {canWrap: true, canWrapHtmlInCanvas: false};
		}

		current = current.parentPath;
	}

	let containsHtmlInCanvas = false;
	recast.types.visit(path.node as Parameters<typeof recast.types.visit>[0], {
		visitJSXElement(elementPath) {
			if (isHtmlInCanvasElement(elementPath.node as JSXElement)) {
				containsHtmlInCanvas = true;
			}

			this.traverse(elementPath);
		},
	});

	return {canWrap: true, canWrapHtmlInCanvas: !containsHtmlInCanvas};
};

export const wrapJsxNode = <Project extends CodemodProject>({
	project,
	node,
	wrapper,
	width,
	height,
}: {
	project: Project;
	node: JsxNodeReference;
	wrapper: JsxWrapper;
	width: number;
	height: number;
}) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const eligibility = canWrapJsxNode({input, nodePath: node.nodePath});
	if (
		!eligibility.canWrap ||
		(wrapper === 'HtmlInCanvas' && !eligibility.canWrapHtmlInCanvas)
	) {
		throw new Error('This JSX element cannot be wrapped');
	}

	if (
		wrapper === 'HtmlInCanvas' &&
		(!Number.isInteger(width) ||
			width <= 0 ||
			!Number.isInteger(height) ||
			height <= 0)
	) {
		throw new Error('HtmlInCanvas requires positive integer dimensions');
	}

	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const path = findJsxElementPathForDeletion(ast, node.nodePath);
	if (!path) {
		throw new Error('Could not find the JSX element to wrap');
	}

	const original = path.node as JSXElement;
	const logLine = original.openingElement.loc?.start.line ?? 1;
	const occupiedNames = new Set<string>();
	recast.types.visit(ast, {
		visitIdentifier(identifierPath) {
			occupiedNames.add(identifierPath.node.name);
			this.traverse(identifierPath);
		},
		visitJSXIdentifier(identifierPath) {
			occupiedNames.add(identifierPath.node.name);
			this.traverse(identifierPath);
		},
	});
	let suggestedName: string = wrapper;
	for (let suffix = 1; occupiedNames.has(suggestedName); suffix++) {
		suggestedName = `${wrapper}FromRemotion${suffix}`;
	}

	const localName = ensureNamedImport({
		ast,
		importedName: wrapper,
		localName: suggestedName,
		sourcePath: 'remotion',
	});
	const b = recast.types.builders;
	const name = b.jsxIdentifier(localName);
	const attributes =
		wrapper === 'HtmlInCanvas'
			? [
					b.jsxAttribute(
						b.jsxIdentifier('width'),
						b.jsxExpressionContainer(b.numericLiteral(width)),
					),
					b.jsxAttribute(
						b.jsxIdentifier('height'),
						b.jsxExpressionContainer(b.numericLiteral(height)),
					),
				]
			: [];
	path.replace(
		b.jsxElement(
			b.jsxOpeningElement(name, attributes, false),
			b.jsxClosingElement(b.jsxIdentifier(localName)),
			[stripParenthesizedExtra(original) as never],
		) as never,
	);

	const output = serializeAst(ast);
	const {nodePathRemappings} = getNodePathRemappings({ast, captured, output});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		logLine,
	};
};
