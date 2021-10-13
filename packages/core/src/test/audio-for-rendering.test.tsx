import {createEvent, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {AudioForRendering} from '../audio/AudioForRendering';
import {CompositionManagerContext} from '../CompositionManager';
import {Internals} from '../internals';
import {expectToThrow} from './expect-to-throw';

interface MockCompositionManagerContext {
	MockProvider: Function;
	registerAsset: Function;
	unregisterAsset: Function;
}

let mockContext: MockCompositionManagerContext;

describe('Register and unregister asset', () => {
	function createMockContext(): MockCompositionManagerContext {
		const registerAsset = jest.fn();
		const unregisterAsset = jest.fn();
		const MockProvider: React.FC = ({children}) => {
			return (
				<Internals.CompositionManager.Provider
					value={
						// eslint-disable-next-line react/jsx-no-constructed-context-values
						({
							registerAsset,
							unregisterAsset,
						} as unknown) as CompositionManagerContext
					}
				>
					{children}
				</Internals.CompositionManager.Provider>
			);
		};

		return {
			MockProvider,
			registerAsset,
			unregisterAsset,
		};
	}

	beforeEach(() => {
		mockContext = createMockContext();
	});

	// JSDOM doesn't simulate browser events, `currentSrc` is always empty,
	// so we can't assert the registration and unregistration of assets.
	test('register and unregister asset', () => {
		const props = {
			src: 'test',
			muted: false,
			volume: 50,
		};

		Object.defineProperty(
			global.window.HTMLMediaElement.prototype,
			'currentSrc',
			{
				get() {
					return this.src;
				},
			}
		);

		const {container, unmount} = render(
			<mockContext.MockProvider>
				<AudioForRendering {...props} />
			</mockContext.MockProvider>
		);

		const audioEl = container.querySelector('audio') as HTMLAudioElement;

		// Dispatch the `loadedmetadata` event manually
		// since JSDOM doesn't support these events
		fireEvent(audioEl, createEvent.loadedMetadata(audioEl));

		expect(mockContext.registerAsset).toHaveBeenCalled();
		unmount();
		expect(mockContext.unregisterAsset).toHaveBeenCalled();
	});

	test('no src passed', () => {
		const props = {
			src: undefined,
			muted: false,
			volume: 50,
		};
		expectToThrow(() => {
			const {container} = render(
				<mockContext.MockProvider>
					<AudioForRendering {...props} />
				</mockContext.MockProvider>
			);

			const audioEl = container.querySelector('audio') as HTMLAudioElement;

			// Dispatch the `loadedmetadata` event manually
			// since JSDOM doesn't support these events
			fireEvent(audioEl, createEvent.loadedMetadata(audioEl));
		}, /No src found/);
		expect(mockContext.registerAsset).not.toHaveBeenCalled();
		expect(mockContext.unregisterAsset).not.toHaveBeenCalled();
	});
});

let mockUseEffect: Function;
describe('useEffect tests', () => {
	const useEffectSpy = jest.spyOn(React, 'useEffect');
	mockUseEffect = jest.fn();
	beforeAll(() => {
		useEffectSpy.mockImplementation(() => {
			mockUseEffect();
		});
	});
	afterAll(() => {
		useEffectSpy.mockRestore();
	});
	test('has registered', () => {
		const props = {
			src: 'test',
			muted: false,
			volume: 50,
		};
		render(<AudioForRendering {...props} />);
		expect(mockUseEffect).toHaveBeenCalled();
	});
});
