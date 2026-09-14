import {expect, test} from 'bun:test';
import type {BlockStatement, Statement} from '@babel/types';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';
import {
	captureFunctionSourceSnapshots,
	getFunctionSourceEditsForPrependedStatements,
} from '../function-source-edits';
import {recastLocToOffset} from '../recast-loc-to-offset';
import {parseAst} from '../sequence-props/parse-ast';

const b = recast.types.builders;

test('maps Recast locations across source whitespace normalization', () => {
	const inputs = [
		'\uFEFF\texport const C = () => (\r\n\t<div />\r\n);\r\n',
		'export const C =\t() => (<div />);\n',
		'\r\n\nexport const C = () => (\u2028  <div />\u2029);\r',
	];

	for (const input of inputs) {
		const ast = parseAst(input);
		const declaration = ast.program.body[0];
		if (declaration.type !== 'ExportNamedDeclaration') {
			throw new Error('Expected an export declaration');
		}

		const variableDeclaration = declaration.declaration;
		if (variableDeclaration?.type !== 'VariableDeclaration') {
			throw new Error('Expected a variable declaration');
		}

		const initializer = variableDeclaration.declarations[0].init;
		if (
			initializer?.type !== 'ArrowFunctionExpression' ||
			!initializer.body.loc
		) {
			throw new Error('Expected a located arrow function');
		}

		expect(recastLocToOffset(input, initializer.body.loc.start)).toBe(
			input.indexOf('<div'),
		);
		expect(recastLocToOffset(input, initializer.body.loc.end)).toBe(
			input.indexOf('/>') + 2,
		);
	}
});

test('rejects inserted statements outside the leading prefix', () => {
	const input = `export const C = () => {
  first();
};
`;
	const ast = parseAst(input);
	const snapshots = captureFunctionSourceSnapshots(ast);
	const body = snapshots[0]?.functionNode.body;
	if (body?.type !== 'BlockStatement') {
		throw new Error('Expected a block-bodied function');
	}

	body.body.push(
		b.expressionStatement(
			b.callExpression(b.identifier('second'), []),
		) as unknown as Statement,
	);

	expect(() =>
		getFunctionSourceEditsForPrependedStatements({
			indentationUnit: '  ',
			input,
			printNode: (node) => recast.prettyPrint(node).code,
			reprintBlockBodies: new Set(),
			snapshots,
		}),
	).toThrow('Function source edits only support prepended statements');
});

test('filters edits nested inside a reprinted function body', () => {
	const input =
		'const before = true;\r\nexport const C = () => ((items.map(() => <span />)));\r\n';
	const ast = recast.parse(input, {
		lineTerminator: '\r\n',
		parser: tsParser,
	}) as ReturnType<typeof parseAst>;
	const snapshots = captureFunctionSourceSnapshots(ast);
	for (const {functionNode} of snapshots) {
		if (functionNode.body.type === 'BlockStatement') {
			throw new Error('Expected expression-bodied functions');
		}

		functionNode.body = b.blockStatement([
			b.returnStatement(
				functionNode.body as Parameters<typeof b.returnStatement>[0],
			),
		]) as unknown as BlockStatement;
	}

	const {coveredRanges, edits} = getFunctionSourceEditsForPrependedStatements({
		indentationUnit: '  ',
		input,
		printNode: (node) => recast.prettyPrint(node).code,
		reprintBlockBodies: new Set(),
		snapshots,
	});

	expect(coveredRanges).toHaveLength(2);
	expect(edits).toHaveLength(1);
	expect(edits[0].start).toBe(input.indexOf('(', input.indexOf('=>')));
});
