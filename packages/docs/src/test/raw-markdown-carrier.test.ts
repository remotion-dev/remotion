import {expect, test} from 'bun:test';
import {
	decodeRawMarkdownFromCarrier,
	encodeRawMarkdownForCarrier,
} from '../theme/RawMarkdownCarrier';

test('encodes raw markdown so it can be embedded in an HTML attribute', () => {
	const raw = '```svelte\n<script>console.log("hi")</script>\n```';
	const encoded = encodeRawMarkdownForCarrier(raw);

	expect(encoded).not.toContain('<');
	expect(encoded).not.toContain('>');
	expect(encoded).not.toContain('</script>');
	expect(decodeRawMarkdownFromCarrier(encoded)).toBe(raw);
});
