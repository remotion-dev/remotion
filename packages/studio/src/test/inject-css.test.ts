import {expect, test} from 'bun:test';
import {makeDefaultGlobalCSS} from '../helpers/inject-css';

test('styles InputDragger with a keyboard-only focus affordance', () => {
	const css = makeDefaultGlobalCSS();
	expect(css).toContain(
		'button:focus:not(.__remotion_input_dragger):not(.__remotion_color_swatch)',
	);

	const inputDraggerFocusRule = css.match(
		/\.__remotion_input_dragger:focus-visible \{[^}]+\}/,
	)?.[0];

	expect(inputDraggerFocusRule).toBeDefined();
	expect(inputDraggerFocusRule).toContain('outline: none');
	expect(inputDraggerFocusRule).toContain('box-shadow:');
	expect(inputDraggerFocusRule).toContain('inset 1px 1px #555');
});
