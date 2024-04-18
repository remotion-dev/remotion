/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import React from 'react';
import {beforeEach, describe, expect, test, vitest} from 'vitest';
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

describe('Register and unregister asset', () => {
	function createMockContext(): MockCompositionManagerContext {
		const registerRenderAsset = vitest.fn();
		const unregisterRenderAsset = vitest.fn();
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
			onDuration: vitest.fn(),
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
			onDuration: vitest.fn(),
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
