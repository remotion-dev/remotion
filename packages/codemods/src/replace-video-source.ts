import type {JSXAttribute, JSXElement} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {recastLocToOffset} from './recast-loc-to-offset';
import {ensureNamedImport, getImportedName} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';
import {getPreferredQuote} from './source-style';

export const replaceVideoSource = ({
	input,
	nodePath,
	src,
	prettierConfigOverride = null,
}: {
	input: string;
	nodePath: SequenceNodePath;
	src: string;
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
		throw new Error('The selected video tag cannot be updated');
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
	if (!srcAttribute?.value?.loc) {
		throw new Error(`<${tagName}> has no src attribute`);
	}

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
	const stringLiteral = recast.prettyPrint(
		recast.types.builders.stringLiteral(src),
		{
			quote: getPreferredQuote(input, prettierConfigOverride),
		},
	).code;
	const output = applySourceEdits({
		input,
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride,
				snapshots: importSnapshots,
			}),
			{
				start: recastLocToOffset(input, srcAttribute.value.loc.start),
				end: recastLocToOffset(input, srcAttribute.value.loc.end),
				replacement: `{${staticFileLocalName}(${stringLiteral})}`,
			},
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({ast, captured, output});
	return {
		output,
		logLine: video.openingElement.loc?.start.line ?? 1,
		nodePathRemappings,
	};
};
