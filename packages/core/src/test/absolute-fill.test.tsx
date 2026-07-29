import {expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {AbsoluteFill} from '../AbsoluteFill.js';

test('AbsoluteFill renders outside a composition', () => {
	const markup = renderToString(
		<AbsoluteFill className="layer" style={{backgroundColor: 'red'}}>
			Content
		</AbsoluteFill>,
	);

	expect(markup).toContain('Content');
	expect(markup).toContain('class="layer"');
	expect(markup).toContain('background-color:red');
});
