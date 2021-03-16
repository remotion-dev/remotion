import {render} from '@testing-library/react';
import React, {useCallback, useContext, useLayoutEffect, useState} from 'react';
import {act} from 'react-dom/test-utils';
import {Internals, TAsset} from 'remotion';

let collectAssets = (): TAsset[] => [];

export const getAssetsForMarkup = (Markup: React.FC) => {
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

		return (
			<Internals.RemotionRoot>
				<Internals.CompositionManager.Provider
					value={{
						...compositions,
						assets,
						registerAsset,
						unregisterAsset,
						compositions: [
							{
								durationInFrames: 60,
								fps: 30,
								height: 1080,
								width: 1080,
								id: 'markup',
								component: React.lazy(() =>
									Promise.resolve({
										default: Markup as React.ComponentType<unknown>,
									})
								),
							},
						],
						currentComposition: 'markup',
					}}
				>
					<Markup />
				</Internals.CompositionManager.Provider>
			</Internals.RemotionRoot>
		);
	};

	render(<Wrapped />);
	return collectAssets();
};
