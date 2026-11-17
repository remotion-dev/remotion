import {AbsoluteFill} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {captureNativeReference, compareNativePixels} from './native-reference';

const cases: Record<string, React.CSSProperties> = {
	spread: {boxShadow: '0 0 0 12px #e11d48'},
	'negative spread': {boxShadow: '0 18px 0 -8px #000'},
	inset: {boxShadow: 'inset 10px 10px 0 0 #16a34a'},
	'inset spread': {boxShadow: 'inset 0 0 0 8px #9333ea'},
	'inset with border': {
		boxShadow: 'inset 6px 6px 0 0 #16a34a',
		border: '5px solid #000',
	},
	'inset and outer layers': {
		boxShadow: 'inset 0 0 0 6px #f59e0b, 0 0 0 6px #0ea5e9',
	},
};

test.for(Object.entries(cases))(
	'matches native box-shadow: %s',
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
							width: 90,
							height: 70,
							backgroundColor: '#f1f5f9',
							...style,
						}}
					>
						<div style={{width: 30, height: 30, backgroundColor: '#64748b'}} />
					</div>
				</AbsoluteFill>
			),
			id: `box-shadow-${name.replace(/\s+/g, '-')}`,
			width: 160,
			height: 140,
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

		expect(
			(await compareNativePixels(reference, actual)).mismatchedPixels,
		).toBe(0);
	},
);
