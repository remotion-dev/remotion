/**
 * @vitest-environment jsdom
 */
import {renderHook} from '@testing-library/react';
import type {RefObject} from 'react';
import {expect, test, vitest} from 'vitest';
import {useMediaTagVolume} from '../use-media-tag-volume.js';

test('Should listen for volume changes', () => {
	const addEventListener = vitest.fn();
	const removeEventListener = vitest.fn();
	const audioRef = {
		current: {volume: 0.5, addEventListener, removeEventListener},
	} as unknown as RefObject<HTMLAudioElement>;

	renderHook(({mediaRef}) => useMediaTagVolume(mediaRef), {
		initialProps: {mediaRef: audioRef},
	});

	expect(addEventListener).toHaveBeenCalledTimes(1);
});
