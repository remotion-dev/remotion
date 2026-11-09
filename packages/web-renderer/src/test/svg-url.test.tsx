import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	svgUrlBlurredCover,
	svgUrlNonzeroViewbox,
} from './fixtures/svg-url-nonzero-viewbox';
import {compareNativePixels, savePixelEvidence} from './native-reference';
import {testImage} from './utils';

test('should render an SVG loaded from a URL', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgUrlNonzeroViewbox,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-url-nonzero-viewbox'});
});

test('should not clip the blur of a cropped SVG loaded from a URL', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgUrlBlurredCover,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-url-blurred-cover'});
});

// KINO-7764: SVG MIME token casing must not change identical vector content.
test.for(
	[false, true].flatMap((cover) => [0, 1].map((frame) => ({cover, frame}))),
)(
	'preserves SVG data MIME casing (cover:$cover, frame:$frame)',
	async ({cover, frame}) => {
		const svg = await (await fetch(staticFile('nonzero-viewbox.svg'))).text();
		const fixture = (uppercase: boolean) => {
			const Component = () => {
				const current = useCurrentFrame();
				return (
					<AbsoluteFill style={{backgroundColor: 'white'}}>
						<div
							style={{
								position: 'absolute',
								left: 8 + current,
								top: 8 + current,
								width: 80,
								height: 80,
								transform: 'scale(1.5)',
								transformOrigin: '0 0',
							}}
						>
							<AbsoluteFill
								style={{
									backgroundColor: 'white',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Img
									src={`data:${uppercase ? 'IMAGE/SVG+XML' : 'image/svg+xml'};charset=utf-8,${encodeURIComponent(svg)}`}
									style={
										cover
											? {
													width: 50,
													height: 30,
													objectFit: 'cover',
													filter: 'blur(4px)',
												}
											: {width: 65, height: 78}
									}
								/>
							</AbsoluteFill>
						</div>
					</AbsoluteFill>
				);
			};

			return {
				component: Component,
				id: 'svg-data-mime-case',
				width: 160,
				height: 160,
				fps: 25,
				durationInFrames: 2,
			};
		};

		const render = async (uppercase: boolean) =>
			(
				await renderStillOnWeb({
					composition: fixture(uppercase),
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const reference = await render(false);
		const actual = await render(true);
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels > 0) {
			const id = `svg-mime-${cover}-${frame}`;
			await savePixelEvidence(reference, `${id}-reference`);
			await savePixelEvidence(actual, `${id}-actual`);
			await savePixelEvidence(result.diff, `${id}-diff`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);
