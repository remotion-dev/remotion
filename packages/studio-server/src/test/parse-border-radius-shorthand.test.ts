import {expect, test} from 'bun:test';
import {parseBorderRadiusShorthand} from '../helpers/parse-border-radius-shorthand';

test('expands numeric and pixel border radius shorthands', () => {
	expect(parseBorderRadiusShorthand(12)).toEqual({
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		borderBottomRightRadius: 12,
		borderBottomLeftRadius: 12,
	});
	expect(parseBorderRadiusShorthand('10px 20px')).toEqual({
		borderTopLeftRadius: 10,
		borderTopRightRadius: 20,
		borderBottomRightRadius: 10,
		borderBottomLeftRadius: 20,
	});
	expect(parseBorderRadiusShorthand('10px 20px 30px')).toEqual({
		borderTopLeftRadius: 10,
		borderTopRightRadius: 20,
		borderBottomRightRadius: 30,
		borderBottomLeftRadius: 20,
	});
	expect(parseBorderRadiusShorthand('10px 20px 30px 40px')).toEqual({
		borderTopLeftRadius: 10,
		borderTopRightRadius: 20,
		borderBottomRightRadius: 30,
		borderBottomLeftRadius: 40,
	});
});

test('rejects complex and invalid border radius shorthands', () => {
	for (const value of [
		-1,
		Number.POSITIVE_INFINITY,
		'',
		'10%',
		'1rem',
		'10px / 20px',
		'1px 2px 3px 4px 5px',
		'inherit',
		null,
	]) {
		expect(parseBorderRadiusShorthand(value)).toBeNull();
	}
});
