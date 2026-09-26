import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React from 'react';
import {AudioForRendering} from '../audio/AudioForRendering.js';
import {Html5Audio} from '../audio/index.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import {Freeze} from '../freeze.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import type {CollectAssetsRef} from '../RenderAssetManager.js';
import {RenderAssetManagerProvider} from '../RenderAssetManager.js';
import {RenderAssetManager} from '../RenderAssetManager.js';
import {Sequence} from '../Sequence.js';
import {MediaEnabledProvider} from '../use-media-enabled.js';
import {Html5Video} from '../video/index.js';
import {OffthreadVideo} from '../video/OffthreadVideo.js';
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

test('nested Sequence rates preserve source trims when collecting media for rendering', () => {
	const collectAssets = React.createRef<CollectAssetsRef>();
	const environment = {
		isRendering: true,
		isPlayer: false,
		isStudio: false,
		isReadOnlyStudio: false,
		isClientSideRendering: false,
	};

	const composition = (currentFrame: number) => (
		<RemotionEnvironmentContext.Provider value={environment}>
			<MediaEnabledProvider audioEnabled videoEnabled={false}>
				<WrapSequenceContext currentFrame={currentFrame}>
					<RenderAssetManagerProvider collectAssets={collectAssets}>
						<Sequence
							from={10}
							playbackRate={2}
							trimBefore={24}
							durationInFrames={40}
						>
							<Sequence from={12} playbackRate={0.75} durationInFrames={100}>
								<Html5Audio
									src="audio.wav"
									playbackRate={0.5}
									trimBefore={15}
								/>
								<Html5Video
									src="video.mp4"
									playbackRate={0.5}
									trimBefore={15}
								/>
								<OffthreadVideo
									src="offthread.mp4"
									playbackRate={0.5}
									trimBefore={15}
								/>
							</Sequence>
						</Sequence>
					</RenderAssetManagerProvider>
				</WrapSequenceContext>
			</MediaEnabledProvider>
		</RemotionEnvironmentContext.Provider>
	);

	const {rerender} = render(composition(10));
	for (const frame of [10, 25, 26, 49, 50]) {
		if (frame !== 10) {
			rerender(composition(frame));
		}

		let assets: ReturnType<CollectAssetsRef['collectAssets']> = [];
		act(() => {
			assets = collectAssets.current!.collectAssets();
		});
		expect(assets, `frame ${frame}`).toHaveLength(frame === 50 ? 0 : 3);
		for (const asset of assets) {
			if (asset.type !== 'audio' && asset.type !== 'video') {
				throw new Error(`Unexpected asset type: ${asset.type}`);
			}

			expect(asset.frame).toBe(frame);
			expect(asset.playbackRate).toBe(0.75);
			// This is the source frame the renderer samples after preserving trimBefore.
			expect(
				asset.audioStartFrame +
					(asset.mediaFrame - asset.audioStartFrame) * asset.playbackRate,
			).toBe(30.75 + (frame - 25) * 0.75);
		}
	}
});
