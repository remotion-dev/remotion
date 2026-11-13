import {expect, test} from 'bun:test';
import {getSvgFontCssForCarrier} from '../src/drawing/svg-font-css-for-carrier';

const persistent = '@font-face{font-family:Review;src:url(persistent)}';
const preferred = '@font-face{font-family:Review;src:url(preferred)}';
const inactive = '@font-face{font-family:Review;src:url(inactive)}';
const registered = '@font-face{font-family:Review;src:url(registered)}';
const rules = [
	{css: persistent, localTitle: null},
	{css: preferred, localTitle: 'A'},
	{css: inactive, localTitle: 'B'},
];

test('does not promote an inactive set into the preferred carrier', () => {
	expect(
		getSvgFontCssForCarrier({rules, title: 'A', registeredCss: null}),
	).toBe(persistent + preferred);
});

test('keeps each alternate set independent', () => {
	expect(
		getSvgFontCssForCarrier({rules, title: 'B', registeredCss: null}),
	).toBe(persistent + inactive);
});

test('does not append an earlier persistent face to a trailing untitled carrier', () => {
	expect(
		getSvgFontCssForCarrier({rules, title: null, registeredCss: null}),
	).toBe('');
});

test('retains later persistent declarations after preferred declarations', () => {
	expect(
		getSvgFontCssForCarrier({
			rules: [...rules, {css: inactive, localTitle: null}],
			title: 'A',
			registeredCss: null,
		}),
	).toBe(persistent + preferred + inactive);
});

test('appends registered faces after the applicable CSS declarations', () => {
	expect(
		getSvgFontCssForCarrier({rules, title: 'A', registeredCss: registered}),
	).toBe(persistent + preferred + registered);
});

test('keeps registered faces available in an untitled carrier after titled CSS', () => {
	expect(
		getSvgFontCssForCarrier({rules, title: null, registeredCss: registered}),
	).toBe(registered);
});

test('retains all persistent declarations when no local sets exist', () => {
	expect(
		getSvgFontCssForCarrier({
			rules: [
				{css: persistent, localTitle: null},
				{css: preferred, localTitle: null},
			],
			title: null,
			registeredCss: registered,
		}),
	).toBe(persistent + preferred + registered);
});

test('preserves repeated declarations within the same set', () => {
	expect(
		getSvgFontCssForCarrier({
			rules: [...rules, {css: inactive, localTitle: 'A'}],
			title: 'A',
			registeredCss: null,
		}),
	).toBe(persistent + preferred + inactive);
});

test('provides persistent faces to an otherwise empty titled set', () => {
	expect(
		getSvgFontCssForCarrier({rules, title: 'C', registeredCss: null}),
	).toBe(persistent);
});

test('handles a registered-only font snapshot', () => {
	expect(
		getSvgFontCssForCarrier({
			rules: [],
			title: null,
			registeredCss: registered,
		}),
	).toBe(registered);
});
