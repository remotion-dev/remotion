import {AbsoluteFill} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {captureNativeReference, countNativePixels} from './native-reference';

const cases: Record<string, React.CSSProperties> = {
	'linear gradient': {
		maskImage: 'linear-gradient(to right, black, transparent)',
	},
	'linear gradient with px stops': {
		maskImage: 'linear-gradient(to right, black 20px, transparent 60px)',
	},
	'two gradient layers': {
		maskImage:
			'linear-gradient(to right, black, transparent), linear-gradient(to bottom, black 30%, transparent 30%)',
	},
	'radial gradient': {
		maskImage: 'radial-gradient(circle, black 40%, transparent 41%)',
	},
	'conic gradient': {
		maskImage: 'conic-gradient(black 25%, transparent 25%)',
	},
	'sized and repeated gradient': {
		maskImage: 'linear-gradient(black, transparent)',
		maskSize: '50% 50%',
		maskRepeat: 'repeat',
	},
	'none and gradient layers': {
		maskImage: 'none, radial-gradient(circle, black 40%, transparent 41%)',
	},
};

test.for(Object.entries(cases))(
	'matches native mask-image: %s',
	async ([name, style], t) => {
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
					<div
						style={{
							width: 120,
							height: 90,
							background: 'linear-gradient(90deg, #e11d48, #2563eb)',
							...style,
						}}
					/>
				</AbsoluteFill>
			),
			id: `mask-${name.replace(/[^a-z0-9]+/gi, '-')}`,
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

		// The browser may round a masked color channel differently by 1.
		expect(
			(await countNativePixels(reference, actual)).maxChannelDelta,
		).toBeLessThanOrEqual(2);
	},
);
