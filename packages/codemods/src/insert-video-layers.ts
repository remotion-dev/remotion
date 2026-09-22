import type {
	JSXAttribute,
	JSXElement,
	JSXExpressionContainer,
	JSXFragment,
} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {indentInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getAdjacentJsxInsertionSourceEdit,
	getInsertImportSourceEdits,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	getPreferredQuote,
	indentContinuationLines,
} from './source-style';

const b = recast.types.builders;

const makeStaticFileSource = ({
	input,
	localName,
	prettierConfigOverride,
	src,
}: {
	input: string;
	localName: string;
	prettierConfigOverride: Record<string, unknown> | null;
	src: string;
}) => {
	const stringLiteral = recast.prettyPrint(b.stringLiteral(src), {
		quote: getPreferredQuote(input, prettierConfigOverride),
	}).code;
	return `{${localName}(${stringLiteral})}`;
};

const replaceSrcInElementSource = ({
	element,
	input,
	srcAttribute,
	srcSource,
}: {
	element: JSXElement;
	input: string;
	srcAttribute: JSXAttribute;
	srcSource: string;
}) => {
	if (!element.loc || !srcAttribute.value?.loc) {
		throw new Error('Could not locate the selected video source');
	}

	const elementStart = recastLocToOffset(input, element.loc.start);
	const elementEnd = recastLocToOffset(input, element.loc.end);
	const valueStart = recastLocToOffset(input, srcAttribute.value.loc.start);
	const valueEnd = recastLocToOffset(input, srcAttribute.value.loc.end);
	const originalIndent = getLineIndent({input, offset: elementStart});
	const elementSource =
		input.slice(elementStart, valueStart) +
		srcSource +
		input.slice(valueEnd, elementEnd);

	return elementSource
		.split(/\r?\n/)
		.map((line, index) => {
			if (index === 0) {
				return line;
			}

			return line.startsWith(originalIndent)
				? line.slice(originalIndent.length)
				: line.trimStart();
		})
		.join(getEndOfLine(input));
};

const parseVideoElement = (source: string): JSXElement => {
	const statement = parseAst(`const element = (${source});`).program.body[0];
	if (
		statement?.type !== 'VariableDeclaration' ||
		statement.declarations[0]?.init?.type !== 'JSXElement'
	) {
		throw new Error('Could not generate the separated video layer');
	}

	return statement.declarations[0].init;
};

export const insertVideoLayers = ({
	input,
	nodePath,
	baseSrc,
	foregroundSrc,
	prettierConfigOverride = null,
}: {
	input: string;
	nodePath: SequenceNodePath;
	baseSrc: string;
	foregroundSrc: string;
	prettierConfigOverride?: Record<string, unknown> | null;
}): {
	output: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
} => {
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const videoPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!videoPath) {
		throw new Error('Could not find the selected video element');
	}

	const video = videoPath.node as JSXElement;
	if (video.openingElement.name.type !== 'JSXIdentifier') {
		throw new Error('The selected video tag cannot be separated');
	}

	const tagName = video.openingElement.name.name;
	const importedVideo = ast.program.body.some(
		(statement) =>
			statement.type === 'ImportDeclaration' &&
			statement.importKind !== 'type' &&
			(statement.source.value === 'remotion' ||
				statement.source.value === '@remotion/media') &&
			statement.specifiers.some(
				(specifier) =>
					specifier.type === 'ImportSpecifier' &&
					specifier.local.name === tagName &&
					[
						'Video',
						'Html5Video',
						'OffthreadVideo',
						'experimental_Video',
					].includes(getImportedName(specifier)),
			),
	);
	if (!importedVideo) {
		throw new Error('The selected element is not a Remotion Video');
	}

	const srcAttribute = video.openingElement.attributes.find(
		(attribute): attribute is JSXAttribute =>
			attribute.type === 'JSXAttribute' &&
			attribute.name.type === 'JSXIdentifier' &&
			attribute.name.name === 'src',
	);
	if (!srcAttribute?.value) {
		throw new Error(`<${tagName}> has no src attribute`);
	}

	if (!srcAttribute.value.loc) {
		throw new Error('Could not locate the selected video source');
	}

	const srcValueStart = recastLocToOffset(input, srcAttribute.value.loc.start);
	const srcValueEnd = recastLocToOffset(input, srcAttribute.value.loc.end);

	let staticFileLocalName = 'staticFile';
	let suffix = 1;
	while (new RegExp(`\\b${staticFileLocalName}\\b`).test(input)) {
		staticFileLocalName = `remotionStaticFile${suffix++}`;
	}

	staticFileLocalName = ensureNamedImport({
		ast,
		importedName: 'staticFile',
		localName: staticFileLocalName,
		sourcePath: 'remotion',
	});
	const baseSrcSource = makeStaticFileSource({
		input,
		localName: staticFileLocalName,
		prettierConfigOverride,
		src: baseSrc,
	});
	const foregroundSrcSource = makeStaticFileSource({
		input,
		localName: staticFileLocalName,
		prettierConfigOverride,
		src: foregroundSrc,
	});
	const baseVideoSource = replaceSrcInElementSource({
		element: video,
		input,
		srcAttribute,
		srcSource: baseSrcSource,
	});
	const foregroundVideoSource = replaceSrcInElementSource({
		element: video,
		input,
		srcAttribute,
		srcSource: foregroundSrcSource,
	});
	const foregroundVideo = parseVideoElement(foregroundVideoSource);

	srcAttribute.value = b.jsxExpressionContainer(
		b.callExpression(b.identifier(staticFileLocalName), [
			b.stringLiteral(baseSrc),
		]),
	) as unknown as JSXExpressionContainer;

	const parent = videoPath.parentPath?.node;
	if (!parent) {
		throw new Error('Could not locate the video element parent');
	}

	let sourceEdit;
	if (
		(parent.type === 'JSXElement' || parent.type === 'JSXFragment') &&
		parent.children.includes(video)
	) {
		const index = parent.children.indexOf(video);
		parent.children.splice(index + 1, 0, foregroundVideo);
		sourceEdit = [
			{
				start: srcValueStart,
				end: srcValueEnd,
				replacement: baseSrcSource,
			},
			getAdjacentJsxInsertionSourceEdit({
				input,
				insertion: foregroundVideoSource,
				position: 'after',
				target: video,
			}),
		];
	} else {
		const fragment: JSXFragment = {
			type: 'JSXFragment',
			openingFragment: {type: 'JSXOpeningFragment'},
			closingFragment: {type: 'JSXClosingFragment'},
			children: [video, foregroundVideo],
		};
		videoPath.replace(fragment);
		if (!video.loc) {
			throw new Error('Could not locate the video element in source');
		}

		const start = recastLocToOffset(input, video.loc.start);
		const end = recastLocToOffset(input, video.loc.end);
		const indent = getLineIndent({input, offset: start});
		const unit = getIndentationUnit(input, prettierConfigOverride);
		const eol = getEndOfLine(input);
		sourceEdit = [
			{
				start,
				end,
				replacement: indentContinuationLines({
					indent,
					input,
					printed: [
						'<>',
						indentInsertedJsx({indent: unit, insertion: baseVideoSource}),
						indentInsertedJsx({
							indent: unit,
							insertion: foregroundVideoSource,
						}),
						'</>',
					].join(eol),
				}),
			},
		];
	}

	const output = applySourceEdits({
		input,
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride,
				snapshots: importSnapshots,
			}),
			...sourceEdit,
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured,
		output,
	});

	return {
		output,
		logLine: video.openingElement.loc?.start.line ?? 1,
		nodePathRemappings,
	};
};
