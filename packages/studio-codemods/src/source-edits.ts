import type {
	File,
	ImportDeclaration,
	JSXAttribute,
	JSXElement,
	Node,
} from '@babel/types';
import * as recast from 'recast';
import {indentInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {getImportedName} from './sequence-props/imports';
import {getEndOfLine, getLineIndent, getPreferredQuote} from './source-style';

export type SourceEdit = {
	end: number;
	replacement: string;
	start: number;
};

export type ImportSnapshot = {
	declaration: ImportDeclaration;
	specifiers: NonNullable<ImportDeclaration['specifiers']>;
};

export const getJsxStringAttributeValueSourceEdit = ({
	attribute,
	input,
	newValue,
}: {
	attribute: JSXAttribute;
	input: string;
	newValue: string;
}): SourceEdit => {
	const {value} = attribute;
	const literal =
		value?.type === 'JSXExpressionContainer' ? value.expression : value;
	if (!literal?.loc || literal.type !== 'StringLiteral') {
		throw new Error(`Could not locate the "${attribute.name.name}" attribute`);
	}

	const start = recastLocToOffset(input, literal.loc.start);
	const end = recastLocToOffset(input, literal.loc.end);
	const quote = input[start] === "'" ? "'" : '"';
	const replacement =
		value?.type === 'StringLiteral'
			? quote +
				newValue
					.replaceAll('&', '&amp;')
					.replaceAll('"', '&quot;')
					.replaceAll("'", '&apos;')
					.replaceAll('<', '&lt;') +
				quote
			: recast.prettyPrint(recast.types.builders.stringLiteral(newValue), {
					quote: quote === "'" ? 'single' : 'double',
				}).code;

	return {start, end, replacement};
};

export const getJsxElementSourceForInsertion = ({
	element,
	input,
}: {
	element: JSXElement;
	input: string;
}): string => {
	if (!element.loc) {
		throw new Error('Could not locate the JSX element to move');
	}

	const start = recastLocToOffset(input, element.loc.start);
	const end = recastLocToOffset(input, element.loc.end);
	const originalIndent = getLineIndent({input, offset: start});

	return input
		.slice(start, end)
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

export const getAdjacentJsxInsertionSourceEdit = ({
	input,
	insertion,
	position,
	target,
}: {
	input: string;
	insertion: string;
	position: 'after' | 'before';
	target: JSXElement;
}): SourceEdit => {
	if (!target.loc) {
		throw new Error('Could not locate the JSX reorder target');
	}

	const targetStart = recastLocToOffset(input, target.loc.start);
	const targetEnd = recastLocToOffset(input, target.loc.end);
	const indent = getLineIndent({input, offset: targetStart});
	const endOfLine = getEndOfLine(input);

	if (position === 'after') {
		return {
			start: targetEnd,
			end: targetEnd,
			replacement: `${endOfLine}${indentInsertedJsx({indent, insertion})}`,
		};
	}

	const continuation = insertion
		.split(/\r?\n/)
		.map((line, index) => (index === 0 ? line : `${indent}${line}`))
		.join(endOfLine);
	return {
		start: targetStart,
		end: targetStart,
		replacement: `${continuation}${endOfLine}${indent}`,
	};
};

export const getNodeEndIncludingSameLineComments = ({
	input,
	node,
}: {
	input: string;
	node: Node;
}): number | null => {
	if (!node.loc) {
		return null;
	}

	const nodeEnd = recastLocToOffset(input, node.loc.end);
	return (node.trailingComments ?? []).reduce((end, comment) => {
		if (
			!comment.loc ||
			comment.loc.start.line !== node.loc?.end.line ||
			recastLocToOffset(input, comment.loc.start) < nodeEnd
		) {
			return end;
		}

		return Math.max(end, recastLocToOffset(input, comment.loc.end));
	}, nodeEnd);
};

const getLeadingFileHeaderEnd = ({
	ast,
	input,
	minimumOffset,
}: {
	ast: File;
	input: string;
	minimumOffset: number;
}): number | null => {
	const firstOriginalStatement = ast.program.body
		.flatMap((statement) =>
			statement.loc
				? [
						{
							statement,
							start: recastLocToOffset(input, statement.loc.start),
						},
					]
				: [],
		)
		.sort((left, right) => left.start - right.start)[0]?.statement;
	const leadingComments = firstOriginalStatement?.leadingComments ?? [];
	const lastHeaderCommentIndex = leadingComments.findLastIndex((comment) =>
		/(?:@ts-(?:no)?check\b|@flow\b|@jsx\b|@license\b|@generated\b|copyright\b|eslint-disable(?!-(?:next-)?line\b)\b|\/\s*<(?:reference|amd-module|amd-dependency)\b)/i.test(
			comment.value,
		),
	);
	if (lastHeaderCommentIndex === -1) {
		return null;
	}

	return leadingComments
		.slice(0, lastHeaderCommentIndex + 1)
		.reduce<number | null>((latestEnd, comment) => {
			if (!comment.loc) {
				return latestEnd;
			}

			const commentStart = recastLocToOffset(input, comment.loc.start);
			if (commentStart < minimumOffset) {
				return latestEnd;
			}

			return Math.max(
				latestEnd ?? minimumOffset,
				recastLocToOffset(input, comment.loc.end),
			);
		}, null);
};

export const captureImportSnapshots = (ast: File): ImportSnapshot[] =>
	ast.program.body.flatMap((statement) =>
		statement.type === 'ImportDeclaration'
			? [
					{
						declaration: statement,
						specifiers: [...(statement.specifiers ?? [])],
					},
				]
			: [],
	);

const renderImportSpecifier = (
	specifier: NonNullable<ImportDeclaration['specifiers']>[number],
) => {
	if (specifier.type === 'ImportDefaultSpecifier') {
		return specifier.local.name;
	}

	if (specifier.type === 'ImportNamespaceSpecifier') {
		return `* as ${specifier.local.name}`;
	}

	const importedName = getImportedName(specifier);
	const localName = specifier.local?.name ?? importedName;
	const rendered =
		importedName === localName
			? importedName
			: `${importedName} as ${localName}`;
	return specifier.importKind === 'type' ? `type ${rendered}` : rendered;
};

const renderImportDeclaration = ({
	bracketSpacing,
	declaration,
	quote,
	semicolon,
}: {
	bracketSpacing: boolean;
	declaration: ImportDeclaration;
	quote: '"' | "'";
	semicolon: string;
}) => {
	const specifiers = declaration.specifiers ?? [];
	const defaultSpecifier = specifiers.find(
		(specifier) => specifier.type === 'ImportDefaultSpecifier',
	);
	const namespaceSpecifier = specifiers.find(
		(specifier) => specifier.type === 'ImportNamespaceSpecifier',
	);
	const namedSpecifiers = specifiers.filter(
		(specifier) => specifier.type === 'ImportSpecifier',
	);
	const parts = [
		...(defaultSpecifier ? [renderImportSpecifier(defaultSpecifier)] : []),
		...(namespaceSpecifier ? [renderImportSpecifier(namespaceSpecifier)] : []),
		...(namedSpecifiers.length
			? [
					`{${bracketSpacing ? ' ' : ''}${namedSpecifiers
						.map(renderImportSpecifier)
						.join(', ')}${bracketSpacing ? ' ' : ''}}`,
				]
			: []),
	];
	const source =
		quote === '"'
			? JSON.stringify(declaration.source.value)
			: `'${declaration.source.value.replaceAll("'", "\\'")}'`;
	return `import ${parts.join(', ')} from ${source}${semicolon}`;
};

const getImportBracketSpacing = ({
	declaration,
	input,
	prettierConfigOverride,
}: {
	declaration: ImportDeclaration | null;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
}) => {
	if (declaration?.loc) {
		const source = input.slice(
			recastLocToOffset(input, declaration.loc.start),
			recastLocToOffset(input, declaration.loc.end),
		);
		const openingBrace = source.indexOf('{');
		const closingBrace = source.lastIndexOf('}');
		if (openingBrace !== -1 && closingBrace > openingBrace) {
			return (
				/\s/.test(source[openingBrace + 1]) &&
				/\s/.test(source[closingBrace - 1])
			);
		}
	}

	return prettierConfigOverride?.bracketSpacing !== false;
};

export const getInsertImportSourceEdits = ({
	ast,
	input,
	prettierConfigOverride,
	snapshots,
}: {
	ast: File;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
	snapshots: ImportSnapshot[];
}): SourceEdit[] => {
	const edits: SourceEdit[] = [];
	const snapshotByDeclaration = new Map(
		snapshots.map((snapshot) => [snapshot.declaration, snapshot]),
	);
	const importWithNamedSpecifiers =
		snapshots.find((snapshot) =>
			snapshot.specifiers.some(
				(specifier) => specifier.type === 'ImportSpecifier',
			),
		)?.declaration ?? null;
	const fallbackBracketSpacing = getImportBracketSpacing({
		declaration: importWithNamedSpecifiers,
		input,
		prettierConfigOverride,
	});
	const newDeclarations: ImportDeclaration[] = [];

	for (const statement of ast.program.body) {
		if (statement.type !== 'ImportDeclaration') {
			continue;
		}

		const snapshot = snapshotByDeclaration.get(statement);
		if (!snapshot) {
			newDeclarations.push(statement);
			continue;
		}

		const addedSpecifiers = (statement.specifiers ?? []).filter(
			(specifier) => !snapshot.specifiers.includes(specifier),
		);
		if (addedSpecifiers.length === 0) {
			continue;
		}

		if (
			addedSpecifiers.every(
				(specifier) => specifier.type === 'ImportDefaultSpecifier',
			) &&
			statement.loc
		) {
			const importStart = recastLocToOffset(input, statement.loc.start);
			const importPrefix = input.slice(importStart).match(/^import\s+/)?.[0];
			if (!importPrefix) {
				throw new Error('Could not locate the import prefix to update');
			}

			const offset = importStart + importPrefix.length;
			edits.push({
				end: offset,
				replacement: `${addedSpecifiers.map(renderImportSpecifier).join(', ')}, `,
				start: offset,
			});
			continue;
		}

		if (
			addedSpecifiers.some((specifier) => specifier.type !== 'ImportSpecifier')
		) {
			if (!statement.loc) {
				throw new Error('Could not locate the import to update');
			}

			const fullImportStart = recastLocToOffset(input, statement.loc.start);
			const fullImportEnd = recastLocToOffset(input, statement.loc.end);
			const fullImport = input.slice(fullImportStart, fullImportEnd);
			edits.push({
				end: fullImportEnd,
				replacement: renderImportDeclaration({
					bracketSpacing: getImportBracketSpacing({
						declaration: statement,
						input,
						prettierConfigOverride,
					}),
					declaration: statement,
					quote: fullImport.includes('"') ? '"' : "'",
					semicolon: fullImport.trimEnd().endsWith(';') ? ';' : '',
				}),
				start: fullImportStart,
			});
			continue;
		}

		const rendered = addedSpecifiers.map(renderImportSpecifier).join(', ');
		const lastNamedSpecifier = snapshot.specifiers.findLast(
			(specifier) => specifier.type === 'ImportSpecifier',
		);
		if (lastNamedSpecifier?.loc) {
			const offset = recastLocToOffset(input, lastNamedSpecifier.loc.end);
			edits.push({
				end: offset,
				replacement: `, ${rendered}`,
				start: offset,
			});
			continue;
		}

		const defaultSpecifier = snapshot.specifiers.find(
			(specifier) => specifier.type === 'ImportDefaultSpecifier',
		);
		if (defaultSpecifier?.loc) {
			const offset = recastLocToOffset(input, defaultSpecifier.loc.end);
			edits.push({
				end: offset,
				replacement: `, {${fallbackBracketSpacing ? ' ' : ''}${rendered}${fallbackBracketSpacing ? ' ' : ''}}`,
				start: offset,
			});
			continue;
		}

		if (!statement.loc) {
			throw new Error('Could not locate the import to update');
		}

		const start = recastLocToOffset(input, statement.loc.start);
		const end = recastLocToOffset(input, statement.loc.end);
		const original = input.slice(start, end);
		edits.push({
			end,
			replacement: renderImportDeclaration({
				bracketSpacing: fallbackBracketSpacing,
				declaration: statement,
				quote: original.includes('"') ? '"' : "'",
				semicolon: original.trimEnd().endsWith(';') ? ';' : '',
			}),
			start,
		});
	}

	if (newDeclarations.length > 0) {
		const endOfLine = getEndOfLine(input);
		const firstImport = snapshots[0]?.declaration;
		const firstImportSource = firstImport?.source.loc
			? input.slice(
					recastLocToOffset(input, firstImport.source.loc.start),
					recastLocToOffset(input, firstImport.source.loc.end),
				)
			: null;
		const quote = firstImportSource?.startsWith('"')
			? ('"' as const)
			: firstImportSource?.startsWith("'") ||
				  getPreferredQuote(input, prettierConfigOverride) === 'single'
				? ("'" as const)
				: ('"' as const);
		const semicolon = firstImport?.loc
			? input
					.slice(
						recastLocToOffset(input, firstImport.loc.start),
						recastLocToOffset(input, firstImport.loc.end),
					)
					.trimEnd()
					.endsWith(';')
				? ';'
				: ''
			: (() => {
					const styleNode =
						ast.program.directives.at(-1) ?? ast.program.body.at(-1);
					if (!styleNode?.loc) {
						return ';';
					}

					return input
						.slice(
							recastLocToOffset(input, styleNode.loc.start),
							recastLocToOffset(input, styleNode.loc.end),
						)
						.trimEnd()
						.endsWith(';')
						? ';'
						: '';
				})();
		const rendered = newDeclarations
			.map((declaration) =>
				renderImportDeclaration({
					bracketSpacing: fallbackBracketSpacing,
					declaration,
					quote,
					semicolon,
				}),
			)
			.join(endOfLine);
		if (firstImport?.loc) {
			const offset = recastLocToOffset(input, firstImport.loc.start);
			edits.push({
				end: offset,
				replacement: `${rendered}${endOfLine}`,
				start: offset,
			});
		} else {
			const lastDirective = ast.program.directives.at(-1);
			const insertionAnchor = lastDirective ?? ast.program.interpreter;
			const byteOrderMarkOffset = input.startsWith('\uFEFF') ? 1 : 0;
			const anchorEnd = insertionAnchor
				? getNodeEndIncludingSameLineComments({
						input,
						node: insertionAnchor,
					})
				: null;
			const minimumOffset = anchorEnd ?? byteOrderMarkOffset;
			const fileHeaderEnd = getLeadingFileHeaderEnd({
				ast,
				input,
				minimumOffset,
			});
			const offset = fileHeaderEnd ?? anchorEnd ?? byteOrderMarkOffset;
			if (fileHeaderEnd !== null || anchorEnd !== null) {
				const suffix = input.slice(offset);
				const nextContentIndex = suffix.search(/\S/);
				const needsTrailingEndOfLine =
					nextContentIndex !== -1 &&
					!suffix.slice(0, nextContentIndex).includes('\n');
				edits.push({
					end: needsTrailingEndOfLine ? offset + nextContentIndex : offset,
					replacement: `${endOfLine}${rendered}${needsTrailingEndOfLine ? endOfLine : ''}`,
					start: offset,
				});
			} else {
				edits.push({
					end: offset,
					replacement: `${rendered}${endOfLine}`,
					start: offset,
				});
			}
		}
	}

	return edits;
};

export const applySourceEdits = ({
	edits,
	input,
}: {
	edits: SourceEdit[];
	input: string;
}) => {
	const sorted = edits.slice().sort((left, right) => right.start - left.start);
	let output = input;
	let previousStart = input.length + 1;
	for (const edit of sorted) {
		if (edit.end > previousStart) {
			throw new Error('Overlapping source edit ranges');
		}

		output =
			output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
		previousStart = edit.start;
	}

	return output;
};
