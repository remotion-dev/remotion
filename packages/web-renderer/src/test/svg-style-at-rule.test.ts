import {expect, test} from 'vitest';
import {hasExcludedSvgStyleAtRule} from '../drawing/has-excluded-svg-style-at-rule';
const cases: readonly [string, string, boolean][] = [
	['import', '@import url("unused.css");', true],
	['scope', '@scope (.root){text{fill:red}}', true],
	['case', '@ImPoRt url("unused.css");', true],
	['nested', '@media all{@supports(display:grid){@scope (.root){}}}', true],
	['escaped-import', String.raw`@\69 mport url("unused.css");`, true],
	['escaped-scope', String.raw`@sc\6f pe (.root){}`, true],
	['six-hex', String.raw`@\000069mport url("unused.css");`, true],
	['bom', '\ufeff@scope (.root){}', true],
	['comment-then-scope', '/* @import unused */ @scope (.root){}', true],
	['declaration-then-scope', 'text{fill:red;@scope (.root){}}', true],
	['broken-string-then-scope', '"bad\n;@scope (.root){}', true],
	['comment', '/* @scope (.root){} */', false],
	['unterminated-comment', 'text{fill:red}/* @import unused.css', false],
	['double-string', 'text{content:"@scope"}', false],
	['single-string', "text{content:'@import unused.css'}", false],
	['escaped-string', String.raw`text{content:"escaped \" @scope \""}`, false],
	['string-comment', 'text{content:"/* @scope */"}', false],
	['url', 'text{background:url(data:text/plain,@import)}', false],
	['quoted-url', 'text{background:url("@scope")}', false],
	[
		'escaped-url',
		String.raw`text{background:url(data:text/plain,a\);@scope)}`,
		false,
	],
	['escaped-attribute', String.raw`text[data\]note=@scope]{fill:red}`, false],

	[
		'url-bracket-close',
		'text{background:url(data:text/plain,a];@scope)}',
		false,
	],
	[
		'url-bracket-open',
		'text{background:url(data:text/plain,a[;@scope)}',
		false,
	],
	['url-brace', 'text{background:url(data:text/plain,a};@scope)}', false],
	['url-uppercase', 'text{background:URL(data:text/plain,a];@scope)}', false],
	[
		'url-escaped-name-bracket',
		String.raw`text{background:u\72l(data:text/plain,a];@scope)}`,
		false,
	],
	[
		'url-escaped-leading-name',
		String.raw`text{background:\75 rl(data:text/plain,a];@scope)}`,
		false,
	],
	[
		'url-escaped-close-bracket',
		String.raw`text{background:url(data:text/plain,a\);];@scope)}`,
		false,
	],
	['url-bad-quote', 'text{background:url(data:text/plain,a";];@scope)}', false],
	[
		'url-bad-open-paren',
		'text{background:url(data:text/plain,a(;];@scope)}',
		false,
	],
	[
		'url-bad-whitespace',
		'text{background:url(data:text/plain,a ;];@scope)}',
		false,
	],
	['url-custom', 'text{--note:url(data:text/plain,a];@scope)}', false],
	[
		'url-in-function',
		'text{background:image-set(url(data:text/plain,a];@scope) 1x)}',
		false,
	],
	[
		'scope-after-url',
		'text{background:url(data:text/plain,a];@import)}@scope(.root){}',
		true,
	],
	['scope-after-bad-url', 'text{background:url(a"x);@scope(.root){}}', true],
	[
		'scope-after-custom-url',
		'text{--note:url(a];@import);@scope(.root){}}',
		true,
	],
	['not-url-suffix', 'text{background:myurl(a);@scope(.root){}}', true],
	['custom', 'text{--note:@scope}', false],
	['custom-block', 'text{--note:{@scope (.root){color:red}}}', false],
	['custom-list', 'text{--note:[@scope;{@import "x"}]}', false],
	['escaped-custom', String.raw`text{\2d \2d note:{@scope (.root){}}}`, false],
	['escaped-at', String.raw`.thing\@scope{fill:red}`, false],
	['escaped-at-start', String.raw`\40 scope{fill:red}`, false],
	['invalid-escape', '@im\\\nport url("unused.css");', false],
	['split-token', '@im/**/port url("unused.css");', false],
	['keyword-suffix', '@scope-extra{}', false],
	['namespace', '@namespace svg url("urn:@scope");svg|text{fill:red}', false],
	[
		'font-family',
		'@font-face{font-family:"@scope";src:url(data:text/plain,@import)}',
		false,
	],
	['scope-after-custom', 'text{--note:{@import "x"};@scope (.root){}}', true],
	['import-after-string', 'text{content:"@scope"} @import url("x");', true],
];
test.for(cases)(
	'recognizes excluded SVG at-rules: %s',
	([, text, expected]) => {
		expect(hasExcludedSvgStyleAtRule(text)).toBe(expected);
	},
);
