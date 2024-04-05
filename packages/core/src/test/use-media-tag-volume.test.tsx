import {expect, mock, test} from 'bun:test';
import type {RefObject} from 'react';
import {useMediaTagVolume} from '../use-media-tag-volume.js';
import {renderHook} from './render-hook.js';

test('Should listen for volume changes', () => {
	const addEventListener = mock();
	const removeEventListener = mock();
	const audioRef = {
		current: {volume: 0.5, addEventListener, removeEventListener},
	} as unknown as RefObject<HTMLAudioElement>;

	renderHook(({mediaRef}) => useMediaTagVolume(mediaRef), {
		initialProps: {mediaRef: audioRef},
	});

	expect(addEventListener).toHaveBeenCalledTimes(1);
});
