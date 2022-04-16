// @ts-expect-error
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import {render} from '@testing-library/react';
import React from 'react';
import {beforeEach, describe, expect, test, vitest} from 'vitest';
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
		const registerAsset = vitest.fn();
		const unregisterAsset = vitest.fn();
		const MockProvider: React.FC<{
			children: React.ReactNode;
		}> = ({children}) => {
			return (
				<Internals.CompositionManager.Provider
					value={
						// eslint-disable-next-line react/jsx-no-constructed-context-values
						{
							registerAsset,
							unregisterAsset,
						} as unknown as CompositionManagerContext
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

	test('register and unregister asset', () => {
		const props = {
			src: 'test',
			muted: false,
			volume: 50,
		};
		const {unmount} = render(
			<mockContext.MockProvider>
				<AudioForRendering {...props} />
			</mockContext.MockProvider>
		);

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
			render(
				<mockContext.MockProvider>
					<AudioForRendering {...props} />
				</mockContext.MockProvider>
			);
		}, /No src passed/);
		expect(mockContext.registerAsset).not.toHaveBeenCalled();
		expect(mockContext.unregisterAsset).not.toHaveBeenCalled();
	});
});
