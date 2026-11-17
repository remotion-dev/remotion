import {AbsoluteFill} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {captureNativeReference, countNativePixels} from './native-reference';

const cases: Record<string, string> = {
	'px stops': 'linear-gradient(90deg, #e11d48 20px, #2563eb 60px)',
	'px stops at an angle': 'linear-gradient(30deg, #e11d48 20px, #2563eb 60px)',
	'two-position stops':
		'linear-gradient(90deg, #e11d48 0 33%, #facc15 33% 66%, #2563eb 66%)',
	'unpositioned first stop':
		'linear-gradient(90deg, #e11d48, #16a34a 42%, #2563eb)',
	'stops outside 0-100%': 'linear-gradient(90deg, #e11d48 -50%, #2563eb 150%)',
	'out-of-order stops': 'linear-gradient(90deg, #e11d48 60%, #2563eb 20%)',
	'unpositioned stops between positions':
		'linear-gradient(90deg, #e11d48 10%, #facc15, #16a34a, #2563eb 90%)',
	'radial px stops': 'radial-gradient(circle, #e11d48 10px, #2563eb 30px)',
	'elliptical px stops': 'radial-gradient(#e11d48 10px, #2563eb 50px)',
	'radial stop beyond 100%': 'radial-gradient(circle, #e11d48, #2563eb 150%)',
};

test.for(Object.entries(cases))(
	'matches native gradient: %s',
	async ([name, background], t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		const fixture = {
			component: () => (
				<AbsoluteFill
					style={{
						backgroundColor: 'white',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div style={{width: 120, height: 90, background}} />
				</AbsoluteFill>
			),
			id: `gradient-${name.replace(/[^a-z0-9]+/gi, '-')}`,
			width: 140,
			height: 100,
			fps: 30,
			durationInFrames: 1,
		};
		const reference = await captureNativeReference(fixture, 0, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({
				composition: fixture,
				frame: 0,
				licenseKey: 'free-license',
				inputProps: {},
			})
		).blob({format: 'png'});

		// Canvas and CSS gradients may round a color channel differently by 1.
		expect(
			(await countNativePixels(reference, actual)).maxChannelDelta,
		).toBeLessThanOrEqual(2);
	},
);

test.for([1, 2, 3])(
	'px stops in a gradient mask match percentage stops at scale %s',
	async (scale) => {
		const render = async (maskImage: string) => {
			const result = await renderStillOnWeb({
				composition: {
					component: () => (
						<AbsoluteFill style={{backgroundColor: 'white'}}>
							<div
								style={{
									width: 120,
									height: 40,
									backgroundColor: '#2563eb',
									maskImage,
								}}
							/>
						</AbsoluteFill>
					),
					id: 'gradient-mask-px-scale',
					width: 120,
					height: 40,
					fps: 30,
					durationInFrames: 1,
				},
				frame: 0,
				licenseKey: 'free-license',
				inputProps: {},
				scale,
			});
			return result.blob({format: 'png'});
		};

		const percentage = await render(
			'linear-gradient(90deg, black 0%, transparent 100%)',
		);
		const pixels = await render(
			'linear-gradient(90deg, black 0px, transparent 120px)',
		);
		expect(
			(await countNativePixels(percentage, pixels)).maxChannelDelta,
		).toBeLessThanOrEqual(2);
	},
);
