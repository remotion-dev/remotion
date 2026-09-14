import type {
	BlockStatement,
	File,
	Function as BabelFunction,
	Statement,
} from '@babel/types';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {recastIndexToOffset, recastLocToOffset} from './recast-loc-to-offset';
import {
	getNodeEndIncludingSameLineComments,
	type SourceEdit,
} from './source-edits';
import {
	getEndOfLine,
	getLineIndent,
	indentContinuationLines,
} from './source-style';

export type FunctionNode = BabelFunction;

export type FunctionSourceSnapshot = {
	body: FunctionNode['body'];
	functionNode: FunctionNode;
	statements: Statement[] | null;
};

const isFunctionNode = (node: unknown): node is FunctionNode => {
	return (
		recast.types.namedTypes.FunctionDeclaration.check(node) ||
		recast.types.namedTypes.FunctionExpression.check(node) ||
		recast.types.namedTypes.ArrowFunctionExpression.check(node) ||
		recast.types.namedTypes.ObjectMethod.check(node) ||
		recast.types.namedTypes.ClassMethod.check(node) ||
		recast.types.namedTypes.ClassPrivateMethod.check(node)
	);
};

export const captureFunctionSourceSnapshots = (
	ast: File,
): FunctionSourceSnapshot[] => {
	const snapshots: FunctionSourceSnapshot[] = [];
	recast.types.visit(ast, {
		visitFunction(path) {
			if (!isFunctionNode(path.node)) {
				this.traverse(path);
				return undefined;
			}

			const functionNode = path.node;
			snapshots.push({
				body: functionNode.body,
				functionNode,
				statements:
					functionNode.body.type === 'BlockStatement'
						? [...functionNode.body.body]
						: null,
			});
			this.traverse(path);
			return undefined;
		},
	});

	return snapshots;
};

const getBodySourceRange = ({
	body,
	functionNode,
	input,
}: {
	body: FunctionNode['body'];
	functionNode: FunctionNode;
	input: string;
}): {end: number; start: number} | null => {
	if (!body.loc) {
		return null;
	}

	const bodyStart = recastLocToOffset(input, body.loc.start);
	let start = bodyStart;
	let end = recastLocToOffset(input, body.loc.end);
	const leadingCommentStarts = (body.leadingComments ?? []).flatMap((comment) =>
		comment.loc && recastLocToOffset(input, comment.loc.end) <= bodyStart
			? [recastLocToOffset(input, comment.loc.start)]
			: [],
	);
	if (leadingCommentStarts.length > 0) {
		start = Math.min(...leadingCommentStarts);
	}

	const extra = body.extra as
		| {
				parenthesized: boolean | null | undefined;
				parenStart: number | null | undefined;
		  }
		| null
		| undefined;
	if (extra?.parenthesized && typeof extra.parenStart === 'number') {
		if (!functionNode.loc) {
			return null;
		}

		start = Math.min(start, recastIndexToOffset(input, extra.parenStart));
		end = recastLocToOffset(input, functionNode.loc.end);
	}

	return {end, start};
};

