import {expect, test} from 'vitest';
import {getSvgFontCssForCarrier} from '../drawing/svg-font-css-for-carrier';

const persistent = '@font-face{font-family:Review;src:url(persistent)}';
const preferred = '@font-face{font-family:Review;src:url(preferred)}';
const inactive = '@font-face{font-family:Review;src:url(inactive)}';
const registered = '@font-face{font-family:Review;src:url(registered)}';
const rules = [
	{css: persistent, localTitle: null, localStyleIndex: null},
	{css: preferred, localTitle: 'A', localStyleIndex: 0},
	{css: inactive, localTitle: 'B', localStyleIndex: 1},
];

test('does not promote an inactive set into the preferred carrier', () => {
	expect(
		getSvgFontCssForCarrier({index: 2, rules, title: 'A', registeredCss: null}),
	).toBe(persistent + preferred);
});

test('keeps each alternate set independent', () => {
	expect(
		getSvgFontCssForCarrier({index: 2, rules, title: 'B', registeredCss: null}),
	).toBe(persistent + inactive);
});

test('does not append an earlier persistent face to a trailing untitled carrier', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules,
			title: null,
			registeredCss: null,
		}),
	).toBe('');
});

test('retains later persistent declarations after preferred declarations', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules: [
				...rules,
				{css: inactive, localTitle: null, localStyleIndex: null},
			],
			title: 'A',
			registeredCss: null,
		}),
	).toBe(persistent + preferred + inactive);
});

test('appends registered faces after the applicable CSS declarations', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules,
			title: 'A',
			registeredCss: registered,
		}),
	).toBe(persistent + preferred + registered);
});

test('keeps registered faces available in an untitled carrier after titled CSS', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules,
			title: null,
			registeredCss: registered,
		}),
	).toBe(registered);
});

test('retains all persistent declarations when no local sets exist', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules: [
				{css: persistent, localTitle: null, localStyleIndex: null},
				{css: preferred, localTitle: null, localStyleIndex: null},
			],
			title: null,
			registeredCss: registered,
		}),
	).toBe(persistent + preferred + registered);
});

test('preserves repeated declarations within the same set', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules: [...rules, {css: inactive, localTitle: 'A', localStyleIndex: 0}],
			title: 'A',
			registeredCss: null,
		}),
	).toBe(persistent + preferred + inactive);
});

test('provides persistent faces to an otherwise empty titled set', () => {
	expect(
		getSvgFontCssForCarrier({index: 2, rules, title: 'C', registeredCss: null}),
	).toBe(persistent);
});

test('handles a registered-only font snapshot', () => {
	expect(
		getSvgFontCssForCarrier({
			index: 2,
			rules: [],
			title: null,
			registeredCss: registered,
		}),
	).toBe(registered);
});

test('keeps a later external face after retained untitled declarations', () => {
	const middle = {css: inactive, localTitle: null, localStyleIndex: 2};
	expect(
		getSvgFontCssForCarrier({
			rules: [
				...rules,
				middle,
				{css: persistent, localTitle: null, localStyleIndex: null},
			],
			title: null,
			index: 2,
			registeredCss: null,
		}),
	).toBe(persistent);
});

test('does not replay earlier external faces after a later untitled declaration', () => {
	expect(
		getSvgFontCssForCarrier({
			rules: [...rules, {css: inactive, localTitle: null, localStyleIndex: 2}],
			title: null,
			index: 2,
			registeredCss: null,
		}),
	).toBe('');
});

test('preserves later persistent faces across an intervening inactive set', () => {
	expect(
		getSvgFontCssForCarrier({
			rules: [
				{css: preferred, localTitle: 'A', localStyleIndex: 0},
				{css: inactive, localTitle: null, localStyleIndex: 1},
				{css: persistent, localTitle: null, localStyleIndex: null},
				{css: inactive, localTitle: 'B', localStyleIndex: 2},
			],
			title: null,
			index: 1,
			registeredCss: registered,
		}),
	).toBe(persistent + registered);
});

test('replays persistent faces following each untitled carrier independently', () => {
	const ordered = [
		{css: preferred, localTitle: 'A', localStyleIndex: 0},
		{css: inactive, localTitle: null, localStyleIndex: 1},
		{css: preferred, localTitle: null, localStyleIndex: 2},
		{css: persistent, localTitle: null, localStyleIndex: null},
	];
	expect(
		getSvgFontCssForCarrier({
			rules: ordered,
			title: null,
			index: 1,
			registeredCss: null,
		}),
	).toBe(preferred + persistent);
	expect(
		getSvgFontCssForCarrier({
			rules: ordered,
			title: null,
			index: 2,
			registeredCss: null,
		}),
	).toBe(persistent);
});
