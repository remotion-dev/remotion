import type {JSXElement} from '@babel/types';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	requireComposition,
	validateMetadata,
} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits, type SourceEdit} from './source-edits';
import {getEndOfLine, getIndentationUnit, getLineIndent} from './source-style';

export type UpdateCompositionMetadataOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		metadata: Partial<CompositionMetadata>;
	};

export const updateCompositionMetadata = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	metadata,
}: UpdateCompositionMetadataOptions<Project>): CodemodResult => {
	const node = requireComposition({project, compositionFile, compositionId});
	validateMetadata(metadata);
	if (
		node.tagName === 'Still' &&
		(metadata.fps !== undefined || metadata.durationInFrames !== undefined)
	) {
		throw new Error('Still registrations do not have fps or durationInFrames');
	}

	if (Object.values(metadata).every((value) => value === undefined)) {
		return {changes: []};
	}

	const input = project.files[node.filePath];
	const ast = parseAst(input);
	const element = findJsxElementPathForDeletion(ast, node.nodePath)?.node as
		| JSXElement
		| undefined;
	if (!element) {
		throw new Error('Could not locate the composition metadata');
	}

	const edits: SourceEdit[] = [];
	const updates = (['fps', 'durationInFrames', 'width', 'height'] as const).map(
		(name) => ({name, value: metadata[name] ?? null}),
	);
	const existingMetadata = new Set<string>();

	for (const metadataAttribute of element.openingElement.attributes) {
		if (
			metadataAttribute.type !== 'JSXAttribute' ||
			metadataAttribute.name.type !== 'JSXIdentifier'
		) {
			continue;
		}

		const update = updates.find(
			(item) => item.name === metadataAttribute.name.name,
		);
		if (!update || update.value === null) {
			continue;
		}

		existingMetadata.add(update.name);
		if (metadataAttribute.value?.loc) {
			edits.push({
				start: recastLocToOffset(input, metadataAttribute.value.loc.start),
				end: recastLocToOffset(input, metadataAttribute.value.loc.end),
				replacement: `{${update.value}}`,
			});
		} else if (metadataAttribute.loc) {
			const start = recastLocToOffset(input, metadataAttribute.loc.start);
			const end = recastLocToOffset(input, metadataAttribute.loc.end);
			edits.push({
				start,
				end,
				replacement: `${input.slice(start, end)}={${update.value}}`,
			});
		} else {
			throw new Error(`Could not locate the "${update.name}" attribute`);
		}
	}

	const missingMetadata = updates.filter(
		(item) => item.value !== null && !existingMetadata.has(item.name),
	);
	if (missingMetadata.length > 0) {
		const {openingElement} = element;
		if (!openingElement.loc || !openingElement.name.loc) {
			throw new Error('Could not locate the composition opening element');
		}

		const openingEnd = recastLocToOffset(input, openingElement.loc.end);
		const closingStart = openingEnd - (openingElement.selfClosing ? 2 : 1);
		const lastAttribute = openingElement.attributes.findLast(
			(candidate) => candidate.loc,
		);
		const anchor = lastAttribute?.loc?.end ?? openingElement.name.loc.end;
		const anchorOffset = recastLocToOffset(input, anchor);
		const rendered = missingMetadata.map(
			(item) => `${item.name}={${item.value}}`,
		);

		if (input.slice(anchorOffset, closingStart).includes('\n')) {
			const closingLineStart = input.lastIndexOf('\n', closingStart - 1) + 1;
			const attributeIndent =
				lastAttribute?.loc &&
				lastAttribute.loc.start.line > openingElement.name.loc.end.line
					? getLineIndent({
							input,
							offset: recastLocToOffset(input, lastAttribute.loc.start),
						})
					: getLineIndent({
							input,
							offset: recastLocToOffset(input, openingElement.loc.start),
						}) + getIndentationUnit(input, null);
			const endOfLine = getEndOfLine(input);
			edits.push({
				start: closingLineStart,
				end: closingLineStart,
				replacement:
					rendered
						.map(
							(renderedAttribute) => `${attributeIndent}${renderedAttribute}`,
						)
						.join(endOfLine) + endOfLine,
			});
		} else {
			edits.push({
				start: anchorOffset,
				end: anchorOffset,
				replacement: ` ${rendered.join(' ')}`,
			});
		}
	}

	const output = applySourceEdits({input, edits});
	parseAst(output);
	return getCodemodResult({
		project,
		edits: [{filePath: node.filePath, nextContents: output}],
	});
};
