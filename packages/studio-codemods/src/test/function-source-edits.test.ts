import {expect, test} from 'bun:test';
import type {BlockStatement, Statement} from '@babel/types';
import * as recast from 'recast';
import {
	captureFunctionSourceSnapshots,
	getFunctionSourceEditsForPrependedStatements,
} from '../function-source-edits';
import {recastIndexToOffset} from '../recast-loc-to-offset';
import {parseAst} from '../sequence-props/parse-ast';

const b = recast.types.builders;

test('maps Recast indexes back to source offsets with BOM, tabs, and CRLF', () => {
	const input = '\uFEFF\texport const C = () => (\r\n\t<div />\r\n);\r\n';
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
	if (initializer?.type !== 'ArrowFunctionExpression') {
		throw new Error('Expected an arrow function');
	}

	const extra = initializer.body.extra as
		| {parenStart?: number}
		| null
		| undefined;
	if (typeof extra?.parenStart !== 'number') {
		throw new Error('Expected a parenthesized expression body');
	}

	expect(recastIndexToOffset(input, extra.parenStart)).toBe(
		input.indexOf('(', input.indexOf('=>')),
	);
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
	const input = `export const C = () => items.map(() => <span />);
`;
	const ast = parseAst(input);
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
});
