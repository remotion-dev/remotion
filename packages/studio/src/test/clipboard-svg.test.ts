import {expect, test} from 'bun:test';
import {
	extractSvgMarkup,
	getClipboardSvgMarkup,
	hasClipboardSvgMarkup,
} from '../helpers/clipboard-svg';

const makeClipboardData = ({
	html = '',
	text = '',
}: {
	html?: string;
	text?: string;
}): DataTransfer => {
	return {
		getData: (mimeType: string) => {
			if (mimeType === 'text/plain') {
				return text;
			}

			if (mimeType === 'text/html') {
				return html;
			}

			return '';
		},
	} as unknown as DataTransfer;
};

test('extracts standalone SVG markup', () => {
	const markup = '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z" /></svg>';
	expect(extractSvgMarkup(markup)).toBe(markup);
});

test('removes an SVG XML preamble', () => {
	expect(
		extractSvgMarkup(
			'<?xml version="1.0"?><!DOCTYPE svg><!-- icon --><svg><circle /></svg>',
		),
	).toBe('<svg><circle /></svg>');
});

test('does not treat surrounding text as SVG markup', () => {
	expect(extractSvgMarkup('Paste this: <svg><circle /></svg>')).toBe(null);
	expect(extractSvgMarkup('<svg><circle /></svg> trailing')).toBe(null);
	expect(extractSvgMarkup('<svg><circle />')).toBe(null);
});

test('prefers plain text SVG markup from the clipboard', () => {
	const clipboardData = makeClipboardData({
		text: '<svg><rect /></svg>',
		html: '<svg><circle /></svg>',
	});

	expect(getClipboardSvgMarkup(clipboardData)).toBe('<svg><rect /></svg>');
	expect(hasClipboardSvgMarkup(clipboardData)).toBe(true);
});

test('falls back to HTML clipboard data', () => {
	const clipboardData = makeClipboardData({
		html: '<svg><circle /></svg>',
		text: 'not SVG',
	});

	expect(getClipboardSvgMarkup(clipboardData)).toBe('<svg><circle /></svg>');
});
