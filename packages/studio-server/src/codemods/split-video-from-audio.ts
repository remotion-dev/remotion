import type {File, JSXAttribute, JSXElement} from '@babel/types';
import {cloneNode} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {ensureNamedImport} from '../helpers/imports';
import {
	findJsxElementPathForDeletion,
	getJsxElementTagLabel,
} from './delete-jsx-node';
import {insertJsxSiblingAfterPath} from './duplicate-jsx-node';
import {formatFileContent} from './format-file-content';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {parseAst, serializeAst} from './parse-ast';

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

export const splitVideoFromAudio = async ({
	input,
	nodePath,
	prettierConfigOverride,
}: {
	input: string;
	nodePath: SequenceNodePath;
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

	const audioElement = cloneNode(jsxElement, true) as JSXElement;
	audioElement.openingElement.attributes =
		audioElement.openingElement.attributes.filter((attribute) => {
			const name = getAttributeName(attribute);
			return name !== null && audioProps.includes(name);
		});
	audioElement.openingElement.selfClosing = true;
	audioElement.closingElement = null;
	audioElement.children = [];

	const audioLocalName = ensureNamedImport({
		ast,
		importedName: 'Audio',
		sourcePath: importSource,
		localName: 'Audio',
	});
	audioElement.openingElement.name = {
		type: 'JSXIdentifier',
		name: audioLocalName,
	};

	setBareMutedAttribute(jsxElement);
	insertJsxSiblingAfterPath(jsxPath, audioElement);

	const finalFile = serializeAst(ast);
	const {output, formatted} = await formatFileContent({
		input: finalFile,
		prettierConfigOverride,
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
