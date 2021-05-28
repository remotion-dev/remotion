import {render} from '@testing-library/react';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {act} from 'react-dom/test-utils';
import {Internals, TAsset} from 'remotion';
import {LooseAnyComponent} from 'remotion/src/any-component';

let collectAssets = (): TAsset[] => [];

const waitForWindowToBeReady = () => {
	return new Promise<void>((resolve) => {
		let interval: null | number | NodeJS.Timeout = null;
		const check = () => {
			if (window.ready) {
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

		const value = useMemo(() => {
			return {
				...compositions,
				assets,
				registerAsset,
				unregisterAsset,
				compositions: [
					{
						...config,
						id: 'markup',
						component: React.lazy(() =>
							Promise.resolve({
								default: Markup as LooseAnyComponent<unknown>,
							})
						),
						nonce: 0,
					},
				],
				currentComposition: 'markup',
			};
		}, [assets, compositions, registerAsset, unregisterAsset]);

		return (
			<Internals.RemotionRoot>
				<Internals.CompositionManager.Provider value={value}>
					<Markup />
				</Internals.CompositionManager.Provider>
			</Internals.RemotionRoot>
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
