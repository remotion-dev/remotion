import {
	stringifyDefaultProps,
	type VisualControlChange,
} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import {
	getCodemodResult,
	type CodemodProject,
	type CodemodResult,
} from './codemod-project';
import {formatSerializedValue} from './format-serialized-value';
import {findProjectFile} from './internals';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {applySourceEdits, type SourceEdit} from './source-edits';

const expectString = (
	node: ExpressionKind | recast.types.namedTypes.SpreadElement | undefined,
) => {
	if (!node) {
		throw new Error('Expected a string literal');
	}

	if (node.type === 'StringLiteral') {
		return node.value;
	}

	if (node.type === 'TemplateLiteral') {
		if (node.expressions.length > 0) {
			throw new Error(
				'visualControl() must use a static identifier, the string may not be dynamic.',
			);
		}

		return node.quasis[0].value.raw;
	}

	throw new Error('Expected a string literal');
};

export type UpdateVisualControlsOptions<Project extends CodemodProject> = {
	project: Project;
	filePath: string;
	changes: VisualControlChange[];
};

export type UpdateVisualControlsResult = CodemodResult & {
	updatedControls: {id: string; line: number}[];
};

export const updateVisualControls = <Project extends CodemodProject>({
	project,
	filePath,
	changes,
}: UpdateVisualControlsOptions<Project>): UpdateVisualControlsResult => {
	const resolvedFilePath = findProjectFile({project, filePath});
	const input = project.files[resolvedFilePath];
	const file = parseAst(input);
	const updatedControls: {id: string; line: number}[] = [];
	const edits: SourceEdit[] = [];

	recast.types.visit(file.program, {
		visitCallExpression(path) {
			const {node} = path;

			if (node.type !== 'CallExpression') {
				throw new Error('Expected a call expression');
			}

			if (node.callee.type !== 'Identifier') {
				return this.traverse(path);
			}

			if (node.callee.name !== 'visualControl') {
				return this.traverse(path);
			}

			const firstArgument = node.arguments[0];
			const str = expectString(firstArgument);
			const matchingChanges = changes.filter(
				(candidate) => candidate.id === str,
			);
			const change = matchingChanges.at(-1);
			if (!change) {
				return this.traverse(path);
			}

			const serialized = change.newValueIsUndefined
				? 'undefined'
				: stringifyDefaultProps({
						props: JSON.parse(change.newValueSerialized),
						enumPaths: change.enumPaths,
					});
			if (serialized === undefined) {
				throw new Error('Could not serialize the visual control value');
			}

			const secondArgument = node.arguments[1];
			if (secondArgument) {
				if (!secondArgument.loc) {
					throw new Error('Could not locate the visual control value');
				}

				const start = recastLocToOffset(input, secondArgument.loc.start);
				const end = recastLocToOffset(input, secondArgument.loc.end);
				const lineStart = input.lastIndexOf('\n', start - 1) + 1;
				edits.push({
					start,
					end,
					replacement: formatSerializedValue({
						input,
						linePrefix: input.slice(lineStart, start),
						previousValue: input.slice(start, end).trim(),
						serialized,
					}),
				});
			} else {
				if (!firstArgument.loc) {
					throw new Error('Could not locate the visual control identifier');
				}

				const offset = recastLocToOffset(input, firstArgument.loc.end);
				const lineStart = input.lastIndexOf('\n', offset - 1) + 1;
				edits.push({
					start: offset,
					end: offset,
					replacement: `, ${formatSerializedValue({
						input,
						linePrefix: `${input.slice(lineStart, offset)}, `,
						previousValue: null,
						serialized,
					})}`,
				});
			}

			for (const matchingChange of matchingChanges) {
				updatedControls.push({
					id: matchingChange.id,
					line: node.loc?.start.line ?? 1,
				});
			}

			return false;
		},
	});

	return {
		...getCodemodResult({
			project,
			edits: [
				{
					filePath: resolvedFilePath,
					nextContents: applySourceEdits({input, edits}),
				},
			],
		}),
		updatedControls,
	};
};
