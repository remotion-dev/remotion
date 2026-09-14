import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {AudioForRendering} from '../audio/AudioForRendering.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import {Freeze} from '../freeze.js';
import {RenderAssetManager} from '../RenderAssetManager.js';
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
						{children}
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
			onNativeError: mock(),
			audioStreamIndex: 0,
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

	test('does not register a frozen audio asset', () => {
		const props = {
			src: 'test',
			muted: false,
			volume: 1,
			onDuration: mock(),
			onNativeError: mock(),
			audioStreamIndex: 0,
		};
		render(
			<CanUseRemotionHooksProvider>
				<mockContext.MockProvider>
					<Freeze frame={20}>
						<AudioForRendering {...props} />
					</Freeze>
				</mockContext.MockProvider>
			</CanUseRemotionHooksProvider>,
		);

		expect(mockContext.registerRenderAsset).not.toHaveBeenCalled();
	});

	test('no src passed', () => {
		const props = {
			src: undefined,
			muted: false,
			volume: 50,
			onDuration: mock(),
			onNativeError: mock(),
			audioStreamIndex: 0,
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
