import {renderHook} from '@testing-library/react-hooks';
import React, {RefObject} from 'react';
import {useMediaTagVolume} from '../use-media-tag-volume';
import anything = jasmine.anything;

describe('Should update state when volume changes', () => {
	const setState = jest.fn();
	const useStateSpy = jest.spyOn(React, 'useState');
	beforeEach(() => {
		// @ts-expect-error
		useStateSpy.mockImplementation(init => [init, setState]);
	});
	afterEach(() => {
		useStateSpy.mockRestore();
	});

	test('has the volume been set', async () => {
		const addEventListener = jest.fn();
		const removeEventListener = jest.fn();
		let audioRef = ({
			current: {volume: 0.5, addEventListener, removeEventListener},
		} as unknown) as RefObject<HTMLAudioElement>;

		const {rerender} = renderHook(({mediaRef}) => useMediaTagVolume(mediaRef), {
			initialProps: {mediaRef: audioRef},
		});

		expect(setState).toHaveBeenCalledWith(0.5);
		audioRef = {
			current: {...audioRef.current, volume: 0.75},
		} as RefObject<HTMLAudioElement>;
		rerender({mediaRef: audioRef});
		expect(setState).toHaveBeenCalledWith(0.75);
		expect(addEventListener).toHaveBeenCalledWith('volumechange', anything());
		expect(removeEventListener).toHaveBeenCalledWith('volumechange', anything());
	});
});

test('Should listen for volume changes', () => {
	const addEventListener = jest.fn();
	const removeEventListener = jest.fn();
	const audioRef = ({
		current: {volume: 0.5, addEventListener, removeEventListener},
	} as unknown) as RefObject<HTMLAudioElement>;

	renderHook(({mediaRef}) => useMediaTagVolume(mediaRef), {
		initialProps: {mediaRef: audioRef},
	});

	expect(addEventListener).toHaveBeenCalledTimes(1);
});
