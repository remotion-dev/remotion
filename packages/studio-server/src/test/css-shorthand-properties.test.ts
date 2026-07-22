import {expect, test} from 'bun:test';
import {
	getCssShorthandForLonghand,
	getCssShorthandsForUpdates,
} from '../helpers/css-shorthand-properties';

test('registers border longhands and side-specific blockers', () => {
	const border = getCssShorthandForLonghand({
		parentKey: 'style',
		longhand: 'borderWidth',
	});

	expect(border?.shorthand).toBe('border');
	expect(border?.longhands).toEqual([
		'borderWidth',
		'borderStyle',
		'borderColor',
	]);

	for (const sideProperty of [
		'borderLeft',
		'borderRightWidth',
		'borderTopStyle',
		'borderBottomColor',
	]) {
		expect(border?.isUnsupportedProperty(sideProperty)).toBe(true);
	}

	expect(border?.isUnsupportedProperty('borderRadius')).toBe(false);
});

test('selects shorthand migrations from dot-notation update keys', () => {
	expect(
		getCssShorthandsForUpdates(['style.opacity', 'style.borderColor']).map(
			(property) => property.shorthand,
		),
	).toEqual(['border']);
	expect(getCssShorthandsForUpdates(['style.opacity'])).toEqual([]);
});
