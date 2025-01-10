import {cleanup, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';
import React from 'react';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import {RenderAssetManager} from '../RenderAssetManager.js';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';
import {AudioForRendering} from '../audio/AudioForRendering.js';
import {expectToThrow} from './expect-to-throw.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

interface MockCompositionManagerContext {
	MockProvider: React.FC<{children: React.ReactNode}>;
	registerRenderAsset: Function;
	unregisterRenderAsset: Function;
}
let mockContext: MockCompositionManagerContext;

afterEach(() => {
	cleanup();
});

describe('Register and unregister asset', () => {
	function createMockContext(): MockCompositionManagerContext {
		const registerRenderAsset = mock();
		const unregisterRenderAsset = mock();
		window.remotion_audioEnabled = true;
		const MockProvider: React.FC<{
			readonly children: React.ReactNode;
		}> = ({children}) => {
			return (
				<WrapSequenceContext>
					<RenderAssetManager.Provider
						// eslint-disable-next-line react/jsx-no-constructed-context-values
						value={{
							registerRenderAsset,
							unregisterRenderAsset,
							renderAssets: [],
						}}
					>
						<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
					</RenderAssetManager.Provider>
				</WrapSequenceContext>
			);
		};

		return {
			MockProvider,
			registerRenderAsset,
			unregisterRenderAsset,
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
			onDuration: mock(),
		};
		const {unmount} = render(
			<CanUseRemotionHooksProvider>
				<mockContext.MockProvider>
					<AudioForRendering {...props} />
				</mockContext.MockProvider>
			</CanUseRemotionHooksProvider>,
		);

		expect(mockContext.registerRenderAsset).toHaveBeenCalled();
		unmount();
		expect(mockContext.unregisterRenderAsset).toHaveBeenCalled();
	});

	test('no src passed', () => {
		const props = {
			src: undefined,
			muted: false,
			volume: 50,
			onDuration: mock(),
		};
		expectToThrow(() => {
			render(
				<CanUseRemotionHooksProvider>
					<mockContext.MockProvider>
						<AudioForRendering {...props} />
					</mockContext.MockProvider>
				</CanUseRemotionHooksProvider>,
			);
		}, /No src passed/);
		expect(mockContext.registerRenderAsset).not.toHaveBeenCalled();
		expect(mockContext.unregisterRenderAsset).not.toHaveBeenCalled();
	});
});
