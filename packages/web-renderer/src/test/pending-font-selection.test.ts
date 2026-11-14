import {expect, test} from 'vitest';
import {pendingFontMayAffectSample} from '../pending-font-selection';
import {cases} from './pending-font-selection-cases';

// Descriptor ordering and conservative ties, backed by independent native
// before/after/literal controls. A pending fetch has no native FontFace yet.
test.for(cases)('selects prospective SDK font $name', (item) => {
	const current = {...item.current, unicodeRange: item.current.range};
	const pending = {...item.pending, unicodeRange: item.pending.range};
	expect(
		pendingFontMayAffectSample(
			pending,
			[current],
			{
				fontFamily: 'Example',
				fontSize: '36px',
				fontWeight: item.query.weight,
				fontStyle: item.query.style,
				fontStretch: item.query.stretch,
			},
			'text' in item ? item.text : 'Review font',
		),
	).toBe(item.change !== false);
});

test('keeps unknown descriptors and incomplete current text coverage pending', () => {
	const face = {
		weight: '400',
		style: 'normal',
		stretch: '100%',
		unicodeRange: null,
	};
	const query = {
		fontFamily: 'Example',
		fontSize: '36px',
		fontWeight: '400',
		fontStyle: 'normal',
		fontStretch: '100%',
	};
	expect(
		pendingFontMayAffectSample({...face, weight: 'bad'}, [face], query, 'A'),
	).toBe(true);
	expect(
		pendingFontMayAffectSample(
			{...face, unicodeRange: 'U+5A-41'},
			[face],
			query,
			'A',
		),
	).toBe(true);
	expect(
		pendingFontMayAffectSample(
			{...face, weight: '700'},
			[{...face, unicodeRange: 'U+41'}],
			query,
			'AB',
		),
	).toBe(true);
	expect(
		pendingFontMayAffectSample({...face, unicodeRange: 'U+42'}, [], query, 'A'),
	).toBe(true);
});
