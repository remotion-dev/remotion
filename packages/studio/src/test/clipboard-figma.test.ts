import {expect, test} from 'bun:test';
import {
	formatFigmaClipboardError,
	getClipboardFigmaHtml,
	hasClipboardFigmaPayload,
} from '../helpers/clipboard-figma';

const makeClipboardData = (html: string): DataTransfer => {
	return {
		getData: (mimeType: string) => (mimeType === 'text/html' ? html : ''),
	} as unknown as DataTransfer;
};

test('detects a complete Figma clipboard envelope', () => {
	const html =
		'<span data-metadata="<!--(figmeta)e30=(/figmeta)-->"></span>' +
		'<span data-buffer="<!--(figma)ZmlnLWtpd2k=(/figma)-->"></span>';
	const clipboardData = makeClipboardData(html);
	expect(getClipboardFigmaHtml(clipboardData)).toBe(html);
	expect(hasClipboardFigmaPayload(clipboardData)).toBe(true);
});

test('does not claim incomplete or unrelated HTML', () => {
	expect(
		hasClipboardFigmaPayload(
			makeClipboardData('<!--(figmeta)e30=(/figmeta)-->'),
		),
	).toBe(false);
	expect(hasClipboardFigmaPayload(makeClipboardData('<svg />'))).toBe(false);
});

test('formats Figma clipboard errors for the notification', () => {
	expect(
		formatFigmaClipboardError(
			'Cannot import Figma selection: clipboard scene is incomplete',
		),
	).toBe('Pasting images from Figma is not supported.');
	expect(
		formatFigmaClipboardError(
			'Cannot import Figma selection: Unsupported gradient',
		),
	).toBe('Unsupported gradient.');
	expect(formatFigmaClipboardError('Already punctuated.')).toBe(
		'Already punctuated.',
	);
});
