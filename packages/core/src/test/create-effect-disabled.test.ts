import {expect, test} from 'bun:test';
import {createEffect} from '../effects/create-effect.js';

type FooParams = {
	readonly amount: number;
};

const makeFoo = () =>
	createEffect<FooParams, null>({
		type: 'test/foo',
		label: 'Foo',
		backend: '2d',
		calculateKey: (p) => `foo-${p.amount}`,
		setup: () => null,
		apply: () => undefined,
		cleanup: () => undefined,
		schema: {},
		validateParams: () => {},
	});

test('createEffect factory accepts `disabled` without complaint', () => {
	const foo = makeFoo();
	const desc = foo({amount: 1, disabled: true});
	expect((desc.params as {disabled?: boolean}).disabled).toBe(true);
});

test('effectKey changes when `disabled` toggles so memoization re-runs', () => {
	const foo = makeFoo();
	const enabled = foo({amount: 1});
	const disabled = foo({amount: 1, disabled: true});
	const explicitlyEnabled = foo({amount: 1, disabled: false});

	expect(enabled.effectKey).not.toBe(disabled.effectKey);
	expect(enabled.effectKey).toBe(explicitlyEnabled.effectKey);
});

test('definition.calculateKey reflects `disabled` for override merge path', () => {
	const foo = makeFoo();
	const desc = foo({amount: 1});
	const enabledKey = desc.definition.calculateKey({amount: 1});
	const disabledKey = desc.definition.calculateKey({amount: 1, disabled: true});
	expect(enabledKey).not.toBe(disabledKey);
});

test('createEffect injects `disabled` into the schema for save-effect-props', () => {
	const foo = createEffect<FooParams, null>({
		type: 'test/foo',
		label: 'Foo',
		backend: '2d',
		calculateKey: (p) => `foo-${p.amount}`,
		setup: () => null,
		apply: () => undefined,
		cleanup: () => undefined,
		schema: {
			amount: {type: 'number', default: 0, description: 'Amount'},
		},
		validateParams: () => {},
	});
	const desc = foo({amount: 1});
	expect(desc.definition.schema.disabled).toEqual({
		type: 'boolean',
		default: false,
		description: 'Disabled',
	});
	expect(desc.definition.schema.amount).toEqual({
		type: 'number',
		default: 0,
		description: 'Amount',
	});
});

test('createEffect injects `disabled` even when the effect schema is empty', () => {
	const foo = makeFoo();
	const desc = foo({amount: 1});
	expect(desc.definition.schema.disabled).toEqual({
		type: 'boolean',
		default: false,
		description: 'Disabled',
	});
});
