import {loadFont} from '@remotion/fonts';
import {AbsoluteFill} from 'remotion';
import {afterEach, expect, test, vi} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {countNativePixels} from './native-reference';

const fontUrl = new URL(
	'../../../example/public/bangers.woff2',
	import.meta.url,
).href;

const Text: React.FC<{fontFamily: string}> = ({fontFamily}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white', fontFamily, fontSize: 42}}>
			Hamburgefonstiv
		</AbsoluteFill>
	);
};

const render = async (fontFamily: string) => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Text,
			id: 'pending-font-load',
			width: 360,
			height: 60,
			fps: 30,
			durationInFrames: 1,
			defaultProps: {fontFamily},
		},
		frame: 0,
		inputProps: {fontFamily},
	});
	return blob({format: 'png'});
};

afterEach(() => {
	vi.unstubAllGlobals();
});

test('waits for a loadFont() call that is still fetching', async () => {
	const fetchFont = window.fetch;
	vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
		if (String(args[0]) === fontUrl) {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		return fetchFont(...args);
	});

	const loading = loadFont({family: 'Pending Bangers', url: fontUrl});
	const whileLoading = await render("'Pending Bangers', serif");
	await loading;
	const afterLoading = await render("'Pending Bangers', serif");
	const fallback = await render('serif');

	expect(
		(await countNativePixels(afterLoading, fallback)).mismatchedPixels,
	).toBeGreaterThan(0);
	expect(
		(await countNativePixels(afterLoading, whileLoading)).mismatchedPixels,
	).toBe(0);
});
