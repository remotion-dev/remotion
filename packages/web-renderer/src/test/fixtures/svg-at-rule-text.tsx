import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
export const svgAtRuleTextModes = [
	'comment-import',
	'comment-scope',
	'double-string',
	'single-string',
	'escaped-string',
	'comment-in-string',
	'mixed-case',
	'unquoted-url',
	'url-close-bracket',
	'url-open-bracket',
	'url-brace',
	'url-uppercase',
	'url-escaped-name',
	'url-escaped-close',
	'url-bad-quote',
	'url-custom-value',
	'custom-value',
	'custom-block',
	'escaped-at',
	'unterminated-comment',
] as const;
const labels: Record<(typeof svgAtRuleTextModes)[number], string> = {
	'comment-import': '/* @import "unused.css"; */',
	'comment-scope': '/* @scope (.unused) {} */',
	'double-string': '.unused{--note:"@import unused.css"}',
	'single-string': ".unused{--note:'@scope (.unused)'}",
	'escaped-string': '.unused{--note:"escaped \\" @import unused.css \\""}',
	'comment-in-string': '.unused{--note:"/* @scope */"}',
	'mixed-case': '/* @ImPoRt unused */.unused{--note:"@ScOpE"}',
	'unquoted-url': '.unused{background-image:url(data:text/plain,@import)}',
	'url-close-bracket': '.unused{background:url(data:text/plain,a];@scope)}',
	'url-open-bracket': '.unused{background:url(data:text/plain,a[;@import)}',
	'url-brace': '.unused{background:url(data:text/plain,a};@scope)}',
	'url-uppercase': '.unused{background:URL(data:text/plain,a];@scope)}',
	'url-escaped-name': String.raw`.unused{background:u\72l(data:text/plain,a];@scope)}`,
	'url-escaped-close': String.raw`.unused{background:url(data:text/plain,a\);];@scope)}`,
	'url-bad-quote': '.unused{background:url(data:text/plain,a";];@scope)}',
	'url-custom-value': '.unused{--note:url(data:text/plain,a];@scope)}',
	'custom-value': '.unused{--note:@scope}',
	'custom-block': '.unused{--note:{@scope (.unused){color:red}}}',
	'escaped-at': '.unused\\@scope{color:green}',
	'unterminated-comment': '/* @import unused.css',
};
export const svgAtRuleText = ({
	mode,
	literal,
	positive,
}: {
	mode: (typeof svgAtRuleTextModes)[number];
	literal: boolean;
	positive: boolean;
}) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const text = useRef<SVGTextElement>(null);
		useLayoutEffect(() => {
			if (frame === 1) text.current!.setAttribute('style', '');
			else text.current!.removeAttribute('style');
		}, [frame]);
		const active = positive ? frame === 1 : frame === 0;
		const rule = `text${positive ? '[style]' : ':not([style])'} + rect{fill:red}`;
		const comment = labels[mode];
		const css =
			mode === 'unterminated-comment'
				? `${literal ? '' : rule}${comment}`
				: `${comment}${literal ? '' : rule}`;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={180} height={100}>
					<style>{css}</style>
					<text ref={text} x={0} y={0} fontSize={0}>
						Guard
					</text>
					<rect
						x={16}
						y={18}
						width={120 + frame * 8}
						height={60}
						fill={literal && active ? 'red' : 'blue'}
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-at-rule-text-${mode}-${positive ? 'positive' : 'negative'}${literal ? '-literal' : ''}`,
		width: 180,
		height: 100,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