export const getFunctionSourceEditsForPrependedStatements = ({
	indentationUnit,
	input,
	printNode,
	reprintBlockBodies,
	snapshots,
}: {
	indentationUnit: string;
	input: string;
	printNode: (node: namedTypes.Node) => string;
	reprintBlockBodies: ReadonlySet<BlockStatement>;
	snapshots: FunctionSourceSnapshot[];
}): {coveredRanges: {end: number; start: number}[]; edits: SourceEdit[]} => {
	const coveredRanges: {end: number; start: number}[] = [];
	const edits: SourceEdit[] = [];
	const endOfLine = getEndOfLine(input);

	for (const snapshot of snapshots) {
		const {body: originalBody, functionNode, statements} = snapshot;
		const shouldReprintBody =
			functionNode.body !== originalBody ||
			(originalBody.type === 'BlockStatement' &&
				reprintBlockBodies.has(originalBody));
		if (shouldReprintBody) {
			const range = getBodySourceRange({
				body: originalBody,
				functionNode,
				input,
			});
			if (!range) {
				continue;
			}

			edits.push({
				...range,
				replacement: indentContinuationLines({
					indent: getLineIndent({input, offset: range.start}),
					input,
					printed: printNode(functionNode.body as unknown as namedTypes.Node),
				}),
			});
			coveredRanges.push(range);
			continue;
		}

		if (originalBody.type !== 'BlockStatement' || statements === null) {
			continue;
		}

		const originalStatements = new Set(statements);
		const insertedStatements = originalBody.body.filter(
			(statement) => !originalStatements.has(statement),
		);
		const unchangedStatements = originalBody.body.slice(
			insertedStatements.length,
		);
		const onlyPrependedStatementsChanged =
			originalBody.body
				.slice(0, insertedStatements.length)
				.every((statement) => !originalStatements.has(statement)) &&
			unchangedStatements.length === statements.length &&
			unchangedStatements.every(
				(statement, index) => statement === statements[index],
			);
		if (!onlyPrependedStatementsChanged) {
			throw new Error(
				'Function source edits only support prepended statements unless the block body is explicitly reprinted',
			);
		}

		if (insertedStatements.length === 0 || !originalBody.loc) {
			continue;
		}

		const blockStart = recastLocToOffset(input, originalBody.loc.start);
		const blockEnd = recastLocToOffset(input, originalBody.loc.end);
		const openingBrace = input.indexOf('{', blockStart);
		if (openingBrace === -1 || openingBrace >= blockEnd) {
			continue;
		}

		const firstOriginalStatement = statements[0];
		const firstOriginalOffset = firstOriginalStatement?.loc
			? recastLocToOffset(input, firstOriginalStatement.loc.start)
			: null;
		const lastDirective = originalBody.directives?.at(-1);
		const insertionStart = lastDirective
			? (getNodeEndIncludingSameLineComments({
					input,
					node: lastDirective,
				}) ?? openingBrace + 1)
			: openingBrace + 1;
		const leadingCommentOffsets = (
			firstOriginalStatement?.leadingComments ?? []
		).flatMap((comment) =>
			comment.loc ? [recastLocToOffset(input, comment.loc.start)] : [],
		);
		const firstKnownContentOffset = [
			...(firstOriginalOffset === null ? [] : [firstOriginalOffset]),
			...leadingCommentOffsets,
		].reduce<number | null>(
			(earliest, candidate) =>
				candidate < insertionStart
					? earliest
					: Math.min(earliest ?? candidate, candidate),
			null,
		);
		const gapToKnownContent = input.slice(
			insertionStart,
			firstKnownContentOffset ?? blockEnd,
		);
		const immediateContentIndex = gapToKnownContent.search(/\S/);
		const firstContentOffset =
			immediateContentIndex === -1
				? firstKnownContentOffset
				: insertionStart + immediateContentIndex;
		const gap =
			firstContentOffset === null
				? ''
				: input.slice(insertionStart, firstContentOffset);
		const originalStartsOnNewLine = /\r?\n/.test(gap);
		const contentIsClosingBrace =
			firstContentOffset !== null && input[firstContentOffset] === '}';
		const statementIndent =
			firstContentOffset !== null &&
			originalStartsOnNewLine &&
			!contentIsClosingBrace
				? getLineIndent({input, offset: firstContentOffset})
				: `${getLineIndent({input, offset: blockStart})}${indentationUnit}`;
		const printedStatements = insertedStatements
			.map((statement) => printNode(statement as unknown as namedTypes.Node))
			.join(`${endOfLine}${statementIndent}`);
		edits.push({
			end: originalStartsOnNewLine
				? insertionStart
				: (firstContentOffset ?? insertionStart),
			replacement: originalStartsOnNewLine
				? `${endOfLine}${statementIndent}${printedStatements}`
				: `${endOfLine}${statementIndent}${printedStatements}${endOfLine}${statementIndent}`,
			start: insertionStart,
		});
	}

	return {
		coveredRanges,
		edits: edits.filter(
			(edit) =>
				!coveredRanges.some(
					(range) =>
						edit.start >= range.start &&
						edit.end <= range.end &&
						(edit.start !== range.start || edit.end !== range.end),
				),
		),
	};
};
