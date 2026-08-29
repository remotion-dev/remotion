import {expect, test} from 'bun:test';
import {parseBackgroundShorthand} from '../helpers/parse-background-shorthand';

test('parses color-only background shorthands', () => {
	for (const backgroundColor of [
		'red',
		'#123456',
		'rgba(1, 2, 3, 0.5)',
		'hsla(120, 50%, 50%, 0.25)',
		'transparent',
	]) {
		expect(parseBackgroundShorthand(backgroundColor)).toEqual({
			backgroundColor,
			backgroundImage: 'none',
			backgroundPosition: '0% 0%',
			backgroundSize: 'auto auto',
			backgroundRepeat: 'repeat',
			backgroundOrigin: 'padding-box',
			backgroundClip: 'border-box',
			backgroundAttachment: 'scroll',
		});
	}
});

test('maps a none background to a transparent color', () => {
	expect(parseBackgroundShorthand('none')).toEqual({
		backgroundColor: 'transparent',
		backgroundImage: 'none',
		backgroundPosition: '0% 0%',
		backgroundSize: 'auto auto',
		backgroundRepeat: 'repeat',
		backgroundOrigin: 'padding-box',
		backgroundClip: 'border-box',
		backgroundAttachment: 'scroll',
	});
});

test('rejects complex, dynamic and CSS-wide backgrounds', () => {
	for (const background of [
		'',
		'initial',
		'inherit',
		'unset',
		'revert',
		'revert-layer',
		'var(--background)',
		'linear-gradient(red, blue)',
		'url(image.png)',
		'red url(image.png)',
		'red no-repeat',
		'red, blue',
	]) {
		expect(parseBackgroundShorthand(background)).toBe(null);
	}
});
