import {expect, test} from 'bun:test';
import {parseAst} from '../codemods/parse-ast';
import {computeEffectPropStatus} from '../preview-server/routes/can-update-effect-props';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (
	effects: string,
) => `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {tint} from '@remotion/effects/tint';
import {interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<HtmlInCanvas effects={${effects}}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;

const getLine = (input: string, search: string) => {
	const line = input.split('\n').findIndex((l) => l.includes(search));
	if (line === -1) {
		throw new Error(`Could not find line containing ${search}`);
	}

	return line + 1;
};

const findJsx = (input: string) => {
	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(
		ast,
		lineColumnToNodePath(input, getLine(input, '<HtmlInCanvas')),
	);
	if (!jsx) {
		throw new Error('JSX not found');
	}

	return {ast, jsx};
};

test('computeEffectPropStatus reports static props as canUpdate=true with codeValue', () => {
	const input = buildInput('[tint({color: "red", opacity: 0.5})]');
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['color', 'opacity'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.color).toEqual({
		status: 'static',
		codeValue: 'red',
	});
	expect(result.props.opacity).toEqual({
		status: 'static',
		codeValue: 0.5,
	});
	expect(result.importPath).toBe('@remotion/effects/tint');
});

test('computeEffectPropStatus reports computed props', () => {
	const input = buildInput('[tint({color: getColor(), opacity: 0.5})]');
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['color', 'opacity'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.color).toEqual({status: 'computed'});
	expect(result.props.opacity).toEqual({
		status: 'static',
		codeValue: 0.5,
	});
});

test('computeEffectPropStatus reports keyframes for inline interpolated effect props', () => {
	const input = buildInput(
		'[tint({amount: interpolate(frame, [0, 100], [0.2, 0.8])})]',
	);
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['amount'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.amount).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 0.2},
			{frame: 100, value: 0.8},
		],
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
	});
});

test('computeEffectPropStatus reports output for inline interpolated effect props', () => {
	const input = buildInput(
		"[tint({amount: interpolate(frame, [0, 100], [0.2, 0.8], {output: 'perceptual-scale'})})]",
	);
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['amount'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.amount).toEqual({
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 0.2},
			{frame: 100, value: 0.8},
		],
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
		posterize: undefined,
		output: 'perceptual-scale',
	});
});

test('computeEffectPropStatus reports interpolations over computed values as computed', () => {
	const input = `import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {tint} from '@remotion/effects/tint';
import {interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\tconst progress = interpolate(frame, [0, 100], [0, 1], {posterize: 3});
\treturn (
\t\t<HtmlInCanvas effects={[tint({amount: interpolate(progress, [0, 1], [0.2, 0.8])})]}>
\t\t\thi
\t\t</HtmlInCanvas>
\t);
};
`;
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['amount'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.amount).toEqual({status: 'computed'});
});

test('computeEffectPropStatus reports unset props as undefined codeValue', () => {
	const input = buildInput('[tint({color: "red"})]');
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['color', 'opacity'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.color).toEqual({
		status: 'static',
		codeValue: 'red',
	});
	expect(result.props.opacity).toEqual({
		status: 'static',
		codeValue: undefined,
	});
});

test('computeEffectPropStatus reports static array props', () => {
	const input = buildInput('[tint({colors: ["red", "blue"]})]');
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['colors'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.colors).toEqual({
		status: 'static',
		codeValue: ['red', 'blue'],
	});
});

test('computeEffectPropStatus reports arrays with computed items as computed', () => {
	const input = buildInput('[tint({colors: ["red", getColor()]})]');
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['colors'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.colors).toEqual({status: 'computed'});
});

test('computeEffectPropStatus flags non-call expressions', () => {
	const input = buildInput('[someEffect, tint({color: "red"})]');
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
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
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
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
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
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
	const {ast, jsx} = findJsx(input);
	const result = computeEffectPropStatus({
		ast,
		jsx,
		effectIndex: 0,
		keys: ['amount'],
	});

	expect(result.canUpdate).toBe(true);
	if (!result.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(result.props.amount).toEqual({
		status: 'static',
		codeValue: undefined,
	});
});
