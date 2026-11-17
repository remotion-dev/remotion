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

test('fails with the font error when a pending loadFont() call fails', async () => {
	const missingUrl = new URL('/missing-pending-font.woff2', fontUrl).href;
	const fetchFont = window.fetch;
	vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
		if (String(args[0]) === missingUrl) {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		return fetchFont(...args);
	});

	try {
		const loading = loadFont({family: 'Missing Bangers', url: missingUrl});
		const [loadResult, renderResult] = await Promise.allSettled([
			loading,
			render("'Missing Bangers', serif"),
		]);

		expect(loadResult.status).toBe('rejected');
		expect(renderResult.status).toBe('rejected');
		expect(renderResult.status === 'rejected' && renderResult.reason).toBe(
			loadResult.status === 'rejected' && loadResult.reason,
		);
	} finally {
		delete window.remotion_cancelledError;
		delete window.remotion_cancelledErrorObject;
	}
});
