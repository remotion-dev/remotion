import {useEffect, useState} from 'react';
import {HtmlInCanvas} from 'remotion';

export type HtmlInCanvasDocsDemoBranch = 'pending' | 'live' | 'fallback';

/**
 * Avoid SSR/client hydration mismatch: support is only known after mount.
 */
export const useHtmlInCanvasDocsDemoBranch = (): HtmlInCanvasDocsDemoBranch => {
	const [branch, setBranch] = useState<HtmlInCanvasDocsDemoBranch>('pending');

	useEffect(() => {
		setBranch(HtmlInCanvas.isSupported() ? 'live' : 'fallback');
	}, []);

	return branch;
};
