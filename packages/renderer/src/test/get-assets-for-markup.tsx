import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import React, {
	act,
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import type {CompositionManagerContext, TRenderAsset} from 'remotion';
import {Internals} from 'remotion';

// @ts-expect-error
global.IS_REACT_ACT_ENVIRONMENT = true;

let collectAssets = (): TRenderAsset[] => [];

const waitForWindowToBeReady = () => {
	return new Promise<void>((resolve) => {
		let interval: Timer | null = null;
		const check = () => {
			if (window.remotion_renderReady) {
				clearInterval(interval as Timer);
				resolve();
			}
		};

		interval = setInterval(check, 5);
	});
};

const ID = 'markup';

export const getAssetsForMarkup = async (
	Markup: React.FC,
	config: {
		durationInFrames: number;
		width: number;
		height: number;
		fps: number;
	},
) => {
	const collectedAssets: TRenderAsset[][] = [];
	const Wrapped = () => {
		window.remotion_audioEnabled = true;
		window.remotion_videoEnabled = true;
		const [renderAssets, setAssets] = useState<TRenderAsset[]>([]);

		const registerRenderAsset = useCallback((renderAsset: TRenderAsset) => {
			Internals.validateRenderAsset(renderAsset);
			setAssets((assts) => {
				return [...assts, renderAsset];
			});
		}, []);
		const unregisterRenderAsset = useCallback((id: string) => {
			setAssets((assts) => {
				return assts.filter((a) => a.id !== id);
			});
		}, []);
		useLayoutEffect(() => {
			if (typeof window !== 'undefined') {
				collectAssets = () => {
					act(() => {
						setAssets([]); // clear assets at next render
					});
					return renderAssets;
				};
			}
		}, [renderAssets]);
		const compositions = useContext(Internals.CompositionManager);

		const value: CompositionManagerContext = useMemo(() => {
			return {
				...compositions,
				compositions: [
					{
						...config,
						id: ID,
						component: React.lazy(() =>
							Promise.resolve({
								default: Markup as ComponentType<unknown>,
							}),
						),
						nonce: 0,
						defaultProps: undefined,
						folderName: null,
						parentFolderName: null,
						schema: null,
						calculateMetadata: null,
						durationInFrames: config.durationInFrames,
						fps: config.fps,
						height: config.height,
						width: config.width,
					},
				],
				canvasContent: {
					type: 'composition',
					compositionId: 'markup',
				},
			};
		}, [compositions]);

		const assetContext = useMemo(() => {
			return {renderAssets, registerRenderAsset, unregisterRenderAsset};
		}, [renderAssets, registerRenderAsset, unregisterRenderAsset]);

		return (
			<Internals.CanUseRemotionHooksProvider>
				<Internals.RemotionRoot numberOfAudioTags={0} logLevel="info">
					<Internals.CompositionManager.Provider value={value}>
						<Internals.RenderAssetManager.Provider value={assetContext}>
							<Internals.ResolveCompositionConfig>
								<Markup />
							</Internals.ResolveCompositionConfig>
						</Internals.RenderAssetManager.Provider>
					</Internals.CompositionManager.Provider>
				</Internals.RemotionRoot>
			</Internals.CanUseRemotionHooksProvider>
		);
	};

	render(<Wrapped />);
	for (
		let currentFrame = 0;
		currentFrame < config.durationInFrames;
		currentFrame++
	) {
		act(() => {
			window.remotion_setFrame(currentFrame, ID, 1);
		});
		await waitForWindowToBeReady();
		collectedAssets.push(collectAssets());
	}

	return collectedAssets;
};
