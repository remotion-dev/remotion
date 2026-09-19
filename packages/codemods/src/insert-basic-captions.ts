import type {JSXElement, JSXFragment} from '@babel/types';
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
	getJsxElementSourceForInsertion,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	indentContinuationLines,
} from './source-style';

export const insertBasicCaptions = ({
	input,
	nodePath,
	captions,
	durationInFrames,
	importPath = './basic-captions.element',
	prettierConfigOverride = null,
}: {
	input: string;
	nodePath: SequenceNodePath;
	captions: {
		text: string;
		startMs: number;
		endMs: number;
		timestampMs: number | null;
		confidence: number | null;
		pageBreakAfter?: boolean;
	}[];
	durationInFrames: number | null;
	importPath?: string;
	prettierConfigOverride?: Record<string, unknown> | null;
}): {
	output: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
} => {
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const mediaPath = findJsxElementPathForDeletion(ast, nodePath);
	if (!mediaPath) {
		throw new Error('Could not find the selected audio or video element');
	}

	const media = mediaPath.node as JSXElement;
	if (media.openingElement.name.type !== 'JSXIdentifier') {
		throw new Error('The selected media tag cannot be transcribed');
	}

	const tagName = media.openingElement.name.name;
	const importedMedia = ast.program.body.some(
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
						'Audio',
						'OffthreadVideo',
						'experimental_Video',
						'experimental_Audio',
					].includes(getImportedName(specifier)),
			),
	);
	if (!importedMedia) {
		throw new Error('The selected element is not a Remotion Video or Audio');
	}

	let localName = 'BasicCaptions';
	let suffix = 1;
	while (new RegExp(`\\b${localName}\\b`).test(input)) {
		localName = `BasicCaptions${suffix++}`;
	}

	const captionsLocalName = ensureNamedImport({
		ast,
		importedName: 'BasicCaptions',
		localName,
		sourcePath: importPath,
	});
	const copiedAttributes = media.openingElement.attributes
		.filter(
			(attribute) =>
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				['from', 'durationInFrames', 'trimBefore', 'playbackRate'].includes(
					attribute.name.name,
				),
		)
		.map((attribute) => recast.print(attribute).code);
	if (
		Number.isFinite(durationInFrames) &&
		durationInFrames !== null &&
		!copiedAttributes.some((attribute) =>
			attribute.startsWith('durationInFrames'),
		)
	) {
		copiedAttributes.push(`durationInFrames={${durationInFrames}}`);
	}

	const elementSource = `<${captionsLocalName} captions={${JSON.stringify(captions, null, 2)}} ${copiedAttributes.join(' ')} />`;
	const parsedElement = parseAst(`const element = (${elementSource});`).program
		.body[0];
	if (
		parsedElement?.type !== 'VariableDeclaration' ||
		parsedElement.declarations[0]?.init?.type !== 'JSXElement'
	) {
		throw new Error('Could not generate the Basic captions element');
	}

	const inserted = parsedElement.declarations[0].init;
	const parent = mediaPath.parentPath?.node;
	if (!parent) {
		throw new Error('Could not locate the media element parent');
	}

	let sourceEdit;
	if (
		(parent.type === 'JSXElement' || parent.type === 'JSXFragment') &&
		parent.children.includes(media)
	) {
		const index = parent.children.indexOf(media);
		parent.children.splice(index + 1, 0, inserted);
		sourceEdit = getAdjacentJsxInsertionSourceEdit({
			input,
			insertion: elementSource,
			position: 'after',
			target: media,
		});
	} else {
		const fragment: JSXFragment = {
			type: 'JSXFragment',
			openingFragment: {type: 'JSXOpeningFragment'},
			closingFragment: {type: 'JSXClosingFragment'},
			children: [media, inserted],
		};
		mediaPath.replace(fragment);
		if (!media.loc) {
			throw new Error('Could not locate the media element in source');
		}

		const start = recastLocToOffset(input, media.loc.start);
		const end = recastLocToOffset(input, media.loc.end);
		const indent = getLineIndent({input, offset: start});
		const unit = getIndentationUnit(input, prettierConfigOverride);
		const eol = getEndOfLine(input);
		sourceEdit = {
			start,
			end,
			replacement: indentContinuationLines({
				indent,
				input,
				printed: [
					'<>',
					indentInsertedJsx({
						indent: unit,
						insertion: getJsxElementSourceForInsertion({element: media, input}),
					}),
					indentInsertedJsx({indent: unit, insertion: elementSource}),
					'</>',
				].join(eol),
			}),
		};
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
			sourceEdit,
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast,
		captured,
		output,
	});
	return {
		output,
		logLine: media.openingElement.loc?.start.line ?? 1,
		nodePathRemappings,
	};
};
