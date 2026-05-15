import {expect, test} from 'bun:test';
import {parseAst} from '../codemods/parse-ast';
import {computeEffectPropStatus} from '../preview-server/routes/can-update-effect-props';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {tint} from '@remotion/effects';

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas _experimentalEffects={${effects}}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;

const findJsx = (input: string) => {
	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(ast, lineColumnToNodePath(input, 6));
	if (!jsx) {
		throw new Error('JSX not found');
	}

	return jsx;
};

test('computeEffectPropStatus reports static props as canUpdate=true with codeValue', () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 0,
		keys: ['color', 'opacity'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.color).toEqual({canUpdate: true, codeValue: 'red'});
	expect(result.props.opacity).toEqual({canUpdate: true, codeValue: 0.5});
});

test('computeEffectPropStatus reports computed props', () => {
	const input = buildInput('[tint({color: getColor(), opacity: 0.5})]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 0,
		keys: ['color', 'opacity'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.color).toEqual({canUpdate: false, reason: 'computed'});
	expect(result.props.opacity).toEqual({canUpdate: true, codeValue: 0.5});
});

test('computeEffectPropStatus reports unset props as undefined codeValue', () => {
	const input = buildInput('[tint({color: "red"})]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 0,
		keys: ['color', 'opacity'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.color).toEqual({canUpdate: true, codeValue: 'red'});
	expect(result.props.opacity).toEqual({canUpdate: true, codeValue: undefined});
});

test('computeEffectPropStatus flags non-call expressions', () => {
	const input = buildInput('[someEffect, tint({color: "red"})]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 0,
		keys: ['color'],
	});

	expect(result.canUpdate).toBe(false);
	if (result.canUpdate) {
		throw new Error('expected canUpdate false');
	}

	expect(result.reason).toBe('not-call-expression');
});

test('computeEffectPropStatus flags out-of-range effect indices', () => {
	const input = buildInput('[tint({color: "red"})]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 5,
		keys: ['color'],
	});

	expect(result.canUpdate).toBe(false);
	if (result.canUpdate) {
		throw new Error('expected canUpdate false');
	}

	expect(result.reason).toBe('not-found');
});

test('computeEffectPropStatus treats non-object first arg as computed', () => {
	const input = buildInput('[tint(getParams())]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 0,
		keys: ['color'],
	});

	expect(result.canUpdate).toBe(false);
	if (result.canUpdate) {
		throw new Error('expected canUpdate false');
	}

	expect(result.reason).toBe('computed');
});

test('computeEffectPropStatus treats zero-arg effect as editable with undefined props', () => {
	const input = buildInput('[tint()]');
	const result = computeEffectPropStatus({
		jsx: findJsx(input),
		effectIndex: 0,
		keys: ['amount'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.amount).toEqual({
		canUpdate: true,
		codeValue: undefined,
	});
});
