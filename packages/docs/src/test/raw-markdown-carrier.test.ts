import {expect, test} from 'bun:test';
import {serializeRawMarkdownForScript} from '../theme/RawMarkdownCarrier';

test('escapes raw markdown so it can be embedded in a script tag', () => {
	const raw = '```svelte\n<script>console.log("hi")</script>\n```';
	const serialized = serializeRawMarkdownForScript(raw);

	expect(serialized).not.toContain('</script>');
	expect(JSON.parse(serialized)).toBe(raw);
});
