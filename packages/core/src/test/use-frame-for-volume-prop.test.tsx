import {renderHook} from '@testing-library/react';
import {vitest, expect, describe, test} from 'vitest';
import {useFrameForVolumeProp} from '../audio/use-frame-for-volume-prop';

describe('useFrameForVolumeProp hook tests', () => {
	test('Media not mounted', () => {
		vitest.mock('../audio/use-media-starts-at', () => {
			return {
				useMediaStartsAt: () => -10,
			};
		});

		vitest.mock('../use-frame', () => {
			return {
				useCurrentFrame: () => {
					return 9;
				},
			};
		});
		const {result} = renderHook(() => useFrameForVolumeProp());
		expect(result.current).toEqual(-1);
	});
});
