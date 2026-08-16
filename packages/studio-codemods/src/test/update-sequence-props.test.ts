import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {NoReactInternals} from 'remotion/no-react';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {updateMultipleSequenceProps} from '../update-sequence-props';

test('patches an opening element without reprinting its siblings', () => {
	const input = `export const Example = () => {
	return (
		<div>
			<Interactive.Div name="First" />
			<Interactive.Div name="Second" />
			<Interactive.Div name="Third" />
		</div>
	);
};
`;
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			if (path.node.loc?.start.line === 5) {
				nodePath = getNodePathForRecastPath(path, ast);
				return false;
			}

			return this.traverse(path);
		},
	});
	if (!nodePath) {
		throw new Error('Could not find the second Interactive.Div');
	}

	const {output} = updateMultipleSequenceProps({
		input,
		changes: [
			{
				nodePath,
				updates: [{key: 'hidden', value: true, defaultValue: false}],
				schema: NoReactInternals.sequenceSchema,
				videoConfigValues: null,
			},
		],
	});

	expect(output).toBe(`export const Example = () => {
	return (
		<div>
			<Interactive.Div name="First" />
			<Interactive.Div name="Second" hidden />
			<Interactive.Div name="Third" />
		</div>
	);
};
`);
});
