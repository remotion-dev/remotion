/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {act} from 'react-dom/test-utils';
import type {CompositionManagerContext, TAsset} from 'remotion';
import {Internals} from 'remotion';

// @ts-expect-error
global.IS_REACT_ACT_ENVIRONMENT = true;

let collectAssets = (): TAsset[] => [];

const waitForWindowToBeReady = () => {
	return new Promise<void>((resolve) => {
		let interval: null | number | NodeJS.Timeout = null;
		const check = () => {
			if (window.remotion_renderReady) {
				clearInterval(interval as number);
				resolve();
			}
		};

		interval = setInterval(check, 5);
	});
};

export const getAssetsForMarkup = async (
	Markup: React.FC,
	config: {
		durationInFrames: number;
		width: number;
		height: number;
		fps: number;
	}
) => {
	const collectedAssets: TAsset[][] = [];
	const Wrapped = () => {
		window.remotion_audioEnabled = true;
		window.remotion_videoEnabled = true;
		const [assets, setAssets] = useState<TAsset[]>([]);

		const registerAsset = useCallback((asset: TAsset) => {
			setAssets((assts) => {
				return [...assts, asset];
			});
		}, []);
		const unregisterAsset = useCallback((id: string) => {
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
					return assets;
				};
			}
		}, [assets]);
		const compositions = useContext(Internals.CompositionManager);

		const value: CompositionManagerContext = useMemo(() => {
			return {
				...compositions,
				compositions: [
					{
						...config,
						id: 'markup',
						component: React.lazy(() =>
							Promise.resolve({
								default: Markup as ComponentType<unknown>,
							})
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
				currentComposition: 'markup',
			};
		}, [compositions]);

		const assetContext = useMemo(() => {
			return {assets, registerAsset, unregisterAsset};
		}, [assets, registerAsset, unregisterAsset]);

		return (
			<Internals.CanUseRemotionHooksProvider>
				<Internals.RemotionRoot numberOfAudioTags={0}>
					<Internals.CompositionManager.Provider value={value}>
						<Internals.AssetManager.Provider value={assetContext}>
							<Internals.ResolveCompositionConfig>
								<Markup />
							</Internals.ResolveCompositionConfig>
						</Internals.AssetManager.Provider>
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
			window.remotion_setFrame(currentFrame);
		});
		await waitForWindowToBeReady();
		collectedAssets.push(collectAssets());
	}

	return collectedAssets;
};
