import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {webkitLayeredBackdrop} from './fixtures/webkit-layered-backdrop';
import {captureNativeReference, compareNativePixels} from './native-reference';

const scenarios = [false, true].flatMap((translucent) =>
	[1, 1.25].map((scale) => ({
		translucent,
		scale,
		id: `${translucent ? 'translucent' : 'opaque'}-${scale}`,
	})),
);

test.skipIf(server.browser !== 'webkit').for(scenarios)(
	'matches native layered backdrop pixels in $id',
	async ({translucent, scale, id}) => {
		const composition = webkitLayeredBackdrop(translucent);
		const Scene = composition.component;
		const still = await renderStillOnWeb({
			composition,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
			transparent: true,
			scale,
		});
		const actual = await still.blob({format: 'png'});
		const reference = await captureNativeReference(
			{
				...composition,
				width: composition.width * scale,
				height: composition.height * scale,
				component: () => (
					<div
						style={{
							position: 'absolute',
							width: composition.width,
							height: composition.height,
							transform: `scale(${scale})`,
							transformOrigin: '0 0',
						}}
					>
						<Scene />
					</div>
				),
			},
			0,
			{omitBackground: translucent},
		);
		const comparison = await compareNativePixels(reference, actual);

		expect(comparison.mismatchedPixels, id).toBe(0);
	},
);
