import {test, expect} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue8650LottieControlChars} from './fixtures/issue-8650-lottie-control-chars';

// Functional check (not a screenshot test) — verifies the SVG rasterizes
// without throwing rather than comparing visual output, since this fix
// targets a crash, not a rendering difference.

test('issue #8650: SVG with U+0003 control chars in aria-label must rasterize without error', async () => {
	const result = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: issue8650LottieControlChars,
		frame: 0,
		inputProps: {},
	});
	const blob = await result.blob({format: 'png'});
	expect(blob.size).toBeGreaterThan(0);
});
