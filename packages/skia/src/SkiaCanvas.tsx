import {Canvas, Skia} from '@shopify/react-native-skia';
import type {ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import type {Images, TAssetManagerContext} from './asset-manager';
import {AssetManagerContext} from './asset-manager';

interface RemotionCanvasProps {
	images?: ReturnType<typeof require>[];
	typefaces?: string[];
	children: ReactNode | ReactNode[];
	width: number;
	height: number;
}

const resolveAsset = async (
	type: 'font' | 'image' | 'typeface',
	asset: ReturnType<typeof require>
) => {
	const data = await Skia.Data.fromURI(asset);
	return {
		type,
		asset,
		data,
	};
};

export const SkiaCanvas = ({
	children,
	images: assets,
	typefaces,
	height,
	width,
}: RemotionCanvasProps) => {
	const contexts = Internals.useRemotionContexts();
	const [assetMgr, setAssetMgr] = useState<TAssetManagerContext | null>(null);

	useEffect(() => {
		(async () => {
			const data = await Promise.all([
				...(assets ?? []).map((asset) => resolveAsset('image', asset)),
				...(typefaces ?? []).map((asset) => resolveAsset('typeface', asset)),
			]);
			const tf = data
				.filter(({type}) => type === 'typeface')
				.map((a) => {
					// eslint-disable-next-line new-cap
					const result = Skia.Typeface.MakeFreeTypeFaceFromData(a.data);
					if (!result) {
						console.log({a});
						throw new Error('Could not create typeface');
					}

					return result;
				});
			const images = data
				.filter(({type}) => type === 'image')
				.reduce((acc, image, index) => {
					// eslint-disable-next-line new-cap
					const result = Skia.Image.MakeImageFromEncoded(image.data);
					if (!result) {
						throw new Error('Could not load image');
					}

					acc[(assets ?? [])[index]] = result;
					return acc;
				}, {} as Images);
			setAssetMgr({images, typefaces: tf});
		})();
	}, [assets, typefaces]);

	const style = useMemo(() => {
		return {
			width,
			height,
		};
	}, [height, width]);

	if (assetMgr === null) {
		return null;
	}

	return (
		<Canvas style={style} mode="continuous">
			<Internals.RemotionContextProvider contexts={contexts}>
				<AssetManagerContext.Provider value={assetMgr}>
					{children}
				</AssetManagerContext.Provider>
			</Internals.RemotionContextProvider>
		</Canvas>
	);
};
