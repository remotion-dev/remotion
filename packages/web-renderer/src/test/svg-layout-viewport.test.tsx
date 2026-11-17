import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgLayoutViewport} from './fixtures/svg-layout-viewport';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for([1, 1.25])(
	'preserves user coordinates when flex layout resizes an SVG at scale %s',
	async (scale) => {
		const still = await renderStillOnWeb({
			composition: svgLayoutViewport,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
			scale,
		});
		const Component = svgLayoutViewport.component;
		const reference = await captureNativeReference(
			{
				...svgLayoutViewport,
				width: svgLayoutViewport.width * scale,
				height: svgLayoutViewport.height * scale,
				component: () => (
					<div
						style={{
							position: 'absolute',
							width: svgLayoutViewport.width,
							height: svgLayoutViewport.height,
							transform: `scale(${scale})`,
							transformOrigin: '0 0',
						}}
					>
						<Component />
					</div>
				),
			},
			0,
			{omitBackground: false},
		);
		const actual = await still.blob({format: 'png'});
		expect(
			(await compareNativePixels(reference, actual)).mismatchedPixels,
		).toBe(0);
	},
);
