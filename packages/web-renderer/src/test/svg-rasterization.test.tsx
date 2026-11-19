import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgRasterizationScenes} from './fixtures/svg-rasterization';
import {captureNativeReference, compareNativePixels} from './native-reference';

for (const scene of svgRasterizationScenes) {
	test(
		'preserves native fractional SVG rasterization in ' + scene.id,
		async () => {
			const Component = scene.component;
			const reference = await captureNativeReference(
				{
					...scene,
					id: scene.id + '-fractional',
					width: 500,
					height: 200,
					component: () => (
						<div
							style={{
								position: 'absolute',
								width: 400,
								height: 160,
								transform: 'scale(1.25)',
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
			const still = await renderStillOnWeb({
				composition: scene,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				scale: 1.25,
			});
			const actual = await still.blob({format: 'png'});
			expect(
				(await compareNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
		},
	);
}
