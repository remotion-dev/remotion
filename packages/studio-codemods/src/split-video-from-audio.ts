import type {
	ArrowFunctionExpression,
	Expression,
	File,
	JSXAttribute,
	JSXElement,
	JSXFragment,
	Node,
	ReturnStatement,
} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';

const {namedTypes} = recast.types;

// Props that are valid on <Audio> and should carry over so the extracted
// audio keeps the same timing as the video it was split from.
const audioProps = [
	'src',
	'from',
	'durationInFrames',
	'trimBefore',
	'trimAfter',
	'playbackRate',
	'volume',
	'loop',
];

/*
 * Deep-clones an AST subtree while sharing `loc` objects by reference, like
 * Babel's `cloneNode`. A runtime import of `@babel/types` is avoided because
 * it reads `process.env` at module load, which breaks browser bundles.
 */
const cloneAstValue = <T>(value: T): T => {
	if (Array.isArray(value)) {
		return value.map((item) => cloneAstValue(item)) as T;
	}

	if (value !== null && typeof value === 'object') {
		const clone: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			clone[key] = key === 'loc' ? item : cloneAstValue(item);
		}

		return clone as T;
	}

	return value;
};

const getAttributeName = (
	attribute: JSXElement['openingElement']['attributes'][number],
): string | null => {
	if (
		attribute.type !== 'JSXAttribute' ||
		attribute.name.type !== 'JSXIdentifier'
	) {
		return null;
	}

	return attribute.name.name;
};

const findImportSourceOfLocalName = (
	ast: File,
	localName: string,
): string | null => {
	for (const stmt of ast.program.body) {
		if (
			stmt.type !== 'ImportDeclaration' ||
			stmt.source.type !== 'StringLiteral' ||
			stmt.importKind === 'type'
		) {
			continue;
		}

		for (const specifier of stmt.specifiers ?? []) {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.local?.name === localName
			) {
				return stmt.source.value;
			}
		}
	}

	return null;
};

const importsLocalNameFromOtherSource = ({
	ast,
	localName,
	sourcePath,
}: {
	ast: File;
	localName: string;
	sourcePath: string;
}): string | null => {
	for (const stmt of ast.program.body) {
		if (
			stmt.type !== 'ImportDeclaration' ||
			stmt.source.type !== 'StringLiteral' ||
			stmt.source.value === sourcePath
		) {
			continue;
		}

		for (const specifier of stmt.specifiers ?? []) {
			if (specifier.local?.name === localName) {
				return stmt.source.value;
			}
		}
	}

	return null;
};

const setBareMutedAttribute = (element: JSXElement) => {
	const {
		openingElement: {attributes},
	} = element;
	const muted: JSXAttribute = {
		type: 'JSXAttribute',
		name: {type: 'JSXIdentifier', name: 'muted'},
		value: null,
	};
	const index = attributes.findIndex(
		(attribute) => getAttributeName(attribute) === 'muted',
	);

	if (index === -1) {
		attributes.push(muted);
	} else {
		attributes[index] = muted;
	}
};

const makeFragment = (first: JSXElement, second: JSXElement): JSXFragment => ({
	type: 'JSXFragment',
	openingFragment: {type: 'JSXOpeningFragment'},
	closingFragment: {type: 'JSXClosingFragment'},
	children: [first, second],
});

const insertAfter = (
	parentNode: Node,
	node: JSXElement,
	sibling: JSXElement,
): boolean => {
	if (
		namedTypes.JSXElement.check(parentNode) ||
		namedTypes.JSXFragment.check(parentNode)
	) {
		const idx = parentNode.children.indexOf(node);
		if (idx !== -1) {
			parentNode.children.splice(idx + 1, 0, sibling);
			return true;
		}
	}

	if (namedTypes.ReturnStatement.check(parentNode)) {
		const parent = parentNode as ReturnStatement;
		if (parent.argument === node) {
			parent.argument = makeFragment(node, sibling) as unknown as Expression;
			return true;
		}
	}

	if (namedTypes.ArrowFunctionExpression.check(parentNode)) {
		const parent = parentNode as ArrowFunctionExpression;
		if (parent.body === node) {
			parent.body = makeFragment(
				node,
				sibling,
			) as ArrowFunctionExpression['body'];
			return true;
		}
	}

	return false;
};

export const splitVideoFromAudio = async ({
	input,
	nodePath,
	formatFile,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
	formatFile: (input: {
		contents: string;
		prettierConfigOverride: Record<string, unknown> | null;
	}) => Promise<{output: string; formatted: boolean}>;
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{
	output: string;
	formatted: boolean;
	nodeLabel: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
}> => {
	const ast = parseAst(input);
	const capturedNodePaths = captureJsxNodePaths(ast);
	const jsxPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!jsxPath) {
		throw new Error(
			'Could not find a JSX element at the specified location to split audio from',
		);
	}

	const jsxElement = jsxPath.node as JSXElement;
	const nodeLabel = getJsxElementTagLabel(jsxElement);

	if (jsxElement.openingElement.name.type !== 'JSXIdentifier') {
		throw new Error(`Cannot split audio from <${nodeLabel}>`);
	}

	const tagName = jsxElement.openingElement.name.name;
	const importSource = findImportSourceOfLocalName(ast, tagName);
	if (!importSource) {
		throw new Error(`Could not find the import of <${tagName}>`);
	}

	const hasSrc = jsxElement.openingElement.attributes.some(
		(attribute) => getAttributeName(attribute) === 'src',
	);
	if (!hasSrc) {
		throw new Error(`<${tagName}> has no src attribute`);
	}

	const conflictingSource = importsLocalNameFromOtherSource({
		ast,
		localName: 'Audio',
		sourcePath: importSource,
	});
	if (conflictingSource) {
		throw new Error(
			`Audio is already imported from "${conflictingSource}", expected "${importSource}"`,
		);
	}

	const audioLocalName = ensureNamedImport({
		ast,
		importedName: 'Audio',
		sourcePath: importSource,
		localName: 'Audio',
	});
	const audioElement: JSXElement = {
		type: 'JSXElement',
		openingElement: {
			type: 'JSXOpeningElement',
			name: {type: 'JSXIdentifier', name: audioLocalName},
			attributes: jsxElement.openingElement.attributes
				.filter((attribute) => {
					const name = getAttributeName(attribute);
					return name !== null && audioProps.includes(name);
				})
				.map((attribute) => cloneAstValue(attribute)),
			selfClosing: true,
		},
		closingElement: null,
		children: [],
	};

	setBareMutedAttribute(jsxElement);

	const {parentPath} = jsxPath;
	if (!parentPath) {
		throw new Error('Cannot split audio from a JSX element with no parent');
	}

	if (!insertAfter(parentPath.node, jsxElement, audioElement)) {
		jsxPath.replace(makeFragment(jsxElement, audioElement));
	}

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFile({
		contents: finalFile,
		prettierConfigOverride: prettierConfigOverride ?? null,
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured: capturedNodePaths,
		output,
	});

	return {
		output,
		formatted,
		nodeLabel,
		logLine:
			jsxElement.openingElement.loc?.start.line ??
			jsxElement.loc?.start.line ??
			1,
		nodePathRemappings,
	};
};
