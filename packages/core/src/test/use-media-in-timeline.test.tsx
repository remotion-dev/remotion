import {createEvent, fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {AudioForRendering} from '../audio/AudioForRendering';
import {CompositionManagerContext} from '../CompositionManager';
import {Internals} from '../internals';
import {useMediaInTimeline} from '../use-media-in-timeline';
import * as useVideoConfigModule from '../use-video-config';

beforeAll(() => {
	jest.spyOn(useVideoConfigModule, 'useVideoConfig').mockImplementation(() => ({
		width: 10,
		height: 10,
		fps: 30,
		durationInFrames: 100,
	}));

	Object.defineProperty(
		global.window.HTMLMediaElement.prototype,
		'currentSrc',
		{
			get() {
				return this.src;
			},
		}
	);
});
afterAll(() => {
	jest.spyOn(useVideoConfigModule, 'useVideoConfig').mockClear();
});

// JSDOM doesn't simulate browser events, `currentSrc` is always empty,
// so we can't assert the registration and unregistration of assets.
test('useMediaInTimeline registers and unregisters new sequence', () => {
	const registerAsset = jest.fn();
	const unregisterAsset = jest.fn();
	const registerSequence = jest.fn();
	const unregisterSequence = jest.fn();
	const Wrapper: React.FC = ({children}) => (
		<Internals.CompositionManager.Provider
			value={
				// eslint-disable-next-line react/jsx-no-constructed-context-values
				({
					registerAsset,
					unregisterAsset,
					registerSequence,
					unregisterSequence,
				} as unknown) as CompositionManagerContext
			}
		>
			{children}
		</Internals.CompositionManager.Provider>
	);

	const Child = () => {
		const audioRef = useRef<HTMLAudioElement>(null);

		useMediaInTimeline({
			volume: 1,
			mediaVolume: 1,
			mediaType: 'audio',
			mediaRef: audioRef,
		});

		return <AudioForRendering ref={audioRef} src="/test" />;
	};

	const {container, unmount} = render(
		<Wrapper>
			<Child />
		</Wrapper>
	);

	const audioEl = container.querySelector('audio') as HTMLAudioElement;

	// Dispatch the `loadedmetadata` event manually
	// since JSDOM doesn't support these events
	fireEvent(audioEl, createEvent.loadedMetadata(audioEl));

	expect(registerSequence).toHaveBeenCalled();
	unmount();
	expect(unregisterSequence).toHaveBeenCalled();
});
