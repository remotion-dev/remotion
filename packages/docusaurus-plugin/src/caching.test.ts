import {expect, test} from 'bun:test';
import {createHighlighter} from 'shiki';
import {cachedTwoslashCall} from './caching';

test('applies Twoslash transforms to JavaScript code blocks', async () => {
	const highlighter = await createHighlighter({
		themes: ['github-dark'],
		langs: ['javascript'],
	});
	const html = cachedTwoslashCall(
		['const hidden = false;', '// ---cut---', 'console.log(hidden);'].join(
			'\n',
		),
		'javascript',
		highlighter,
	);

	expect(html).not.toContain('---cut---');
	expect(html).toContain('console');
});
