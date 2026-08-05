import {expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {AbsoluteFill} from '../AbsoluteFill.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';

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

test('AbsoluteFill renders outside a composition in the Studio', () => {
	const markup = renderToString(
		<RemotionEnvironmentContext.Provider
			value={{
				isStudio: true,
				isRendering: false,
				isPlayer: false,
				isReadOnlyStudio: false,
				isClientSideRendering: false,
			}}
		>
			<AbsoluteFill className="layer" style={{backgroundColor: 'red'}}>
				Content
			</AbsoluteFill>
		</RemotionEnvironmentContext.Provider>,
	);

	expect(markup).toContain('Content');
	expect(markup).toContain('class="layer"');
	expect(markup).toContain('background-color:red');
});
