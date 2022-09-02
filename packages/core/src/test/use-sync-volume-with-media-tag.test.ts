/**
 * @vitest-environment jsdom
 */
import type {RefObject} from 'react';
import {expect, test, vitest} from 'vitest';
import type {UseSyncVolumeWithMediaTagOptions} from '../use-sync-volume-with-media-tag';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import type {VolumeProp} from '../volume-prop';
import {renderHook} from './render-hook';

test('has the volume been adapted', () => {
	const addEventListener = vitest.fn();
	const removeEventListener = vitest.fn();
	const audioRef = {
		current: {volume: 0.5, addEventListener, removeEventListener},
	} as unknown as RefObject<HTMLAudioElement>;
	const volume = 0.6 as VolumeProp;
	const volumePropFrame = 1;
	const actualVolume = 0.4;

	const initialProps: UseSyncVolumeWithMediaTagOptions = {
		volumePropFrame,
		actualVolume,
		volume,
		mediaRef: audioRef,
		mediaVolume: 1,
	};

	const {rerender} = renderHook(
		(hookProps) => useSyncVolumeWithMediaTag(hookProps),
		{
			initialProps,
		}
	);
	expect(audioRef.current?.volume).toEqual(initialProps.volume);
	const newVolume = 0.5;
	rerender({
		...initialProps,
		volume: newVolume,
	});
	expect(audioRef.current?.volume).toEqual(newVolume);
});

test('volume should not be adapted', () => {
	const addEventListener = vitest.fn();
	const removeEventListener = vitest.fn();
	const audioRef = {
		current: {volume: 0.4, addEventListener, removeEventListener},
	} as unknown as RefObject<HTMLAudioElement>;
	const volume = 0.4 as VolumeProp;
	const volumePropFrame = 1;
	const actualVolume = 0.4;

	const initialProps: UseSyncVolumeWithMediaTagOptions = {
		volumePropFrame,
		actualVolume,
		volume,
		mediaRef: audioRef,
		mediaVolume: 1,
	};

	renderHook((hookProps) => useSyncVolumeWithMediaTag(hookProps), {
		initialProps,
	});
	expect(audioRef.current?.volume).toEqual(initialProps.volume);
});
